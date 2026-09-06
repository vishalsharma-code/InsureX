from django.urls import path
from .views import PolicyListCreateView, PolicyDetailView, PolicyApproveView, PolicyRejectView

urlpatterns = [
    path('', PolicyListCreateView.as_view(), name='policy-list-create'),
    path('<int:pk>/', PolicyDetailView.as_view(), name='policy-detail'),
    path('<int:pk>/approve/', PolicyApproveView.as_view(), name='policy-approve'),
    path('<int:pk>/reject/', PolicyRejectView.as_view(), name='policy-reject'),
]
