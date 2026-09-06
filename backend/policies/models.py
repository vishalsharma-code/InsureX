from django.db import models
from accounts.models import Customer, Agent
from insurance.models import InsurancePlan

class Policy(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Application'),
        ('ACTIVE', 'Active Policy'),
        ('REJECTED', 'Rejected Application'),
        ('EXPIRED', 'Expired Policy'),
        ('CANCELLED', 'Cancelled Policy'),
    )

    policy_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='policies')
    agent = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, blank=True, related_name='policies')
    insurance_plan = models.ForeignKey(InsurancePlan, on_delete=models.PROTECT, related_name='policies')
    application_date = models.DateField(auto_now_add=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    premium_amount = models.DecimalField(max_digits=10, decimal_places=2)
    coverage_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    remarks = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.policy_number or 'PENDING'} - {self.insurance_plan.plan_name} ({self.customer.user.get_full_name() or self.customer.user.username})"
