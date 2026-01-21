"""
ASGI config for Auto_All_System project.
Supports WebSocket
"""
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# 导入WebSocket路由（后续实现）
# from apps.tasks import routing as task_routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            # task_routing.websocket_urlpatterns
            []
        )
    ),
})
