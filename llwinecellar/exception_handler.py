import logging

from rest_framework.views import exception_handler


def exception_handler_with_logging(exc, context=None):
    logger = logging.getLogger(__name__)

    response = exception_handler(exc, context)

    logger.warn(exc)

    return response
