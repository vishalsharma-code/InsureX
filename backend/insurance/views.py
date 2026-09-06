from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import InsurancePlan
from .serializers import InsurancePlanSerializer, PremiumCalculationRequestSerializer
from .services import calculate_premium
from accounts.permissions import IsAdminUserRole

class InsurancePlanListCreateView(generics.ListCreateAPIView):
    serializer_class = InsurancePlanSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUserRole()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        queryset = InsurancePlan.objects.all()

        # If not admin, only show active plans
        if not (user.is_authenticated and (user.role == 'ADMIN' or user.is_superuser)):
            queryset = queryset.filter(status='ACTIVE')

        # Filter by insurance_type
        insurance_type = self.request.query_params.get('type')
        if insurance_type:
            queryset = queryset.filter(insurance_type=insurance_type.upper())

        # Search by name or description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(plan_name__icontains=search)

        return queryset


class InsurancePlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InsurancePlan.objects.all()
    serializer_class = InsurancePlanSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUserRole()]
        return [permissions.AllowAny()]


class CalculatePremiumView(APIView):
    """
    Calculate estimated insurance premium given plan_id and age.
    Open to authenticated and prospective customers.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PremiumCalculationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan_id = serializer.validated_data['plan_id']
        age = serializer.validated_data['age']
        coverage = serializer.validated_data.get('coverage_amount')

        plan = get_object_or_404(InsurancePlan, id=plan_id)

        # Check age eligibility
        if age < plan.minimum_age or age > plan.maximum_age:
            return Response({
                "eligible": False,
                "error": f"Age {age} is outside the allowed eligibility range ({plan.minimum_age} - {plan.maximum_age} years) for {plan.plan_name}."
            }, status=status.HTTP_400_BAD_REQUEST)

        result = calculate_premium(plan, age, coverage)
        result["eligible"] = True
        return Response(result, status=status.HTTP_200_OK)
