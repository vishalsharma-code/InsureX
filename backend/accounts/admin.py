from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Customer, Agent

class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Profile', {'fields': ('role', 'phone')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Custom Profile', {'fields': ('role', 'phone', 'email')}),
    )

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'gender', 'city', 'state', 'created_at')
    search_fields = ('user__username', 'user__email', 'city', 'state')
    list_filter = ('gender', 'state', 'created_at')

@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'agent_code', 'city', 'joining_date')
    search_fields = ('user__username', 'user__email', 'agent_code', 'city')
    list_filter = ('city', 'joining_date')

admin.site.register(User, UserAdmin)
