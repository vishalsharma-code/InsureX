from django.db import models
from accounts.models import Customer
from policies.models import Policy

class Claim(models.Model):
    STATUS_CHOICES = (
        ('SUBMITTED', 'Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('SETTLED', 'Settled'),
    )

    CLAIM_TYPE_CHOICES = (
        ('MEDICAL', 'Medical / Hospitalization'),
        ('ACCIDENT', 'Accidental Damage'),
        ('THEFT', 'Loss / Theft'),
        ('DEATH', 'Death Claim'),
        ('DISABILITY', 'Critical Illness / Disability'),
        ('TRAVEL_DELAY', 'Travel Delay / Loss of Baggage'),
        ('OTHER', 'Other Incident'),
    )

    claim_number = models.CharField(max_length=50, unique=True)
    policy = models.ForeignKey(Policy, on_delete=models.CASCADE, related_name='claims')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='claims')
    claim_type = models.CharField(max_length=50, choices=CLAIM_TYPE_CHOICES, default='MEDICAL')
    claim_amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField()
    incident_date = models.DateField()
    submitted_date = models.DateField(auto_now_add=True)
    approved_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUBMITTED')
    remarks = models.TextField(blank=True, default='')
    settled_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.claim_number} - {self.get_status_display()} (₹{self.claim_amount})"
