"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
import logging
from django.core.asgi import get_asgi_application

logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
logger.info("ASGI application loading...")

application = get_asgi_application()
logger.info("ASGI application loaded successfully.")
