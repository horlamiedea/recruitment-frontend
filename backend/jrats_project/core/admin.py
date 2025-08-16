from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, RecruiterProfile, ApplicantProfile, Job, Application, Interview

class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'user_type', 'is_staff')
    list_filter = ('user_type', 'is_staff', 'is_superuser', 'groups')
    search_fields = ('email', 'username')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('username', 'user_type')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name')
    search_fields = ('user__username', 'user__email', 'company_name')

class ApplicantProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'skills')
    search_fields = ('user__username', 'user__email', 'skills')

class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'recruiter', 'location', 'created_at')
    list_filter = ('location', 'created_at')
    search_fields = ('title', 'description', 'recruiter__company_name')
    date_hierarchy = 'created_at'

class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('job', 'applicant', 'status', 'applied_at')
    list_filter = ('status', 'applied_at')
    search_fields = ('job__title', 'applicant__user__username')
    date_hierarchy = 'applied_at'

class InterviewAdmin(admin.ModelAdmin):
    list_display = ('application', 'scheduled_time', 'is_scheduled')
    list_filter = ('is_scheduled',)
    search_fields = ('application__job__title', 'application__applicant__user__username')

admin.site.register(User, UserAdmin)
admin.site.register(RecruiterProfile, RecruiterProfileAdmin)
admin.site.register(ApplicantProfile, ApplicantProfileAdmin)
admin.site.register(Job, JobAdmin)
admin.site.register(Application, ApplicationAdmin)
admin.site.register(Interview, InterviewAdmin)
