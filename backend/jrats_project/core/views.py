from rest_framework import generics, permissions
from .models import RecruiterProfile, ApplicantProfile, Job, Application, Interview
from django.utils import timezone
from datetime import timedelta
from .serializers import (RecruiterProfileSerializer, ApplicantProfileSerializer,
                        JobSerializer, ApplicationSerializer,
                        InterviewScheduleSerializer, UserProfileSerializer,
                        DetailedApplicationSerializer
                        )
from .permissions import IsRecruiter, IsApplicantOrReadOnly
from .tasks import send_status_update_email
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .tasks import send_interview_invitation_email, send_rejection_email


class RecruiterSignUpView(generics.CreateAPIView):
    queryset = RecruiterProfile.objects.all()
    serializer_class = RecruiterProfileSerializer
    permission_classes = [permissions.AllowAny]

class ApplicantSignUpView(generics.CreateAPIView):
    queryset = ApplicantProfile.objects.all()
    serializer_class = ApplicantProfileSerializer
    permission_classes = [permissions.AllowAny]

class JobListView(generics.ListCreateAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    # permission_classes = [permissions.IsAuthenticated, IsRecruiter] # <-- REMOVE THIS LINE

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.request.method == 'POST':
            # Only authenticated recruiters can create jobs
            return [permissions.IsAuthenticated(), IsRecruiter()]
        # Any authenticated user can view the list of jobs
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        recruiter_profile = self.request.user.recruiter_profile
        serializer.save(recruiter=recruiter_profile)

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

class ApplicationListView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'recruiter':
            return Application.objects.filter(job__recruiter=user.recruiter_profile)
        return Application.objects.filter(applicant=user.applicant_profile)
    
    def perform_create(self, serializer):
        applicant_profile = self.request.user.applicant_profile
        if not applicant_profile:
            raise ValueError("Applicant profile does not exist for the user.")
        serializer.save(applicant=applicant_profile)

class ApplicationDetailView(generics.RetrieveAPIView):
    """
    Provides a detailed view of a single application, including nested job
    and applicant profile information. Only accessible by the recruiter who posted the job
    or the applicant who applied.
    """
    queryset = Application.objects.all()
    serializer_class = DetailedApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Ensure users can only see applications they are involved in.
        """
        user = self.request.user
        if user.user_type == 'recruiter':
            return Application.objects.filter(job__recruiter=user.recruiter_profile)
        elif user.user_type == 'applicant':
            return Application.objects.filter(applicant=user.applicant_profile)
        return Application.objects.none()


class AdvanceApplicationView(APIView):
    """
    View for a recruiter to advance an application to interview or reject it.
    """
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def post(self, request, pk, *args, **kwargs):
        try:
            application = Application.objects.get(pk=pk, job__recruiter=request.user.recruiter_profile)
        except Application.DoesNotExist:
            return Response({"error": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action') # 'invite' or 'reject'

        if action == 'invite':
            application.status = 'interview_pending'
            application.save()
            send_interview_invitation_email.delay(application.id)
            return Response({"message": "Interview invitation process started."}, status=status.HTTP_200_OK)
        elif action == 'reject':
            application.status = 'rejected'
            application.save()
            send_rejection_email.delay(application.id)
            return Response({"message": "Application has been rejected."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid action. Must be 'invite' or 'reject'."}, status=status.HTTP_400_BAD_REQUEST)


class ScheduleInterviewView(APIView):
    """
    View for an applicant to schedule their interview using a token.
    """
    permission_classes = [permissions.AllowAny] # Access is controlled by the unique token

    def post(self, request, token, *args, **kwargs):
        try:
            interview = Interview.objects.get(scheduling_token=token, is_scheduled=False)
        except Interview.DoesNotExist:
            return Response({"error": "Invalid or expired scheduling link."}, status=status.HTTP_404_NOT_FOUND)

        serializer = InterviewScheduleSerializer(data=request.data)
        if serializer.is_valid():
            scheduled_time = serializer.validated_data['scheduled_time']

            # --- Validation Logic ---
            # 1. Ensure time is in the future
            if scheduled_time < timezone.now():
                return Response({"error": "Interview time must be in the future."}, status=status.HTTP_400_BAD_REQUEST)

            # 2. Check for conflicts within 30 minutes before and after
            time_buffer = timedelta(minutes=30)
            conflict_exists = Interview.objects.filter(
                application__job=interview.application.job,
                is_scheduled=True,
                scheduled_time__gte=scheduled_time - time_buffer,
                scheduled_time__lte=scheduled_time + time_buffer
            ).exists()

            if conflict_exists:
                return Response({"error": "This time slot is unavailable. Please choose another time."}, status=status.HTTP_409_CONFLICT)
            
            # --- Schedule the interview ---
            interview.scheduled_time = scheduled_time
            interview.is_scheduled = True
            interview.save()

            # Update application status
            application = interview.application
            application.status = 'interview_scheduled'
            application.save()

            return Response({"message": "Interview scheduled successfully!"}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveAPIView):
    """
    View to retrieve the profile of the currently authenticated user.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user