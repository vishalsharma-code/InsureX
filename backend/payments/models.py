from django.db import models
from policies.models import Policy

class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ('UPI', 'UPI Payment'),
        ('CARD', 'Debit / Credit Card'),
        ('BANK_TRANSFER', 'Net Banking / Transfer'),
        ('CASH', 'Cash'),
    )

    STATUS_CHOICES = (
        ('COMPLETED', 'Completed'),
        ('PENDING', 'Pending'),
        ('FAILED', 'Failed'),
    )

    policy = models.ForeignKey(Policy, on_delete=models.CASCADE, related_name='payments')
    transaction_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='UPI')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='COMPLETED')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_id} - ₹{self.amount} for {self.policy.policy_number or self.policy.id}"
