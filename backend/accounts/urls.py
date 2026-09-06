from django.urls import path
from .views import (
    CustomerListView,
    CustomerDetailView,
    AgentListView,
    AgentDetailView,
    CreateCustomerByAgentView,
)

urlpatterns = [
    path('customers/', CustomerListView.as_view(), name='customer-list'),
    path('customers/<int:pk>/', CustomerDetailView.as_view(), name='customer-detail'),
    path('customers/create/', CreateCustomerByAgentView.as_view(), name='customer-create-agent'),
    path('agents/', AgentListView.as_view(), name='agent-list'),
    path('agents/<int:pk>/', AgentDetailView.as_view(), name='agent-detail'),
]
