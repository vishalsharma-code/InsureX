from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Customer, Agent
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    UserProfileSerializer,
    CustomerDetailSerializer,
    AgentDetailSerializer
)
from .permissions import IsAdminUserRole, IsAdminOrAgent

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
        }
        if hasattr(user, 'customer_profile'):
            data['user']['customer_id'] = user.customer_profile.id
            data['user']['gender'] = user.customer_profile.gender
            data['user']['date_of_birth'] = user.customer_profile.date_of_birth
        elif hasattr(user, 'agent_profile'):
            data['user']['agent_id'] = user.agent_profile.id
            data['user']['agent_code'] = user.agent_profile.agent_code
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "message": "Customer registered successfully",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class CustomerListView(generics.ListAPIView):
    """
    List all customers for Admin and Agent with search functionality.
    """
    serializer_class = CustomerDetailSerializer
    permission_classes = [IsAdminOrAgent]

    def get_queryset(self):
        queryset = Customer.objects.select_related('user').all().order_by('-created_at')
        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__email__icontains=search) |
                Q(user__phone__icontains=search) |
                Q(city__icontains=search)
            )
        return queryset


class CustomerDetailView(generics.RetrieveAPIView):
    queryset = Customer.objects.select_related('user').all()
    serializer_class = CustomerDetailSerializer
    permission_classes = [IsAdminOrAgent]


class AgentListView(generics.ListCreateAPIView):
    """
    List and create agents (Admin only).
    """
    serializer_class = AgentDetailSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        queryset = Agent.objects.select_related('user').all().order_by('-created_at')
        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__email__icontains=search) |
                Q(agent_code__icontains=search)
            )
        return queryset

    def create(self, request, *args, **kwargs):
        data = request.data
        username = data.get('username')
        email = data.get('email')
        password = data.get('password', 'Agent@123')
        agent_code = data.get('agent_code')

        if not username or not email or not agent_code:
            return Response({"error": "username, email, and agent_code are required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        if Agent.objects.filter(agent_code=agent_code).exists():
            return Response({"error": "Agent code already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            phone=data.get('phone', ''),
            role='AGENT'
        )

        agent = Agent.objects.create(
            user=user,
            agent_code=agent_code,
            address=data.get('address', ''),
            city=data.get('city', ''),
            state=data.get('state', ''),
            pincode=data.get('pincode', '')
        )

        serializer = self.get_serializer(agent)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AgentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Agent.objects.select_related('user').all()
    serializer_class = AgentDetailSerializer
    permission_classes = [IsAdminUserRole]


class CreateCustomerByAgentView(APIView):
    """
    Agent or Admin can register a new customer directly.
    """
    permission_classes = [IsAdminOrAgent]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        customer = user.customer_profile
        return Response({
            "message": "Customer created successfully",
            "customer": CustomerDetailSerializer(customer).data
        }, status=status.HTTP_201_CREATED)
