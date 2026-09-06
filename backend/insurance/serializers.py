from rest_framework import serializers
from .models import InsurancePlan

class InsurancePlanSerializer(serializers.ModelSerializer):
    insurance_type_display = serializers.CharField(source='get_insurance_type_display', read_only=True)

    class Meta:
        model = InsurancePlan
        fields = [
            'id', 'plan_name', 'insurance_type', 'insurance_type_display',
            'description', 'coverage_amount', 'base_premium',
            'duration_months', 'minimum_age', 'maximum_age',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        min_age = data.get('minimum_age', self.instance.minimum_age if self.instance else 18)
        max_age = data.get('maximum_age', self.instance.maximum_age if self.instance else 65)
        if min_age > max_age:
            raise serializers.ValidationError({"minimum_age": "Minimum age cannot be greater than maximum age."})
        return data


class PremiumCalculationRequestSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField(required=True)
    age = serializers.IntegerField(required=True, min_value=1, max_value=120)
    coverage_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
