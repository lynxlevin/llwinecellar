#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

import environ


def main():
    """Run administrative tasks."""
    environ.Env().read_env(".env")

    env = os.environ.get("DJANGO_ENV", "local")
    if sys.argv[1] == "test":
        env = "testing"

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", f"llwinecellar.settings.{env}")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
