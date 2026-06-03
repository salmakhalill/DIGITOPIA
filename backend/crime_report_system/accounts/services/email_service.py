from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator

from django.conf import settings


FRONTEND_URL = "http://localhost:5173"


def send_password_email(user, template_name, subject, body_text):

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    link = f"{FRONTEND_URL}/reset-password/{uid}/{token}"

    context = {
        "user": user,
        "reset_link": link
    }

    html_content = render_to_string(template_name, context)

    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,

        to_emails=user.email,

        subject=subject,

        plain_text_content=f"{body_text}: {link}",

        html_content=html_content
    )
    
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)

        response = sg.send(message)

        print("STATUS:", response.status_code)

    except Exception as e:
        print("SENDGRID ERROR:")
        print(e.body)

    return link