"""
WSGI config for llwinecellar project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/howto/deployment/wsgi/
"""

import os

import environ
from django.core.wsgi import get_wsgi_application

environ.Env().read_env(".env")
env = os.environ.get("DJANGO_ENV", "local")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", f"llwinecellar.settings.{env}")

application = get_wsgi_application()
