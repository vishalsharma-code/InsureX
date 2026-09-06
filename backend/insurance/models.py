from django.db import models

class InsurancePlan(models.Model):
    TYPE_CHOICES = (
        ('LIFE', 'Life Insurance'),
        ('HEALTH', 'Health Insurance'),
        ('VEHICLE', 'Vehicle Insurance'),
        ('TRAVEL', 'Travel Insurance'),
    )

    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
    )

    plan_name = models.CharField(max_length=200)
    insurance_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField()
    coverage_amount = models.DecimalField(max_digits=12, decimal_places=2)
    base_premium = models.DecimalField(max_digits=10, decimal_places=2)
    duration_months = models.PositiveIntegerField(help_text="Policy duration in months")
    minimum_age = models.PositiveIntegerField(default=18)
    maximum_age = models.PositiveIntegerField(default=65)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.plan_name} ({self.get_insurance_type_display()}) - ₹{self.coverage_amount:,.0f}"
