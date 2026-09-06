from rest_framework import serializers
from .models import Claim
from policies.models import Policy
from accounts.serializers import CustomerDetailSerializer
import uuid
from django.utils import timezone

class ClaimDetailSerializer(serializers.ModelSerializer):
    customer = CustomerDetailSerializer(read_only=True)
    policy_number = serializers.CharField(source='policy.policy_number', read_only=True)
    plan_name = serializers.CharField(source='policy.insurance_plan.plan_name', read_only=True)
    insurance_type = serializers.CharField(source='policy.insurance_plan.insurance_type', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    claim_type_display = serializers.CharField(source='get_claim_type_display', read_only=True)

    class Meta:
        model = Claim
        fields = [
            'id', 'claim_number', 'policy', 'policy_number', 'plan_name', 'insurance_type',
            'customer', 'claim_type', 'claim_type_display', 'claim_amount',
            'description', 'incident_date', 'submitted_date', 'approved_amount',
            'status', 'status_display', 'remarks', 'settled_date', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'claim_number', 'submitted_date', 'created_at', 'updated_at'
        ]


class ClaimCreateSerializer(serializers.ModelSerializer):
    policy_id = serializers.IntegerField(required=True)

    class Meta:
        model = Claim
        fields = [
            'policy_id', 'claim_type', 'claim_amount', 'incident_date', 'description'
        ]

    def validate_policy_id(self, value):
        try:
            policy = Policy.objects.get(id=value)
        except Policy.DoesNotExist:
            raise serializers.ValidationError("Selected policy does not exist.")

        if policy.status != 'ACTIVE':
            raise serializers.ValidationError(f"Claims can only be filed for ACTIVE policies. Current status is '{policy.status}'.")

        return value

    def validate(self, data):
        policy = Policy.objects.get(id=data['policy_id'])
        if data['claim_amount'] > policy.coverage_amount:
            raise serializers.ValidationError({
                "claim_amount": f"Claim amount (₹{data['claim_amount']}) cannot exceed policy coverage limit of ₹{policy.coverage_amount}."
            })
        return data

    def create(self, validated_data):
        policy_id = validated_data.pop('policy_id')
        policy = Policy.objects.get(id=policy_id)
        now = timezone.now()
        unique_suffix = uuid.uuid4().hex[:6].upper()
        claim_number = f"CLM-{now.year}-{unique_suffix}"

        claim = Claim.objects.create(
            policy=policy,
            customer=policy.customer,
            claim_number=claim_number,
            status='SUBMITTED',
            **validated_data
        )
        return claim


class ClaimStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SETTLED'])
    approved_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    remarks = serializers.CharField(required=False, allow_blank=True)
