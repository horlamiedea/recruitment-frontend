from django.urls import path
from .views import (
    RecruiterSignUpView, 
    ApplicantSignUpView,
    JobListView,
    JobDetailView,
    ApplicationListView,
    ApplicationDetailView,
    AdvanceApplicationView,
    ScheduleInterviewView,
    UserProfileView
)

urlpatterns = [
    path('signup/recruiter/', RecruiterSignUpView.as_view(), name='recruiter-signup'),
    path('signup/applicant/', ApplicantSignUpView.as_view(), name='applicant-signup'),
    path('jobs/', JobListView.as_view(), name='job-list'),
    path('jobs/<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('applications/', ApplicationListView.as_view(), name='application-list'),
    path('applications/<int:pk>/', ApplicationDetailView.as_view(), name='application-detail'),

    path('applications/<int:pk>/advance/', AdvanceApplicationView.as_view(), name='advance-application'),
    path('interview/schedule/<uuid:token>/', ScheduleInterviewView.as_view(), name='schedule-interview'),
    path('profile/me/', UserProfileView.as_view(), name='user-profile'),
]