from django.urls import path
from .views import InsurancePlanListCreateView, InsurancePlanDetailView, CalculatePremiumView

urlpatterns = [
    path('plans/', InsurancePlanListCreateView.as_view(), name='insurance-plan-list-create'),
    path('plans/<int:pk>/', InsurancePlanDetailView.as_view(), name='insurance-plan-detail'),
    path('calculate-premium/', CalculatePremiumView.as_view(), name='calculate-premium'),
]
