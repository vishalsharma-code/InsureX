from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from .models import Policy
from .serializers import PolicyDetailSerializer, PolicyCreateSerializer, PolicyActionSerializer
from accounts.models import Customer, Agent
from insurance.models import InsurancePlan
from insurance.services import calculate_premium
from accounts.permissions import IsAdminUserRole, IsOwnerOrAdminOrAgent

class PolicyListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PolicyCreateSerializer
        return PolicyDetailSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Policy.objects.select_related('customer__user', 'agent__user', 'insurance_plan').all().order_by('-created_at')

        if user.role == 'ADMIN' or user.is_superuser:
            pass  # Admin sees all
        elif user.role == 'AGENT':
            try:
                agent = user.agent_profile
                queryset = queryset.filter(Q(agent=agent) | Q(agent__isnull=True))
            except Agent.DoesNotExist:
                queryset = queryset.none()
        elif user.role == 'CUSTOMER':
            try:
                customer = user.customer_profile
                queryset = queryset.filter(customer=customer)
            except Customer.DoesNotExist:
                queryset = queryset.none()
        else:
            queryset = queryset.none()

        # Query Filters
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        type_param = self.request.query_params.get('type')
        if type_param:
            queryset = queryset.filter(insurance_plan__insurance_type=type_param.upper())

        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(policy_number__icontains=search) |
                Q(customer__user__first_name__icontains=search) |
                Q(customer__user__last_name__icontains=search) |
                Q(insurance_plan__plan_name__icontains=search)
            )

        return queryset

    def create(self, request, *args, **kwargs):
        user = request.user
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan_id = serializer.validated_data['insurance_plan_id']
        plan = get_object_or_404(InsurancePlan, id=plan_id, status='ACTIVE')

        customer = None
        agent = None

        if user.role == 'CUSTOMER':
            if not hasattr(user, 'customer_profile'):
                return Response({"error": "User does not have a customer profile"}, status=status.HTTP_400_BAD_REQUEST)
            customer = user.customer_profile
        elif user.role in ['AGENT', 'ADMIN']:
            cust_id = serializer.validated_data.get('customer_id')
            if not cust_id:
                return Response({"customer_id": "Customer is required when applying as Agent or Admin"}, status=status.HTTP_400_BAD_REQUEST)
            customer = get_object_or_404(Customer, id=cust_id)
            if user.role == 'AGENT' and hasattr(user, 'agent_profile'):
                agent = user.agent_profile

        # Validate customer age eligibility
        if customer.date_of_birth:
            age = (timezone.now().date() - customer.date_of_birth).days // 365
            if age < plan.minimum_age or age > plan.maximum_age:
                return Response({
                    "error": f"Customer age ({age}) is not eligible for this plan (Range: {plan.minimum_age}-{plan.maximum_age} yrs)."
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            age = 30  # Default assumed age

        coverage_amount = serializer.validated_data.get('coverage_amount') or plan.coverage_amount
        # Recalculate official premium on backend for tamper-proof accuracy
        calc = calculate_premium(plan, age, coverage_amount)
        calculated_premium = calc['final_premium']

        policy = Policy.objects.create(
            customer=customer,
            agent=agent,
            insurance_plan=plan,
            coverage_amount=coverage_amount,
            premium_amount=calculated_premium,
            status='PENDING',
            remarks=serializer.validated_data.get('remarks', 'Submitted application pending approval.')
        )

        response_serializer = PolicyDetailSerializer(policy)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class PolicyDetailView(generics.RetrieveAPIView):
    queryset = Policy.objects.select_related('customer__user', 'agent__user', 'insurance_plan').all()
    serializer_class = PolicyDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdminOrAgent]


class PolicyApproveView(APIView):
    """
    Approve policy application (Admin only).
    Generates unique policy number, sets start and end dates.
    """
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        policy = get_object_or_404(Policy, pk=pk)
        if policy.status != 'PENDING':
            return Response({"error": f"Cannot approve policy with status {policy.status}"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PolicyActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        today = timezone.now().date()
        months = policy.insurance_plan.duration_months
        end_date = today + timedelta(days=int(months * 30.4375))

        policy.status = 'ACTIVE'
        policy.policy_number = f"INS-{today.year}-{policy.id:06d}"
        policy.start_date = today
        policy.end_date = end_date
        remarks = serializer.validated_data.get('remarks')
        if remarks:
            policy.remarks = remarks
        policy.save()

        return Response(PolicyDetailSerializer(policy).data, status=status.HTTP_200_OK)


class PolicyRejectView(APIView):
    """
    Reject policy application (Admin only).
    """
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        policy = get_object_or_404(Policy, pk=pk)
        if policy.status != 'PENDING':
            return Response({"error": f"Cannot reject policy with status {policy.status}"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PolicyActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        policy.status = 'REJECTED'
        remarks = serializer.validated_data.get('remarks')
        if remarks:
            policy.remarks = remarks
        policy.save()

        return Response(PolicyDetailSerializer(policy).data, status=status.HTTP_200_OK)
