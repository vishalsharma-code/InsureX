from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Customer, Agent

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'date_of_birth', 'gender', 'address', 'city', 'state', 'pincode', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Customer
        fields = ['id', 'user', 'date_of_birth', 'gender', 'address', 'city', 'state', 'pincode', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AgentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = ['id', 'agent_code', 'address', 'city', 'state', 'pincode', 'joining_date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'joining_date', 'created_at', 'updated_at']


class AgentDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Agent
        fields = ['id', 'user', 'agent_code', 'address', 'city', 'state', 'pincode', 'joining_date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'joining_date', 'created_at', 'updated_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.ChoiceField(choices=Customer.GENDER_CHOICES, default='MALE')
    address = serializers.CharField(required=False, allow_blank=True, default='')
    city = serializers.CharField(required=False, allow_blank=True, default='')
    state = serializers.CharField(required=False, allow_blank=True, default='')
    pincode = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone',
            'date_of_birth', 'gender', 'address', 'city', 'state', 'pincode'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "User with this email already exists."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        dob = validated_data.pop('date_of_birth', None)
        gender = validated_data.pop('gender', 'MALE')
        address = validated_data.pop('address', '')
        city = validated_data.pop('city', '')
        state = validated_data.pop('state', '')
        pincode = validated_data.pop('pincode', '')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            role='CUSTOMER'
        )

        Customer.objects.create(
            user=user,
            date_of_birth=dob,
            gender=gender,
            address=address,
            city=city,
            state=state,
            pincode=pincode
        )

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    customer = CustomerProfileSerializer(source='customer_profile', required=False)
    agent = AgentProfileSerializer(source='agent_profile', required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'role', 'customer', 'agent']
        read_only_fields = ['id', 'username', 'role']

    def update(self, instance, validated_data):
        customer_data = validated_data.pop('customer_profile', None)
        agent_data = validated_data.pop('agent_profile', None)

        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.save()

        if customer_data and hasattr(instance, 'customer_profile'):
            customer = instance.customer_profile
            for attr, val in customer_data.items():
                setattr(customer, attr, val)
            customer.save()

        if agent_data and hasattr(instance, 'agent_profile'):
            agent = instance.agent_profile
            for attr, val in agent_data.items():
                setattr(agent, attr, val)
            agent.save()

        return instance
