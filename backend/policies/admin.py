from django.contrib import admin
from .models import Policy

@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):
    list_display = ('id', 'policy_number', 'customer', 'insurance_plan', 'status', 'premium_amount', 'start_date', 'end_date')
    list_filter = ('status', 'insurance_plan__insurance_type', 'application_date')
    search_fields = ('policy_number', 'customer__user__username', 'customer__user__email', 'insurance_plan__plan_name')
