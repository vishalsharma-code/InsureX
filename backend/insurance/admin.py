from django.contrib import admin
from .models import InsurancePlan

@admin.register(InsurancePlan)
class InsurancePlanAdmin(admin.ModelAdmin):
    list_display = ('id', 'plan_name', 'insurance_type', 'coverage_amount', 'base_premium', 'duration_months', 'status')
    list_filter = ('insurance_type', 'status')
    search_fields = ('plan_name', 'description')
