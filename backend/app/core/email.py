import smtplib
from email.message import EmailMessage
from app.config import settings

def send_verification_email(to_email: str, token: str):
    verify_link = f"http://localhost:8000/auth/verify-email?token={token}"

    msg = EmailMessage()
    msg["Subject"] = "Verify your SchedNova account"
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email

    msg.set_content(f"""
    Welcome to SchedNova 👋

    Please verify your email by clicking the link below:
    {verify_link}

    This link expires in 15 minutes.
    """)

    with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
