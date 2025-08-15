from celery import shared_task
from django.core.mail import send_mail
from .models import Application, Interview
from django.conf import settings


@shared_task
def send_status_update_email(applicant_email, job_title, new_status):
    """
    Sends an email to the applicant about their application status update.
    """
    subject = f'Update on your application for {job_title}'
    message = f'Dear Applicant,\n\nYour application for the position of {job_title} has been updated to: {new_status}.\n\nBest Regards,\nThe Hiring Team'
    from_email = 'no-reply@jrats.com'
    recipient_list = [applicant_email]
    send_mail(subject, message, from_email, recipient_list)
    return f"Email sent to {applicant_email}"


@shared_task
def send_interview_invitation_email(application_id):
    """
    Sends an email to the applicant with a link to schedule their interview.
    """
    try:
        application = Application.objects.get(id=application_id)
        # Create an interview slot for this application
        interview, created = Interview.objects.get_or_create(application=application)
        
        applicant_email = application.applicant.user.email
        job_title = application.job.title
        
        # In a real app, the base URL should come from settings or environment variables
        schedule_link = f"http://localhost:8000/api/interview/schedule/{interview.scheduling_token}/"
        
        subject = f'Invitation to Interview for {job_title}'
        message = (
            f'Dear Applicant,\n\n'
            f'Congratulations! We would like to invite you for an interview for the position of {job_title}.\n\n'
            f'Please use the following link to schedule your interview: {schedule_link}\n\n'
            f'Best Regards,\nThe Hiring Team'
        )
        
        # This will print the link to the terminal if the email backend is console
        print(f"--- INTERVIEW SCHEDULING LINK FOR {applicant_email} ---\n{schedule_link}\n-------------------------------------------------")

        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [applicant_email])
        
        return f"Interview invitation sent to {applicant_email}"
    except Application.DoesNotExist:
        return "Application not found."
    except Exception as e:
        # Handle potential errors with sending email
        print(f"Error sending email: {e}")
        return "Failed to send interview invitation."


@shared_task
def send_rejection_email(application_id):
    """
    Sends a rejection email to the applicant.
    """
    try:
        application = Application.objects.get(id=application_id)
        applicant_email = application.applicant.user.email
        job_title = application.job.title
        
        subject = f'Update on your application for {job_title}'
        message = (
            f'Dear Applicant,\n\n'
            f'Thank you for your interest in the {job_title} position. After careful consideration, we have decided not to move forward with your application at this time.\n\n'
            f'We wish you the best of luck in your job search.\n\n'
            f'Best Regards,\nThe Hiring Team'
        )
        
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [applicant_email])
        return f"Rejection email sent to {applicant_email}"
    except Application.DoesNotExist:
        return "Application not found."