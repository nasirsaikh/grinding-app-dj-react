from rest_framework.routers import DefaultRouter
from django.urls import include,path
from .views_api import *
router=DefaultRouter()
for prefix,view in [('customers',CustomerViewSet),('rate-cards',RateCardViewSet),('grinding-transactions',GrindingTransactionViewSet),('ledger',LedgerEntryViewSet),('expenses',ExpenseViewSet),('stock-items',StockItemViewSet),('stock-movements',StockMovementViewSet),('employees',EmployeeViewSet)]: router.register(prefix,view,basename=prefix)
urlpatterns=[path('',include(router.urls))]
