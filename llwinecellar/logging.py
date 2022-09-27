import datetime
import enum
import json
import uuid
from logging import Formatter as BaseFormatter
from socket import socket

from django.core.files.uploadedfile import UploadedFile
from django.db import models
from django.http import HttpRequest
from psycopg2.extras import Json


class Formatter(BaseFormatter):
    ATTRS = {
        "args",
        "asctime",
        "created",
        "exc_info",
        "exc_text",
        "filename",
        "funcName",
        "levelname",
        "levelno",
        "lineno",
        "module",
        "msecs",
        "message",
        "msg",
        "name",
        "pathname",
        "process",
        "processName",
        "relativeCreated",
        "stack_info",
        "thread",
        "threadName",
    }

    def format(self, record):
        log_text = super().format(record)

        extra = self.get_extra(record)
        if extra:
            log_text += "\n" + json.dumps(
                extra, default=self.default, ensure_ascii=False
            )

        return log_text

    def get_extra(self, record):
        return {
            attr: record.__dict__[attr]
            for attr in record.__dict__
            if attr not in self.ATTRS
        }

    def default(self, o):
        if isinstance(o, uuid.UUID):
            return str(o)
        if isinstance(o, enum.Enum):
            return str(o.name)
        if isinstance(o, datetime.datetime):
            return o.isoformat()
        if isinstance(o, datetime.date):
            return o.isoformat()
        if isinstance(o, datetime.timedelta):
            return o.total_seconds()
        if isinstance(o, socket):
            return o.getsockname()
        if isinstance(o, Json):
            return str(o)
        if isinstance(o, UploadedFile):
            return str(o)
        if isinstance(o, HttpRequest):
            return {
                "method": o.method,
                "path": o.get_full_path(),
            }
        if isinstance(o, models.Model):
            return str(o)
        if hasattr(o, "to_dict_log"):
            return o.to_dict_log()

        raise TypeError(f"{repr(o)} is not JSON serializable")
