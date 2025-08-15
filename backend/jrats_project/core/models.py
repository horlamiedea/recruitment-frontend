from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    USER_TYPE_CHOICES = (
      ("recruiter", "Recruiter"),
      ("applicant", "Applicant"),
    )
    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='applicant')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class RecruiterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_profile')
    company_name = models.CharField(max_length=255)
    # Add other recruiter-specific fields here

    def __str__(self):
        return self.user.username

class ApplicantProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='applicant_profile')
    resume = models.FileField(upload_to='resumes/')
    skills = models.TextField()
    # Add other applicant-specific fields here

    def __str__(self):
        return self.user.username

class Job(models.Model):
    recruiter = models.ForeignKey(RecruiterProfile, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Application(models.Model):
    STATUS_CHOICES = (
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('interview_scheduled', 'Interview Scheduled'), # Applicant has picked a time
        ('interview_pending', 'Interview Pending'), # Recruiter has invited, applicant needs to schedule
        ('interview', 'Interview'),
        ('offered', 'Offered'),
        ('rejected', 'Rejected'),
    )
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(ApplicantProfile, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'applicant') # An applicant can only apply once for a job

    def __str__(self):
        return f"{self.applicant.user.username}'s application for {self.job.title}"
    

class Interview(models.Model):
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='interview')
    scheduled_time = models.DateTimeField(null=True, blank=True)
    scheduling_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    is_scheduled = models.BooleanField(default=False)

    def __str__(self):
        return f"Interview for {self.application}"