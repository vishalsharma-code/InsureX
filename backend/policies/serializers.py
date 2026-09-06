from rest_framework import serializers
from .models import Policy
from accounts.serializers import CustomerDetailSerializer, AgentDetailSerializer
from insurance.serializers import InsurancePlanSerializer
from insurance.models import InsurancePlan
from accounts.models import Customer, Agent

class PolicyDetailSerializer(serializers.ModelSerializer):
    customer = CustomerDetailSerializer(read_only=True)
    agent = AgentDetailSerializer(read_only=True)
    insurance_plan = InsurancePlanSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Policy
        fields = [
            'id', 'policy_number', 'customer', 'agent', 'insurance_plan',
            'application_date', 'start_date', 'end_date',
            'premium_amount', 'coverage_amount', 'status', 'status_display',
            'remarks', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'policy_number', 'application_date', 'start_date', 'end_date', 'status', 'created_at', 'updated_at']


class PolicyCreateSerializer(serializers.ModelSerializer):
    customer_id = serializers.IntegerField(required=False, allow_null=True)
    insurance_plan_id = serializers.IntegerField(required=True)
    premium_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)

    class Meta:
        model = Policy
        fields = [
            'insurance_plan_id', 'customer_id', 'coverage_amount', 'premium_amount', 'remarks'
        ]

    def validate_insurance_plan_id(self, value):
        if not InsurancePlan.objects.filter(id=value, status='ACTIVE').exists():
            raise serializers.ValidationError("Selected insurance plan does not exist or is inactive.")
        return value


class PolicyActionSerializer(serializers.Serializer):
    remarks = serializers.CharField(required=False, allow_blank=True, default='')
