from django.contrib import admin
from .models import Claim

@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = ('id', 'claim_number', 'policy', 'customer', 'claim_type', 'claim_amount', 'status', 'incident_date')
    list_filter = ('status', 'claim_type', 'incident_date')
    search_fields = ('claim_number', 'policy__policy_number', 'customer__user__username')
