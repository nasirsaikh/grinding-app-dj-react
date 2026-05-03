from django.contrib import admin
from .models import *

for model in [Customer, RateCard, Expense, StockItem,
              StockMovement, UtilityBill, Employee, Attendance, Payroll, MaintenanceLog,
              WastageLog, UITranslation]:
    admin.site.register(model)

@admin.register(GrindingTransaction)
class MyModelAdmin(admin.ModelAdmin):
    list_display = ('customer', 'grain_name', 'initial_weight_kg','final_weight_kg','rate_per_kg','grinding_charge','amount_paid','payment_mode','transaction_date','status','grinding_done_at','delivered_at')
    list_filter = ('customer', 'grain_name','rate_per_kg','payment_mode','transaction_date','status','grinding_done_at','delivered_at')

@admin.register(LedgerEntry)
class MyModelAdmin(admin.ModelAdmin):
    list_display = ('customer', 'entry_type', 'amount','entry_date','reference','grinding_transaction')