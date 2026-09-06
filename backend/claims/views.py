from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from .models import Claim
from .serializers import ClaimDetailSerializer, ClaimCreateSerializer, ClaimStatusUpdateSerializer
from policies.models import Policy
from accounts.models import Customer, Agent
from accounts.permissions import IsAdminUserRole, IsOwnerOrAdminOrAgent

class ClaimListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ClaimCreateSerializer
        return ClaimDetailSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Claim.objects.select_related('customer__user', 'policy__insurance_plan').all().order_by('-created_at')

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
                queryset = queryset.filter(customer=customer)
            except Customer.DoesNotExist:
                queryset = queryset.none()
        else:
            queryset = queryset.none()

        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        type_param = self.request.query_params.get('type')
        if type_param:
            queryset = queryset.filter(claim_type=type_param.upper())

        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(claim_number__icontains=search) |
                Q(policy__policy_number__icontains=search) |
                Q(customer__user__first_name__icontains=search) |
                Q(customer__user__last_name__icontains=search)
            )

        return queryset

    def create(self, request, *args, **kwargs):
        user = request.user
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        policy_id = serializer.validated_data['policy_id']
        policy = Policy.objects.get(id=policy_id)

        if user.role == 'CUSTOMER':
            if not hasattr(user, 'customer_profile') or policy.customer != user.customer_profile:
                return Response({"error": "You can only file claims for your own active policies."}, status=status.HTTP_403_FORBIDDEN)

        claim = serializer.save()
        return Response(ClaimDetailSerializer(claim).data, status=status.HTTP_201_CREATED)


class ClaimDetailView(generics.RetrieveAPIView):
    queryset = Claim.objects.select_related('customer__user', 'policy__insurance_plan').all()
    serializer_class = ClaimDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdminOrAgent]


class ClaimUpdateStatusView(APIView):
    """
    Admin updates claim status: UNDER_REVIEW, APPROVED, REJECTED, SETTLED
    """
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        claim = get_object_or_404(Claim, pk=pk)
        serializer = ClaimStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        approved_amount = serializer.validated_data.get('approved_amount')
        remarks = serializer.validated_data.get('remarks')

        claim.status = new_status
        if remarks is not None:
            claim.remarks = remarks

        if new_status == 'APPROVED':
            if approved_amount is not None:
                claim.approved_amount = approved_amount
            elif not claim.approved_amount:
                claim.approved_amount = claim.claim_amount
        elif new_status == 'SETTLED':
            claim.settled_date = timezone.now().date()
            if approved_amount is not None:
                claim.approved_amount = approved_amount
            elif not claim.approved_amount:
                claim.approved_amount = claim.claim_amount

        claim.save()
        return Response(ClaimDetailSerializer(claim).data, status=status.HTTP_200_OK)
