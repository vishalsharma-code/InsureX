from django.urls import path
from .views import AdminDashboardStatsView, AgentDashboardStatsView, CustomerDashboardStatsView

urlpatterns = [
    path('admin/', AdminDashboardStatsView.as_view(), name='dashboard-admin'),
    path('agent/', AgentDashboardStatsView.as_view(), name='dashboard-agent'),
    path('customer/', CustomerDashboardStatsView.as_view(), name='dashboard-customer'),
]
