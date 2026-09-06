from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta
from decimal import Decimal
from accounts.models import Customer, Agent
from insurance.models import InsurancePlan
from policies.models import Policy
from payments.models import Payment
from claims.models import Claim

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed initial demo data for InsureX Insurance Management System'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding InsureX database..."))

        # 1. Admin User
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'first_name': 'System',
                'last_name': 'Administrator',
                'phone': '+91 9876543210',
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('Admin@123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created Admin: admin@example.com / Admin@123"))

        # 2. Agent User
        agent_user, created = User.objects.get_or_create(
            username='agent',
            defaults={
                'email': 'agent@example.com',
                'first_name': 'Rahul',
                'last_name': 'Sharma',
                'phone': '+91 9876543211',
                'role': 'AGENT',
            }
        )
        if created:
            agent_user.set_password('Agent@123')
            agent_user.save()
            agent = Agent.objects.create(
                user=agent_user,
                agent_code='AGT-2026-001',
                address='Shop 12, Commercial Hub, MG Road',
                city='Bengaluru',
                state='Karnataka',
                pincode='560001'
            )
            self.stdout.write(self.style.SUCCESS("Created Agent: agent@example.com / Agent@123 (AGT-2026-001)"))
        else:
            agent = agent_user.agent_profile

        # 2b. Second Agent
        agent2_user, created = User.objects.get_or_create(
            username='agent_priya',
            defaults={
                'email': 'priya.agent@example.com',
                'first_name': 'Priya',
                'last_name': 'Nair',
                'phone': '+91 9876543212',
                'role': 'AGENT',
            }
        )
        if created:
            agent2_user.set_password('Agent@123')
            agent2_user.save()
            Agent.objects.create(
                user=agent2_user,
                agent_code='AGT-2026-002',
                address='402 Park Avenue, Koramangala',
                city='Bengaluru',
                state='Karnataka',
                pincode='560034'
            )

        # 3. Customer User
        customer_user, created = User.objects.get_or_create(
            username='customer',
            defaults={
                'email': 'customer@example.com',
                'first_name': 'Amit',
                'last_name': 'Verma',
                'phone': '+91 9876543220',
                'role': 'CUSTOMER',
            }
        )
        if created:
            customer_user.set_password('Customer@123')
            customer_user.save()
            customer = Customer.objects.create(
                user=customer_user,
                date_of_birth=date(1994, 5, 15),
                gender='MALE',
                address='Flat 304, Green Meadows, Indiranagar',
                city='Bengaluru',
                state='Karnataka',
                pincode='560038'
            )
            self.stdout.write(self.style.SUCCESS("Created Customer: customer@example.com / Customer@123"))
        else:
            customer = customer_user.customer_profile

        # 3b. Customer 2
        cust2_user, created = User.objects.get_or_create(
            username='neha_patel',
            defaults={
                'email': 'neha.patel@example.com',
                'first_name': 'Neha',
                'last_name': 'Patel',
                'phone': '+91 9876543221',
                'role': 'CUSTOMER',
            }
        )
        if created:
            cust2_user.set_password('Customer@123')
            cust2_user.save()
            cust2 = Customer.objects.create(
                user=cust2_user,
                date_of_birth=date(1988, 11, 20),
                gender='FEMALE',
                address='12 Sunrise Colony, Andheri West',
                city='Mumbai',
                state='Maharashtra',
                pincode='400058'
            )
        else:
            cust2 = cust2_user.customer_profile

        # 4. Insurance Plans
        plans_data = [
            {
                'plan_name': 'Term Life Shield Pro',
                'insurance_type': 'LIFE',
                'description': 'High sum assured pure term life insurance with guaranteed financial security for family and terminal illness benefit.',
                'coverage_amount': Decimal('10000000.00'),
                'base_premium': Decimal('9500.00'),
                'duration_months': 360,
                'minimum_age': 18,
                'maximum_age': 60,
                'status': 'ACTIVE'
            },
            {
                'plan_name': 'Comprehensive Family Health Suraksha',
                'insurance_type': 'HEALTH',
                'description': 'Cashless hospitalization in 10,000+ network hospitals, zero co-pay, pre-existing diseases covered after 2 years, maternity benefits.',
                'coverage_amount': Decimal('1500000.00'),
                'base_premium': Decimal('14200.00'),
                'duration_months': 12,
                'minimum_age': 18,
                'maximum_age': 65,
                'status': 'ACTIVE'
            },
            {
                'plan_name': 'DriveSecure Motor Comprehensive',
                'insurance_type': 'VEHICLE',
                'description': 'Comprehensive four-wheeler & two-wheeler protection covering own damage, third-party liability, zero depreciation and roadside assistance.',
                'coverage_amount': Decimal('850000.00'),
                'base_premium': Decimal('6800.00'),
                'duration_months': 12,
                'minimum_age': 18,
                'maximum_age': 75,
                'status': 'ACTIVE'
            },
            {
                'plan_name': 'Global Explorer Travel Shield',
                'insurance_type': 'TRAVEL',
                'description': 'International travel emergency medical expenses, baggage loss, flight cancellation, and passport loss reimbursement worldwide.',
                'coverage_amount': Decimal('2500000.00'),
                'base_premium': Decimal('3200.00'),
                'duration_months': 3,
                'minimum_age': 1,
                'maximum_age': 70,
                'status': 'ACTIVE'
            },
            {
                'plan_name': 'Senior Citizen Golden Health Care',
                'insurance_type': 'HEALTH',
                'description': 'Tailored healthcare policy for parents and seniors with no mandatory pre-policy medical checkup up to age 70, organ donor expenses included.',
                'coverage_amount': Decimal('800000.00'),
                'base_premium': Decimal('18500.00'),
                'duration_months': 12,
                'minimum_age': 55,
                'maximum_age': 80,
                'status': 'ACTIVE'
            }
        ]

        plans = []
        for pdata in plans_data:
            plan, _ = InsurancePlan.objects.get_or_create(plan_name=pdata['plan_name'], defaults=pdata)
            plans.append(plan)

        # 5. Policies
        today = timezone.now().date()
        
        # Active Policy 1 for Customer 1 (Health)
        p1, created = Policy.objects.get_or_create(
            policy_number='INS-2026-000001',
            defaults={
                'customer': customer,
                'agent': agent,
                'insurance_plan': plans[1],
                'start_date': today - timedelta(days=120),
                'end_date': today + timedelta(days=245),
                'premium_amount': Decimal('14200.00'),
                'coverage_amount': Decimal('1500000.00'),
                'status': 'ACTIVE',
                'remarks': 'Approved by admin. Standard policy issued.'
            }
        )

        # Active Policy 2 for Customer 1 (Vehicle)
        p2, created = Policy.objects.get_or_create(
            policy_number='INS-2026-000002',
            defaults={
                'customer': customer,
                'agent': agent,
                'insurance_plan': plans[2],
                'start_date': today - timedelta(days=60),
                'end_date': today + timedelta(days=305),
                'premium_amount': Decimal('6800.00'),
                'coverage_amount': Decimal('850000.00'),
                'status': 'ACTIVE',
                'remarks': 'Vehicle inspection verified and approved.'
            }
        )

        # Pending Application for Customer 1 (Life)
        p3, created = Policy.objects.get_or_create(
            customer=customer,
            insurance_plan=plans[0],
            status='PENDING',
            defaults={
                'agent': agent,
                'premium_amount': Decimal('9500.00'),
                'coverage_amount': Decimal('10000000.00'),
                'remarks': 'Applicant submitted medical history. Pending tele-underwriting verification.'
            }
        )

        # Active Policy for Customer 2 (Life)
        p4, created = Policy.objects.get_or_create(
            policy_number='INS-2026-000003',
            defaults={
                'customer': cust2,
                'agent': agent,
                'insurance_plan': plans[0],
                'start_date': today - timedelta(days=90),
                'end_date': today + timedelta(days=10860),
                'premium_amount': Decimal('10200.00'),
                'coverage_amount': Decimal('10000000.00'),
                'status': 'ACTIVE',
                'remarks': 'Approved with standard rates.'
            }
        )

        # 6. Payments
        payments_data = [
            {
                'policy': p1,
                'transaction_id': 'TXN-2026-789012',
                'amount': Decimal('14200.00'),
                'payment_method': 'UPI',
                'status': 'COMPLETED'
            },
            {
                'policy': p2,
                'transaction_id': 'TXN-2026-345678',
                'amount': Decimal('6800.00'),
                'payment_method': 'CARD',
                'status': 'COMPLETED'
            },
            {
                'policy': p4,
                'transaction_id': 'TXN-2026-901234',
                'amount': Decimal('10200.00'),
                'payment_method': 'BANK_TRANSFER',
                'status': 'COMPLETED'
            },
        ]
        for pdata in payments_data:
            Payment.objects.get_or_create(transaction_id=pdata['transaction_id'], defaults=pdata)

        # 7. Claims
        claims_data = [
            {
                'claim_number': 'CLM-2026-1001',
                'policy': p1,
                'customer': customer,
                'claim_type': 'MEDICAL',
                'claim_amount': Decimal('45000.00'),
                'description': 'Emergency appendectomy hospital admission at Manipal Hospital.',
                'incident_date': today - timedelta(days=20),
                'approved_amount': Decimal('42000.00'),
                'status': 'SETTLED',
                'remarks': 'Bills verified against hospital charge slip. Settled via direct bank transfer.',
                'settled_date': today - timedelta(days=5),
            },
            {
                'claim_number': 'CLM-2026-1002',
                'policy': p2,
                'customer': customer,
                'claim_type': 'ACCIDENT',
                'claim_amount': Decimal('18500.00'),
                'description': 'Front bumper and left headlight damage during parking incident.',
                'incident_date': today - timedelta(days=3),
                'status': 'SUBMITTED',
                'remarks': 'Surveyor assigned for garage estimate inspection.'
            },
            {
                'claim_number': 'CLM-2026-1003',
                'policy': p4,
                'customer': cust2,
                'claim_type': 'MEDICAL',
                'claim_amount': Decimal('25000.00'),
                'description': 'Outpatient minor surgery and post-operative medications.',
                'incident_date': today - timedelta(days=10),
                'status': 'UNDER_REVIEW',
                'remarks': 'Prescription and discharge summary under evaluation.'
            },
        ]
        for cdata in claims_data:
            Claim.objects.get_or_create(claim_number=cdata['claim_number'], defaults=cdata)

        self.stdout.write(self.style.SUCCESS("✓ Seed data creation completed successfully!"))
