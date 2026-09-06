from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('AGENT', 'Agent'),
        ('CUSTOMER', 'Customer'),
    )
    
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CUSTOMER')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_admin_role(self):
        return self.role == 'ADMIN' or self.is_superuser

    @property
    def is_agent_role(self):
        return self.role == 'AGENT'

    @property
    def is_customer_role(self):
        return self.role == 'CUSTOMER'


class Customer(models.Model):
    GENDER_CHOICES = (
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='MALE')
    address = models.TextField(blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=100, blank=True, default='')
    pincode = models.CharField(max_length=10, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Customer: {self.user.get_full_name() or self.user.username} ({self.user.email})"


class Agent(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agent_profile')
    agent_code = models.CharField(max_length=50, unique=True)
    address = models.TextField(blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=100, blank=True, default='')
    pincode = models.CharField(max_length=10, blank=True, default='')
    joining_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Agent: {self.agent_code} - {self.user.get_full_name() or self.user.username}"
