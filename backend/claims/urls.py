from django.urls import path
from .views import ClaimListCreateView, ClaimDetailView, ClaimUpdateStatusView

urlpatterns = [
    path('', ClaimListCreateView.as_view(), name='claim-list-create'),
    path('<int:pk>/', ClaimDetailView.as_view(), name='claim-detail'),
    path('<int:pk>/status/', ClaimUpdateStatusView.as_view(), name='claim-update-status'),
]
