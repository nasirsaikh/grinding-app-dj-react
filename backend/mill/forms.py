from django import forms
from .models import Customer, GrindingTransaction, Expense, LedgerEntry, StockMovement
from .models_extra import Income
class StyledModelForm(forms.ModelForm):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        for f in self.fields.values(): f.widget.attrs.setdefault('class','form-control')
class CustomerForm(StyledModelForm):
    class Meta: model=Customer; fields=['name','mobile','village','opening_balance','notes']
class GrindingForm(StyledModelForm):
    class Meta: model=GrindingTransaction; fields=['customer','grain_name','initial_weight_kg','amount_paid','payment_mode','transaction_date','notes']
class ExpenseForm(StyledModelForm):
    class Meta: model=Expense; fields=['category','title','amount','expense_date','vendor','notes']
class IncomeForm(StyledModelForm):
    class Meta: model=Income; fields=['category','title','amount','income_date','customer','notes']
class LedgerPaymentForm(StyledModelForm):
    class Meta: model=LedgerEntry; fields=['amount','entry_date','reference','notes']
class StockMovementForm(StyledModelForm):
    class Meta: model=StockMovement; fields=['item','movement_type','quantity','unit_cost','movement_date','reference','notes']
