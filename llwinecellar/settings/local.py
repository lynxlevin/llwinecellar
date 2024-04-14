import os

from .base import *  # noqa: F403

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS: list[str] = []


"""
Settings for django-silk
"""
INSTALLED_APPS.append("silk")  # noqa: F405
INSTALLED_APPS.append("django.contrib.staticfiles")  # noqa: F405
# Silk should be right after GZipMiddleware.
MIDDLEWARE.insert(1, "silk.middleware.SilkyMiddleware")  # noqa: F405
STATIC_ROOT = os.path.join(BASE_DIR, "static")  # noqa: F405
STATIC_URL = "static/"
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "static")],  # noqa: F405
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]




# Logging
#  https://docs.djangoproject.com/en/2.0/topics/logging/
LOGGING = {
    "version": 1,
    "desable_existing_loggers": False,
    "formatters": {
        "default": {
            "()": "llwinecellar.logging.Formatter",
            "format": "[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)s] %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "default",
        },
        "file": {
            "level": "DEBUG",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "django.log",
            "maxBytes": 50 * 1000 * 1000,
            "backupCount": 1,
            "formatter": "default",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["file"],
            "level": "DEBUG",
        },
        "django.db.backends": {
            "handlers": ["file"],
            "level": "INFO",
            "propagate": False,
        },
        "django.utils": {
            "handlers": ["file"],
            "level": "INFO",
            "propagate": False,
        },
        "llwinecellar": {
            "handlers": ["file"],
            "level": "DEBUG",
        },
        "wines": {
            "handlers": ["file"],
            "level": "DEBUG",
        },
        "cellars": {
            "handlers": ["file"],
            "level": "DEBUG",
        },
        "users": {
            "handlers": ["file"],
            "level": "DEBUG",
        },
        "wine_memos": {
            "handlers": ["file"],
            "level": "DEBUG",
        },
    },
}
