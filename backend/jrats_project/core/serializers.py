from rest_framework import serializers
from .models import User, RecruiterProfile, ApplicantProfile, Job, Application

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class RecruiterProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = RecruiterProfile
        fields = ['user', 'company_name']
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data, user_type='recruiter')
        recruiter_profile = RecruiterProfile.objects.create(user=user, **validated_data)
        return recruiter_profile

class ApplicantProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = ApplicantProfile
        fields = ['user', 'resume', 'skills']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data, user_type='applicant')
        applicant_profile = ApplicantProfile.objects.create(user=user, **validated_data)
        return applicant_profile

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'location', 'created_at']

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['id', 'job', 'applicant', 'status', 'applied_at']
        read_only_fields = ['applicant']

    

class InterviewScheduleSerializer(serializers.Serializer):
    scheduled_time = serializers.DateTimeField()

    def validate_scheduled_time(self, value):
        # You can add more complex validation here if needed, e.g., only allow business hours
        if value.minute not in [0, 30]:
            raise serializers.ValidationError("Interviews can only be scheduled on the hour or half-hour (e.g., 10:00, 10:30).")
        return value
    

class UserProfileSerializer(serializers.ModelSerializer):
    recruiter_profile = RecruiterProfileSerializer(read_only=True)
    applicant_profile = ApplicantProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'user_type', 
            'recruiter_profile', 'applicant_profile'
        ]


class ApplicantUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email']

# A detailed serializer for the applicant's profile
class DetailedApplicantProfileSerializer(serializers.ModelSerializer):
    user = ApplicantUserSerializer(read_only=True)
    class Meta:
        model = ApplicantProfile
        fields = ['user', 'resume', 'skills']

# A detailed serializer for a single application
class DetailedApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    applicant = DetailedApplicantProfileSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job', 'applicant', 'status', 'applied_at']