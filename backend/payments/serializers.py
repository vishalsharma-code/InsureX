from rest_framework import serializers
from .models import Payment
from policies.models import Policy
import uuid
from django.utils import timezone

class PaymentDetailSerializer(serializers.ModelSerializer):
    policy_number = serializers.CharField(source='policy.policy_number', read_only=True)
    plan_name = serializers.CharField(source='policy.insurance_plan.plan_name', read_only=True)
    customer_name = serializers.CharField(source='policy.customer.user.get_full_name', read_only=True)
    customer_email = serializers.CharField(source='policy.customer.user.email', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'policy', 'policy_number', 'plan_name', 'customer_name', 'customer_email',
            'transaction_id', 'amount', 'payment_date',
            'payment_method', 'payment_method_display', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'transaction_id', 'payment_date', 'status', 'created_at']


class PaymentCreateSerializer(serializers.ModelSerializer):
    policy_id = serializers.IntegerField(required=True)

    class Meta:
        model = Payment
        fields = ['policy_id', 'amount', 'payment_method']

    def validate_policy_id(self, value):
        try:
            policy = Policy.objects.get(id=value)
        except Policy.DoesNotExist:
            raise serializers.ValidationError("Policy not found.")

        if policy.status != 'ACTIVE':
            raise serializers.ValidationError(f"Cannot record payment for policy in '{policy.status}' status. Policy must be ACTIVE.")

        return value

    def create(self, validated_data):
        policy_id = validated_data.pop('policy_id')
        policy = Policy.objects.get(id=policy_id)

        # Generate unique transaction ID: TXN-2026-XXXXXX
        now = timezone.now()
        unique_suffix = uuid.uuid4().hex[:6].upper()
        transaction_id = f"TXN-{now.year}-{unique_suffix}"

        payment = Payment.objects.create(
            policy=policy,
            transaction_id=transaction_id,
            status='COMPLETED',
            **validated_data
        )
        return payment
