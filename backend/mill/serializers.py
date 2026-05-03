from rest_framework import serializers
from .models import *

class CustomerSerializer(serializers.ModelSerializer):
    udhaar_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    class Meta: model = Customer; fields = '__all__'

class RateCardSerializer(serializers.ModelSerializer):
    class Meta: model = RateCard; fields = '__all__'

class GrindingTransactionSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    grain_label = serializers.CharField(source='grain_name.grain_name', read_only=True)
    weight_loss_kg = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    weight_loss_percent = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    balance_due = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    buyback_per_kg = serializers.DecimalField(source='grain_name.buyback_per_kg',max_digits=10,decimal_places=2,read_only=True)
    class Meta: model = GrindingTransaction; fields = '__all__'; read_only_fields = ['grinding_charge', 'rate_per_kg']

class LedgerEntrySerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    class Meta: model = LedgerEntry; fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta: model = Expense; fields = '__all__'

class StockItemSerializer(serializers.ModelSerializer):
    current_stock = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    class Meta: model = StockItem; fields = '__all__'

class StockMovementSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    class Meta: model = StockMovement; fields = '__all__'

class UtilityBillSerializer(serializers.ModelSerializer):
    class Meta: model = UtilityBill; fields = '__all__'; read_only_fields = ['units_consumed']

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta: model = Employee; fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    class Meta: model = Attendance; fields = '__all__'

class PayrollSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    class Meta: model = Payroll; fields = '__all__'

class MaintenanceLogSerializer(serializers.ModelSerializer):
    class Meta: model = MaintenanceLog; fields = '__all__'

class WastageLogSerializer(serializers.ModelSerializer):
    wastage_percent = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    class Meta: model = WastageLog; fields = '__all__'; read_only_fields = ['wastage_weight_kg']

class UITranslationSerializer(serializers.ModelSerializer):
    text = serializers.CharField(read_only=True)
    class Meta: model = UITranslation; fields = '__all__'
