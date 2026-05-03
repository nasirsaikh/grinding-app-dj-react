from decimal import Decimal, ROUND_HALF_UP
from django.core.exceptions import ValidationError
from django.db import models,transaction
from django.db.models import Sum
from django.utils import timezone
from django.utils.translation import get_language

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Customer(TimeStampedModel):
    name = models.CharField(max_length=120)
    mobile = models.CharField(max_length=20, blank=True)
    village = models.CharField(max_length=120, blank=True)
    opening_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.name

    @property
    def udhaar_balance(self):
        given = self.ledger_entries.filter(entry_type=LedgerEntry.EntryType.CREDIT).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        received = self.ledger_entries.filter(entry_type=LedgerEntry.EntryType.DEBIT).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        return Decimal(self.opening_balance) + given - received


class RateCard(TimeStampedModel):
    grain_name = models.CharField(max_length=100, unique=True)
    rate_per_kg = models.DecimalField(max_digits=10, decimal_places=2)
    buyback_per_kg = models.DecimalField(max_digits=10, decimal_places=2)
    active = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.grain_name} - {self.rate_per_kg}/kg"


class GrindingTransaction(TimeStampedModel):
    class PaymentMode(models.TextChoices):
        CASH = 'cash', 'Cash'
        UDHAAR = 'udhaar', 'Udhaar'
        PARTIAL = 'partial', 'Partial'

    class WorkStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        GRINDING_DONE = 'grinding_done', 'Grinding Done'
        DELIVERED = 'delivered', 'Delivered'

    customer = models.ForeignKey(Customer,on_delete=models.PROTECT,related_name='grinding_transactions')
    grain_name = models.ForeignKey(RateCard,on_delete=models.PROTECT,related_name='grinding_name')        
    initial_weight_kg = models.DecimalField(max_digits=10, decimal_places=2)
    final_weight_kg = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    rate_per_kg = models.DecimalField(max_digits=10, decimal_places=2)
    grinding_charge = models.DecimalField(max_digits=12, decimal_places=2, editable=False, default=0)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_mode = models.CharField(max_length=20, choices=PaymentMode.choices, default=PaymentMode.CASH)
    transaction_date = models.DateField(default=timezone.localdate)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20,choices=WorkStatus.choices,default=WorkStatus.PENDING)
    grinding_done_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    delivery_notes = models.TextField(blank=True)    

    def clean(self):
        super().clean()
        if self.grinding_done_at and self.transaction_date:
            grinding_date = self.grinding_done_at.date()
            if grinding_date < self.transaction_date:
                raise ValidationError({"grinding_done_at": "Grinding done date cannot be before transaction date."})

        if self.delivered_at and self.grinding_done_at:
            if self.delivered_at < self.grinding_done_at:
                raise ValidationError({"delivered_at": "Delivered date cannot be before grinding done date."})

    def save(self, *args, **kwargs):
        if self.grain_name_id:self.rate_per_kg = self.grain_name.rate_per_kg
        self.grinding_charge = (Decimal(self.initial_weight_kg or 0) * Decimal(self.rate_per_kg or 0)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def weight_loss_kg(self):
        if self.final_weight_kg in (None, ''):
            return Decimal('0')
        return Decimal(self.initial_weight_kg) - Decimal(self.final_weight_kg)

    @property
    def weight_loss_percent(self):
        if not self.initial_weight_kg or self.final_weight_kg in (None, ''):
            return Decimal('0')
        return (self.weight_loss_kg / Decimal(self.initial_weight_kg)) * Decimal('100')

    @property
    def balance_due(self):
        due = Decimal(self.grinding_charge or 0) - Decimal(self.amount_paid or 0)
        return due if due > 0 else Decimal('0')

    def __str__(self):
        return f"{self.customer.name} - {self.grain_name} - {self.transaction_date}"


class LedgerEntry(TimeStampedModel):
    class EntryType(models.TextChoices):
        CREDIT = 'credit', 'Credit/Udhar Given'
        DEBIT = 'debit', 'Payment Received'

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='ledger_entries')
    entry_type = models.CharField(max_length=10, choices=EntryType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    entry_date = models.DateField(default=timezone.localdate)
    reference = models.CharField(max_length=120, blank=True)
    notes = models.TextField(blank=True)
    # optional but useful
    grinding_transaction = models.ForeignKey(GrindingTransaction,on_delete=models.SET_NULL,null=True,blank=True,related_name='ledger_links')

    def __str__(self):
        return f"{self.customer.name} - {self.entry_type} - {self.amount}"


class ExpenseCategory(models.TextChoices):
    DIESEL = 'diesel', 'Diesel'
    PARTS = 'parts', 'Parts'
    ELECTRICITY = 'electricity', 'Electricity'
    LABOR = 'labor', 'Labor'
    PAYROLL = 'payroll', 'Payroll'
    MAINTENANCE = 'maintenance', 'Maintenance'
    PACKAGING = 'packaging', 'Packaging'
    OTHER = 'other', 'Other'


class Expense(TimeStampedModel):
    category = models.CharField(max_length=30, choices=ExpenseCategory.choices)
    title = models.CharField(max_length=150)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    expense_date = models.DateField(default=timezone.localdate)
    vendor = models.CharField(max_length=120, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} - {self.amount}"


class StockItem(TimeStampedModel):
    class StockType(models.TextChoices):
        RAW = 'raw', 'Raw Material'
        FINISHED = 'finished', 'Finished Goods'
        BYPRODUCT = 'byproduct', 'Byproduct'
        PACKAGING = 'packaging', 'Packaging Material'

    name = models.CharField(max_length=120)
    stock_type = models.CharField(max_length=20, choices=StockType.choices)
    unit = models.CharField(max_length=20, default='kg')
    reorder_level = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    opening_stock = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        unique_together = ('name', 'stock_type')

    def __str__(self):
        return f"{self.name} ({self.stock_type})"

    @property
    def current_stock(self):
        inward = self.movements.filter(movement_type=StockMovement.MovementType.IN).aggregate(total=Sum('quantity'))['total'] or Decimal('0')
        outward = self.movements.filter(movement_type=StockMovement.MovementType.OUT).aggregate(total=Sum('quantity'))['total'] or Decimal('0')
        return Decimal(self.opening_stock) + inward - outward


class StockMovement(TimeStampedModel):
    class MovementType(models.TextChoices):
        IN = 'in', 'Inward'
        OUT = 'out', 'Outward'

    item = models.ForeignKey(StockItem, on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=10, choices=MovementType.choices)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    movement_date = models.DateField(default=timezone.localdate)
    reference = models.CharField(max_length=120, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.item.name} - {self.movement_type} - {self.quantity}"


class UtilityBill(TimeStampedModel):
    bill_month = models.DateField(help_text='Use first day of month')
    meter_reading_start = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    meter_reading_end = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    units_consumed = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    due_date = models.DateField(null=True, blank=True)
    paid = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        self.units_consumed = Decimal(self.meter_reading_end) - Decimal(self.meter_reading_start)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Electricity {self.bill_month:%b %Y}"


class Employee(TimeStampedModel):
    PAY_TYPE_CHOICES = [('daily', 'Daily Wage'), ('monthly', 'Monthly Salary')]
    name = models.CharField(max_length=120)
    mobile = models.CharField(max_length=20, blank=True)
    pay_type = models.CharField(max_length=20, choices=PAY_TYPE_CHOICES)
    rate = models.DecimalField(max_digits=12, decimal_places=2)
    joining_date = models.DateField(default=timezone.localdate)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Attendance(TimeStampedModel):
    STATUS_CHOICES = [('present', 'Present'), ('absent', 'Absent'), ('half_day', 'Half Day')]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    attendance_date = models.DateField(default=timezone.localdate)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='present')
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        unique_together = ('employee', 'attendance_date')

    def __str__(self):
        return f"{self.employee.name} - {self.attendance_date}"


