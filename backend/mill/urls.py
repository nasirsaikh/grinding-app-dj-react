from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
for prefix, viewset in [
    ('customers', views.CustomerViewSet), ('rate-cards', views.RateCardViewSet),
    ('grinding-transactions', views.GrindingTransactionViewSet), ('ledger-entries', views.LedgerEntryViewSet),
    ('expenses', views.ExpenseViewSet), ('stock-items', views.StockItemViewSet), ('stock-movements', views.StockMovementViewSet),
    ('utility-bills', views.UtilityBillViewSet), ('employees', views.EmployeeViewSet), ('attendance', views.AttendanceViewSet),
    ('payrolls', views.PayrollViewSet), ('maintenance-logs', views.MaintenanceLogViewSet), ('wastage-logs', views.WastageLogViewSet),
    ('translations', views.UITranslationViewSet),
]: router.register(prefix, viewset, basename=prefix)

urlpatterns = [path('', include(router.urls)), path('dashboard/', views.dashboard)]
