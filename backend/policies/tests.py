from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import date
from accounts.models import Customer
from insurance.models import InsurancePlan
from policies.models import Policy

User = get_user_model()

class PolicyWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Users
        self.admin = User.objects.create_superuser(username='admin', email='a@a.com', password='p', role='ADMIN')
        
        self.cust_user1 = User.objects.create_user(username='cust1', email='c1@c.com', password='p', role='CUSTOMER')
        self.cust1 = Customer.objects.create(user=self.cust_user1, date_of_birth=date(1995, 1, 1))

        self.cust_user2 = User.objects.create_user(username='cust2', email='c2@c.com', password='p', role='CUSTOMER')
        self.cust2 = Customer.objects.create(user=self.cust_user2, date_of_birth=date(1992, 1, 1))

        # Plan
        self.plan = InsurancePlan.objects.create(
            plan_name='Test Health Shield',
            insurance_type='HEALTH',
            description='Test description',
            coverage_amount=Decimal('500000.00'),
            base_premium=Decimal('6000.00'),
            duration_months=12,
            minimum_age=18,
            maximum_age=65,
            status='ACTIVE'
        )

    def test_customer_can_apply_for_policy(self):
        self.client.force_authenticate(user=self.cust_user1)
        payload = {
            'insurance_plan_id': self.plan.id,
            'coverage_amount': 500000.00,
            'remarks': 'Applying for health cover'
        }
        response = self.client.post('/api/policies/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'PENDING')
        self.assertIsNone(response.data['policy_number'])

    def test_admin_can_approve_policy(self):
        # Create pending policy
        policy = Policy.objects.create(
            customer=self.cust1,
            insurance_plan=self.plan,
            coverage_amount=Decimal('500000.00'),
            premium_amount=Decimal('6000.00'),
            status='PENDING'
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.post(f'/api/policies/{policy.id}/approve/', {'remarks': 'Approved by manager'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        policy.refresh_from_db()
        self.assertEqual(policy.status, 'ACTIVE')
        self.assertTrue(policy.policy_number.startswith('INS-'))
        self.assertIsNotNone(policy.start_date)
        self.assertIsNotNone(policy.end_date)

    def test_admin_can_reject_policy(self):
        policy = Policy.objects.create(
            customer=self.cust1,
            insurance_plan=self.plan,
            coverage_amount=Decimal('500000.00'),
            premium_amount=Decimal('6000.00'),
            status='PENDING'
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.post(f'/api/policies/{policy.id}/reject/', {'remarks': 'Rejected due to incomplete info'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        policy.refresh_from_db()
        self.assertEqual(policy.status, 'REJECTED')

    def test_customer_cannot_view_other_customer_policy(self):
        policy_c2 = Policy.objects.create(
            customer=self.cust2,
            insurance_plan=self.plan,
            coverage_amount=Decimal('500000.00'),
            premium_amount=Decimal('6000.00'),
            status='ACTIVE',
            policy_number='INS-TEST-002'
        )

        self.client.force_authenticate(user=self.cust_user1)
        response = self.client.get(f'/api/policies/{policy_c2.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
