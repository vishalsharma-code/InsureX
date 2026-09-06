from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Q
from .models import Payment
from .serializers import PaymentDetailSerializer, PaymentCreateSerializer
from accounts.models import Customer, Agent
from policies.models import Policy
from accounts.permissions import IsOwnerOrAdminOrAgent

class PaymentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PaymentCreateSerializer
        return PaymentDetailSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Payment.objects.select_related('policy__customer__user', 'policy__insurance_plan').all().order_by('-created_at')

        if user.role == 'ADMIN' or user.is_superuser:
            pass  # Admin sees all
        elif user.role == 'AGENT':
            try:
                agent = user.agent_profile
                queryset = queryset.filter(Q(policy__agent=agent) | Q(policy__agent__isnull=True))
            except Agent.DoesNotExist:
                queryset = queryset.none()
        elif user.role == 'CUSTOMER':
            try:
                customer = user.customer_profile
                queryset = queryset.filter(policy__customer=customer)
            except Customer.DoesNotExist:
                queryset = queryset.none()
        else:
            queryset = queryset.none()

        # Query Filters
        method = self.request.query_params.get('method')
        if method:
            queryset = queryset.filter(payment_method=method.upper())

        policy_id = self.request.query_params.get('policy_id')
        if policy_id:
            queryset = queryset.filter(policy_id=policy_id)

        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(transaction_id__icontains=search) |
                Q(policy__policy_number__icontains=search) |
                Q(policy__customer__user__first_name__icontains=search) |
                Q(policy__customer__user__last_name__icontains=search)
            )

        return queryset

    def create(self, request, *args, **kwargs):
        user = request.user
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        policy_id = serializer.validated_data['policy_id']
        policy = Policy.objects.get(id=policy_id)

        # Ensure customer only pays for their own policy
        if user.role == 'CUSTOMER':
            if not hasattr(user, 'customer_profile') or policy.customer != user.customer_profile:
                return Response({"error": "You can only record payments for your own active policies."}, status=status.HTTP_403_FORBIDDEN)

        payment = serializer.save()
        return Response(PaymentDetailSerializer(payment).data, status=status.HTTP_201_CREATED)


class PaymentDetailView(generics.RetrieveAPIView):
    queryset = Payment.objects.select_related('policy__customer__user', 'policy__insurance_plan').all()
    serializer_class = PaymentDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdminOrAgent]
