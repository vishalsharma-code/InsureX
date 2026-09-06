from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import date
from accounts.models import Customer
from insurance.models import InsurancePlan
from policies.models import Policy
from claims.models import Claim

User = get_user_model()

class ClaimWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin = User.objects.create_superuser(username='admin', email='a@a.com', password='p', role='ADMIN')
        self.cust_user = User.objects.create_user(username='claimcust', email='cc@cc.com', password='p', role='CUSTOMER')
        self.customer = Customer.objects.create(user=self.cust_user)

        self.plan = InsurancePlan.objects.create(
            plan_name='Travel Health Plus',
            insurance_type='TRAVEL',
            description='Test',
            coverage_amount=Decimal('100000.00'),
            base_premium=Decimal('2000.00'),
            duration_months=3,
            minimum_age=1,
            maximum_age=75,
            status='ACTIVE'
        )

        self.active_policy = Policy.objects.create(
            customer=self.customer,
            insurance_plan=self.plan,
            policy_number='INS-2026-CLMTEST',
            coverage_amount=Decimal('100000.00'),
            premium_amount=Decimal('2000.00'),
            status='ACTIVE'
        )

    def test_customer_can_submit_claim(self):
        self.client.force_authenticate(user=self.cust_user)
        payload = {
            'policy_id': self.active_policy.id,
            'claim_type': 'MEDICAL',
            'claim_amount': 25000.00,
            'incident_date': str(date(2026, 8, 20)),
            'description': 'Hospitalized during travel abroad due to food poisoning'
        }
        response = self.client.post('/api/claims/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['claim_number'].startswith('CLM-'))
        self.assertEqual(response.data['status'], 'SUBMITTED')

    def test_admin_can_approve_and_settle_claim(self):
        claim = Claim.objects.create(
            policy=self.active_policy,
            customer=self.customer,
            claim_number='CLM-2026-TEST01',
            claim_type='MEDICAL',
            claim_amount=Decimal('25000.00'),
            incident_date=date(2026, 8, 20),
            description='Hospital admission'
        )

        self.client.force_authenticate(user=self.admin)
        
        # Approve
        resp_approve = self.client.post(f'/api/claims/{claim.id}/status/', {
            'status': 'APPROVED',
            'approved_amount': 22000.00,
            'remarks': 'Approved after medical invoice verification'
        })
        self.assertEqual(resp_approve.status_code, status.HTTP_200_OK)
        claim.refresh_from_db()
        self.assertEqual(claim.status, 'APPROVED')
        self.assertEqual(claim.approved_amount, Decimal('22000.00'))

        # Settle
        resp_settle = self.client.post(f'/api/claims/{claim.id}/status/', {
            'status': 'SETTLED',
            'remarks': 'Amount disbursed to customer account'
        })
        self.assertEqual(resp_settle.status_code, status.HTTP_200_OK)
        claim.refresh_from_db()
        self.assertEqual(claim.status, 'SETTLED')
        self.assertIsNotNone(claim.settled_date)