class Payroll(TimeStampedModel):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payrolls')
    month = models.DateField(help_text='Use first day of month')
    payable_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.employee.name} - {self.month:%b %Y}"


class MaintenanceLog(TimeStampedModel):
    machine_name = models.CharField(max_length=120)
    service_type = models.CharField(max_length=120, help_text='Takai, belt replacement, engine servicing, etc.')
    service_date = models.DateField(default=timezone.localdate)
    next_service_due = models.DateField(null=True, blank=True)
    cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.machine_name} - {self.service_type}"


class WastageLog(TimeStampedModel):
    process_name = models.CharField(max_length=120, default='Grinding')
    raw_material = models.CharField(max_length=120)
    input_weight_kg = models.DecimalField(max_digits=12, decimal_places=2)
    output_weight_kg = models.DecimalField(max_digits=12, decimal_places=2)
    wastage_weight_kg = models.DecimalField(max_digits=12, decimal_places=2, editable=False, default=0)
    wastage_reason = models.CharField(max_length=150, blank=True)
    log_date = models.DateField(default=timezone.localdate)

    def save(self, *args, **kwargs):
        self.wastage_weight_kg = Decimal(self.input_weight_kg) - Decimal(self.output_weight_kg)
        super().save(*args, **kwargs)

    @property
    def wastage_percent(self):
        if not self.input_weight_kg:
            return Decimal('0')
        return (Decimal(self.wastage_weight_kg) / Decimal(self.input_weight_kg)) * Decimal('100')

    def __str__(self):
        return f"{self.raw_material} - {self.log_date}"



class UITranslation(models.Model):
    key = models.CharField(max_length=100, unique=True)
    english_text = models.CharField(max_length=255)
    hindi_text = models.CharField(max_length=255, blank=True)
    @property
    def text(self):
        lang = get_language()
        if lang and lang.startswith("hi") and self.hindi_text:
            return self.hindi_text
        return self.english_text