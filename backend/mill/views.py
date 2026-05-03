from rest_framework.decorators import action
from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum, Count
from .models import *
from .serializers import *
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from django.http import JsonResponse
from django.utils.translation import get_language

class CustomerViewSet(viewsets.ModelViewSet): queryset = Customer.objects.all().order_by('-id'); serializer_class = CustomerSerializer
class RateCardViewSet(viewsets.ModelViewSet): queryset = RateCard.objects.all().order_by('grain_name'); serializer_class = RateCardSerializer
#class GrindingTransactionViewSet(viewsets.ModelViewSet): queryset = GrindingTransaction.objects.select_related('customer','grain_name').all().order_by('-transaction_date','-id'); serializer_class = GrindingTransactionSerializer

def make_aware_datetime(value):
    if not value:
        return timezone.now()
    dt = parse_datetime(value)
    if dt is None:
        return timezone.now()
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt, timezone.get_current_timezone())
    return dt


class GrindingTransactionViewSet(viewsets.ModelViewSet):
    queryset = GrindingTransaction.objects.select_related('grain_name').all()
    serializer_class = GrindingTransactionSerializer


    @transaction.atomic
    def perform_create(self, serializer):
        obj = serializer.save()
        customer = obj.customer

        amount_paid = Decimal(obj.amount_paid or 0)

        if amount_paid > 0:
            LedgerEntry.objects.create(
                customer=customer,
                entry_type="credit",
                amount=amount_paid,
                reference=f"Grinding #{obj.id}",
                grinding_transaction=obj,
                notes="Advance grinding payment received"
            )

    @action(detail=True, methods=["post"], url_path="mark-done")
    def mark_done(self, request, pk=None):
        obj = self.get_object()

        done_at = make_aware_datetime(request.data.get("grinding_done_at"))

        if not done_at:
            done_at = timezone.now()

        if obj.transaction_date and done_at.date() < obj.transaction_date:
            return Response(
                {"detail": "Grinding done date cannot be before transaction date."},
                status=status.HTTP_400_BAD_REQUEST
            )

        obj.status = GrindingTransaction.WorkStatus.GRINDING_DONE
        obj.grinding_done_at = done_at
        obj.final_weight_kg = request.data.get("final_weight_kg") or obj.final_weight_kg

        if not obj.final_weight_kg:
            obj.final_weight_kg = obj.initial_weight_kg

        obj.save()

        return Response({"detail": "Grinding marked as done."})

    @action(detail=True, methods=["post"], url_path="deliver")
    @transaction.atomic
    def deliver(self, request, pk=None):
        obj = self.get_object()
        customer = obj.customer

        grinding_charge = Decimal(obj.grinding_charge or 0)
        old_udhaar = Decimal(customer.opening_balance or 0)

        amount_paid = Decimal(str(request.data.get("amount_paid") or 0))
        old_udhaar_paid = Decimal(str(request.data.get("old_udhaar_paid") or 0))

        has_buyback = request.data.get("has_buyback") in [True, "true", "True", 1, "1"]
        buyback_type = request.data.get("buyback_type") or "none"

        buyback_weight = Decimal(str(request.data.get("buyback_weight") or 0))
        buyback_rate = Decimal(str(request.data.get("buyback_rate") or 0))

        if not has_buyback:
            buyback_type = "none"
            buyback_weight = Decimal("0")
            buyback_rate = Decimal("0")

        grain_name_obj = obj.grain_name
        grain_name = str(getattr(grain_name_obj, "name", grain_name_obj) or "").lower()

        allowed_buyback_type = "oil" if "oil" in grain_name else "atta"

        if has_buyback and buyback_type != allowed_buyback_type:
            return Response(
                {"detail": f"Buyback type must be {allowed_buyback_type} for this grinding type."},
                status=status.HTTP_400_BAD_REQUEST
            )

        buyback_amount = (buyback_weight * buyback_rate).quantize(Decimal("0.01"))
        advance_paid = Decimal(obj.amount_paid or 0)
        total_received_for_current = advance_paid + amount_paid + buyback_amount

        if total_received_for_current > grinding_charge:
            return Response(
                {"detail": "Paid amount plus buyback cannot be greater than grinding charge."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if old_udhaar_paid > old_udhaar:
            return Response(
                {"detail": "Old udhaar payment cannot be greater than old udhaar."},
                status=status.HTTP_400_BAD_REQUEST
            )

        remaining_current = grinding_charge - total_received_for_current
        remaining_current = max(remaining_current, Decimal("0.00"))

        final_udhaar = (
            old_udhaar - old_udhaar_paid + remaining_current
        ).quantize(Decimal("0.01"))

        customer.opening_balance = final_udhaar
        customer.save()

        obj.amount_paid = advance_paid + amount_paid
        obj.status = GrindingTransaction.WorkStatus.DELIVERED
        obj.delivered_at = make_aware_datetime(request.data.get("delivered_at"))

        if obj.grinding_done_at and obj.transaction_date:
            if obj.grinding_done_at.date() < obj.transaction_date:
                obj.grinding_done_at = make_aware_datetime(f"{obj.transaction_date}T00:00:00")

        if obj.delivered_at and obj.transaction_date:
            if obj.delivered_at.date() < obj.transaction_date:
                return Response(
                    {"detail": "Delivery date cannot be before transaction date."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        obj.save()

        if amount_paid > 0:
            LedgerEntry.objects.create(
                customer=customer,
                entry_type="credit",
                amount=amount_paid,
                reference=f"Grinding #{obj.id}",
                grinding_transaction=obj,
                notes="Current grinding payment received"
            )

        if old_udhaar_paid > 0:
            LedgerEntry.objects.create(
                customer=customer,
                entry_type="credit",
                amount=old_udhaar_paid,
                reference="Old udhaar payment",
                notes="Old udhaar adjusted during delivery"
            )

        if remaining_current > 0:
            LedgerEntry.objects.create(
                customer=customer,
                entry_type="debit",
                amount=remaining_current,
                reference=f"Grinding #{obj.id}",
                grinding_transaction=obj,
                notes="Remaining grinding amount added to udhaar"
            )

        if has_buyback and buyback_type in ["oil", "atta"] and buyback_amount > 0:
            Expense.objects.create(
                category="other",
                title=f"{buyback_type.upper()} buyback from {customer.name}",
                amount=buyback_amount,
                notes=f"{buyback_weight} kg × {buyback_rate}"
            )

            stock_name = "Oil" if buyback_type == "oil" else "Atta"

            stock_item, _ = StockItem.objects.get_or_create(
                name=stock_name,
                defaults={
                    "stock_type": "byproduct",
                    "unit": "kg",
                    "reorder_level": 0,
                    "opening_stock": 0
                }
            )

            StockMovement.objects.create(
                item=stock_item,
                movement_type="in",
                quantity=buyback_weight,
                unit_cost=buyback_rate,
                reference=f"Buyback from Grinding #{obj.id}",
                notes=f"{buyback_type} buyback"
            )

        return Response({
            "detail": "Delivered successfully.",
            "old_udhaar": old_udhaar,
            "old_udhaar_paid": old_udhaar_paid,
            "grinding_charge": grinding_charge,
            "advance_paid": advance_paid,
            "delivery_paid": amount_paid,
            "amount_paid": obj.amount_paid,
            "has_buyback": has_buyback,
            "buyback_type": buyback_type,
            "buyback_weight": buyback_weight,
            "buyback_rate": buyback_rate,
            "buyback_amount": buyback_amount,
            "added_to_udhaar": remaining_current,
            "final_udhaar": final_udhaar,
        })


class LedgerEntryViewSet(viewsets.ModelViewSet): queryset = LedgerEntry.objects.select_related('customer').all().order_by('-entry_date','-id'); serializer_class = LedgerEntrySerializer
class ExpenseViewSet(viewsets.ModelViewSet): queryset = Expense.objects.all().order_by('-expense_date','-id'); serializer_class = ExpenseSerializer
class StockItemViewSet(viewsets.ModelViewSet): queryset = StockItem.objects.all().order_by('name'); serializer_class = StockItemSerializer
class StockMovementViewSet(viewsets.ModelViewSet): queryset = StockMovement.objects.select_related('item').all().order_by('-movement_date','-id'); serializer_class = StockMovementSerializer
class UtilityBillViewSet(viewsets.ModelViewSet): queryset = UtilityBill.objects.all().order_by('-bill_month'); serializer_class = UtilityBillSerializer
class EmployeeViewSet(viewsets.ModelViewSet): queryset = Employee.objects.all().order_by('name'); serializer_class = EmployeeSerializer
class AttendanceViewSet(viewsets.ModelViewSet): queryset = Attendance.objects.select_related('employee').all().order_by('-attendance_date'); serializer_class = AttendanceSerializer
class PayrollViewSet(viewsets.ModelViewSet): queryset = Payroll.objects.select_related('employee').all().order_by('-month'); serializer_class = PayrollSerializer
class MaintenanceLogViewSet(viewsets.ModelViewSet): queryset = MaintenanceLog.objects.all().order_by('-service_date'); serializer_class = MaintenanceLogSerializer
class WastageLogViewSet(viewsets.ModelViewSet): queryset = WastageLog.objects.all().order_by('-log_date'); serializer_class = WastageLogSerializer
class UITranslationViewSet(viewsets.ModelViewSet): queryset = UITranslation.objects.all().order_by('key'); serializer_class = UITranslationSerializer

@api_view(['GET'])
def dashboard(request):
    return Response({
        'customers': Customer.objects.count(),
        'transactions': GrindingTransaction.objects.count(),
        'pending_jobs': GrindingTransaction.objects.filter(status=GrindingTransaction.WorkStatus.PENDING).count(),
        'delivered_jobs': GrindingTransaction.objects.filter(status=GrindingTransaction.WorkStatus.DELIVERED).count(),
        'revenue': GrindingTransaction.objects.aggregate(v=Sum('amount_paid'))['v'] or 0,
        'expenses': Expense.objects.aggregate(v=Sum('amount'))['v'] or 0,
        'stock_items': StockItem.objects.count(),
        'employees': Employee.objects.filter(active=True).count(),
    })


