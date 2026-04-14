"""
Root URL configuration for the task_manager project.

BEGINNER TIP:
  Think of urls.py as a traffic router. When a request comes in, Django
  looks here first and decides which app should handle it.

  urlpatterns is just a list of path() calls.
  Each path() maps a URL prefix to an app's own urls.py.

SWAGGER URLS (after running the server):
  http://localhost:8000/api/schema/          ← raw OpenAPI 3.0 JSON/YAML schema
  http://localhost:8000/api/docs/            ← Swagger UI  (interactive browser)
  http://localhost:8000/api/redoc/           ← ReDoc       (clean reference docs)
"""

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,      # serves the raw OpenAPI schema file
    SpectacularSwaggerView,  # serves the interactive Swagger UI
    SpectacularRedocView,    # serves the ReDoc documentation UI
)

urlpatterns = [
    # Django admin panel — http://localhost:8000/admin/
    path('admin/', admin.site.urls),

    # All our task/auth API endpoints live under /api/
    # Django will delegate to tasks/urls.py for the rest of the path.
    path('api/', include('tasks.urls')),

    # ------------------------------------------------------------------
    # Swagger / OpenAPI documentation endpoints
    # ------------------------------------------------------------------
    # Raw OpenAPI 3.0 schema (JSON by default, add ?format=yaml for YAML)
    path('api/schema/',  SpectacularAPIView.as_view(),        name='schema'),
    # Swagger UI — the interactive "try it out" browser
    path('api/docs/',    SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # ReDoc — a clean, readable API reference
    path('api/redoc/',   SpectacularRedocView.as_view(url_name='schema'),   name='redoc'),
]
