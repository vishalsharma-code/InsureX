from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from accounts.models import Customer
from insurance.models import InsurancePlan
from policies.models import Policy
from payments.models import Payment

User = get_user_model()

class PaymentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cust_user = User.objects.create_user(username='paycust', email='p@p.com', password='p', role='CUSTOMER')
        self.customer = Customer.objects.create(user=self.cust_user)

        self.plan = InsurancePlan.objects.create(
            plan_name='Vehicle Protect',
            insurance_type='VEHICLE',
            description='Test',
            coverage_amount=Decimal('400000.00'),
            base_premium=Decimal('5000.00'),
            duration_months=12,
            minimum_age=18,
            maximum_age=65,
            status='ACTIVE'
        )

        self.active_policy = Policy.objects.create(
            customer=self.customer,
            insurance_plan=self.plan,
            policy_number='INS-2026-TEST01',
            coverage_amount=Decimal('400000.00'),
            premium_amount=Decimal('5000.00'),
            status='ACTIVE'
        )

        self.pending_policy = Policy.objects.create(
            customer=self.customer,
            insurance_plan=self.plan,
            coverage_amount=Decimal('400000.00'),
            premium_amount=Decimal('5000.00'),
            status='PENDING'
        )

    def test_record_payment_for_active_policy(self):
        self.client.force_authenticate(user=self.cust_user)
        payload = {
            'policy_id': self.active_policy.id,
            'amount': 5000.00,
            'payment_method': 'UPI'
        }
        response = self.client.post('/api/payments/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['transaction_id'].startswith('TXN-'))
        self.assertEqual(response.data['status'], 'COMPLETED')

    def test_payment_fails_for_pending_policy(self):
        self.client.force_authenticate(user=self.cust_user)
        payload = {
            'policy_id': self.pending_policy.id,
            'amount': 5000.00,
            'payment_method': 'UPI'
        }
        response = self.client.post('/api/payments/', payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
