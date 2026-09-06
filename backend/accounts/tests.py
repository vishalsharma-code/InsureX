from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import Customer, Agent

User = get_user_model()

class AuthenticationAndPermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Admin user
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='Password123!',
            role='ADMIN'
        )

        # Agent user
        self.agent_user = User.objects.create_user(
            username='agent',
            email='agent@example.com',
            password='Password123!',
            role='AGENT'
        )
        self.agent = Agent.objects.create(user=self.agent_user, agent_code='AGT-001')

        # Customer user 1
        self.customer_user1 = User.objects.create_user(
            username='customer1',
            email='customer1@example.com',
            password='Password123!',
            role='CUSTOMER'
        )
        self.customer1 = Customer.objects.create(user=self.customer_user1)

        # Customer user 2
        self.customer_user2 = User.objects.create_user(
            username='customer2',
            email='customer2@example.com',
            password='Password123!',
            role='CUSTOMER'
        )
        self.customer2 = Customer.objects.create(user=self.customer_user2)

    def test_customer_registration(self):
        payload = {
            'username': 'newcustomer',
            'email': 'newcustomer@example.com',
            'password': 'Password123!',
            'password_confirm': 'Password123!',
            'first_name': 'New',
            'last_name': 'User',
            'gender': 'FEMALE',
            'city': 'Delhi'
        }
        response = self.client.post('/api/auth/register/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newcustomer').exists())
        self.assertTrue(Customer.objects.filter(user__username='newcustomer').exists())

    def test_login_success(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'customer1',
            'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], 'CUSTOMER')

    def test_login_invalid_credentials(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'customer1',
            'password': 'WrongPassword'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_customer_cannot_access_admin_dashboard(self):
        self.client.force_authenticate(user=self.customer_user1)
        response = self.client.get('/api/dashboard/admin/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_agent_cannot_access_admin_dashboard(self):
        self.client.force_authenticate(user=self.agent_user)
        response = self.client.get('/api/dashboard/admin/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_access_admin_dashboard(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/dashboard/admin/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
