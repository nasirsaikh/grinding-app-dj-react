from decimal import Decimal
from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from django.http import HttpResponse
from django.shortcuts import get_object_or_404,render
from django.utils import timezone
from .access import *
from .forms import *
from .models import *
from .models_extra import Income
from .services import mark_done,post_customer_payment,post_udhaar
def partial(request):return request.headers.get('HX-Request')=='true'
@login_required
def dashboard(request):
    profile=getattr(request.user,'customer_profile',None)
    if has_role(request.user,CUSTOMER) and profile:return my_account(request)
    today=timezone.localdate();jobs=GrindingTransaction.objects.filter(transaction_date=today);expenses=Expense.objects.filter(expense_date=today).aggregate(v=Sum('amount'))['v'] or 0;income=Income.objects.filter(income_date=today).aggregate(v=Sum('amount'))['v'] or 0
    ctx={'today_jobs':jobs.count(),'pending':GrindingTransaction.objects.exclude(status='delivered').count(),'today_weight':jobs.aggregate(v=Sum('initial_weight_kg'))['v'] or 0,'today_received':jobs.aggregate(v=Sum('amount_paid'))['v'] or 0,'today_expenses':expenses,'today_income':income,'outstanding':sum((c.udhaar_balance for c in Customer.objects.all()),Decimal('0')),'jobs':GrindingTransaction.objects.select_related('customer','grain_name').exclude(status='delivered')[:12]}
    return render(request,'mill/dashboard.html',ctx)
@roles_required(OWNER,MANAGER,OPERATOR,ACCOUNTANT)
def customers(request):
    q=request.GET.get('q','').strip();qs=Customer.objects.all().order_by('name');qs=qs.filter(name__icontains=q) if q else qs;return render(request,'mill/partials/customer_table.html' if partial(request) else 'mill/customers.html',{'customers':qs})
@roles_required(OWNER,MANAGER,OPERATOR)
def customer_create(request):
    form=CustomerForm(request.POST or None)
    if request.method=='POST' and form.is_valid():form.save();return customers(request)
    return render(request,'mill/partials/form.html',{'form':form,'title':'New Customer','submit_url':request.path})
@roles_required(OWNER,MANAGER,OPERATOR,ACCOUNTANT)
def customer_detail(request,pk):return render(request,'mill/customer_detail.html',{'customer':get_object_or_404(Customer,pk=pk)})
@roles_required(OWNER,MANAGER,ACCOUNTANT)
def customer_payment(request,pk):
    customer=get_object_or_404(Customer,pk=pk);form=LedgerPaymentForm(request.POST or None)
    if request.method=='POST' and form.is_valid():post_customer_payment(customer,form.cleaned_data['amount'],form.cleaned_data.get('reference',''),form.cleaned_data.get('notes',''));return render(request,'mill/partials/customer_balance.html',{'customer':customer})
    return render(request,'mill/partials/form.html',{'form':form,'title':'Receive Udhaar Payment','submit_url':request.path})
@roles_required(OWNER,MANAGER,OPERATOR)
def grinding(request):return render(request,'mill/grinding.html',{'jobs':GrindingTransaction.objects.select_related('customer','grain_name').order_by('-transaction_date','-id')[:200]})
@roles_required(OWNER,MANAGER,OPERATOR)
def grinding_create(request):
    form=GrindingForm(request.POST or None)
    if request.method=='POST' and form.is_valid():
        obj=form.save();paid=Decimal(obj.amount_paid or 0);due=max(Decimal(obj.grinding_charge)-paid,Decimal('0'));post_customer_payment(obj.customer,paid,f'Grinding #{obj.pk}','Advance payment',obj);post_udhaar(obj.customer,due,f'Grinding #{obj.pk}','Grinding charge outstanding',obj);return HttpResponse(status=204,headers={'HX-Redirect':'/'})
    return render(request,'mill/partials/form.html',{'form':form,'title':'New Grinding Job','submit_url':request.path})
@roles_required(OWNER,MANAGER,OPERATOR)
def grinding_done(request,pk):mark_done(get_object_or_404(GrindingTransaction,pk=pk),request.POST.get('final_weight_kg'));return HttpResponse(status=204,headers={'HX-Refresh':'true'})
@roles_required(OWNER,MANAGER,ACCOUNTANT)
def expenses(request):return render(request,'mill/expenses.html',{'rows':Expense.objects.order_by('-expense_date','-id')[:200]})
@roles_required(OWNER,MANAGER,ACCOUNTANT)
def expense_create(request):
    form=ExpenseForm(request.POST or None)
    if request.method=='POST' and form.is_valid():form.save();return HttpResponse(status=204,headers={'HX-Refresh':'true'})
    return render(request,'mill/partials/form.html',{'form':form,'title':'Add Expense','submit_url':request.path})
@roles_required(OWNER,MANAGER,ACCOUNTANT)
def incomes(request):return render(request,'mill/income.html',{'rows':Income.objects.order_by('-income_date','-id')[:200]})
@roles_required(OWNER,MANAGER,ACCOUNTANT)
def income_create(request):
    form=IncomeForm(request.POST or None)
    if request.method=='POST' and form.is_valid():form.save();return HttpResponse(status=204,headers={'HX-Refresh':'true'})
    return render(request,'mill/partials/form.html',{'form':form,'title':'Add Income','submit_url':request.path})
@roles_required(OWNER,MANAGER,OPERATOR,ACCOUNTANT)
def inventory(request):return render(request,'mill/inventory.html',{'items':StockItem.objects.all()})
@roles_required(OWNER,MANAGER,ACCOUNTANT)
def reports(request):return render(request,'mill/reports.html',{'customers':Customer.objects.all(),'expenses':Expense.objects.all(),'income':Income.objects.all()})
@login_required
def my_account(request):
    profile=getattr(request.user,'customer_profile',None);return render(request,'mill/my_account.html',{'customer':profile.customer if profile and profile.active else None})
