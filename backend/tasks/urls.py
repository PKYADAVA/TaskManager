"""
tasks/urls.py — URL patterns for the tasks app.

BEGINNER TIP:
  These URLs are all prefixed with /api/ because of how we included them
  in task_manager/urls.py:   path('api/', include('tasks.urls'))

  So the full URLs are:
    POST   /api/auth/register/         → Register a new user
    POST   /api/auth/login/            → Login (returns JWT tokens)
    POST   /api/auth/token/refresh/    → Get new access token using refresh token
    POST   /api/auth/logout/           → Logout (blacklist refresh token)

    GET    /api/tasks/                 → List my tasks
    POST   /api/tasks/                 → Create a task
    GET    /api/tasks/<id>/            → Get one task
    PUT    /api/tasks/<id>/            → Full update
    PATCH  /api/tasks/<id>/            → Partial update (e.g. mark complete)
    DELETE /api/tasks/<id>/            → Delete

SWAGGER:
  The @extend_schema wrappers below add tags/summaries to the SimpleJWT
  built-in views so they appear correctly grouped in Swagger UI.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse, inline_serializer
from rest_framework import serializers as drf_serializers

from .views import RegisterView, LogoutView, TaskListCreateView, TaskDetailView


# ---------------------------------------------------------------------------
# Decorate the SimpleJWT built-in views with Swagger metadata
# ---------------------------------------------------------------------------

@extend_schema(
    tags=['Auth'],
    summary='Login — obtain JWT tokens',
    description=(
        'Validates credentials and returns a short-lived **access token** '
        '(60 min) and a long-lived **refresh token** (7 days).\n\n'
        'Store both tokens in `localStorage`. '
        'Include the access token in every subsequent request as:\n\n'
        '`Authorization: Bearer <access_token>`'
    ),
    request=inline_serializer(
        name='LoginRequest',
        fields={
            'username': drf_serializers.CharField(),
            'password': drf_serializers.CharField(),
        },
    ),
    responses={
        200: inline_serializer(
            name='LoginResponse',
            fields={
                'access':  drf_serializers.CharField(),
                'refresh': drf_serializers.CharField(),
            },
        ),
        401: OpenApiResponse(description='Invalid credentials'),
    },
    examples=[
        OpenApiExample(
            'Example request',
            value={'username': 'alice', 'password': 'secret123'},
            request_only=True,
        ),
        OpenApiExample(
            'Example response',
            value={
                'access':  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3MTMyOTYwMDB9.abc',
                'refresh': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3MTM4OTYwMDB9.xyz',
            },
            response_only=True,
            status_codes=['200'],
        ),
    ],
)
class LoginView(TokenObtainPairView):
    """Thin wrapper so we can attach @extend_schema to TokenObtainPairView."""
    pass


@extend_schema(
    tags=['Auth'],
    summary='Refresh access token',
    description=(
        'Exchanges a valid refresh token for a new access token.\n\n'
        'Call this automatically when you receive a **401** response — '
        'the axios interceptor in `axiosInstance.js` handles this for you.'
    ),
    request=inline_serializer(
        name='TokenRefreshRequest',
        fields={'refresh': drf_serializers.CharField()},
    ),
    responses={
        200: inline_serializer(
            name='TokenRefreshResponse',
            fields={'access': drf_serializers.CharField()},
        ),
        401: OpenApiResponse(description='Refresh token expired or invalid'),
    },
    examples=[
        OpenApiExample(
            'Example request',
            value={'refresh': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'},
            request_only=True,
        ),
    ],
)
class TokenRefreshAnnotatedView(TokenRefreshView):
    """Thin wrapper so we can attach @extend_schema to TokenRefreshView."""
    pass


# ---------------------------------------------------------------------------
# URL patterns
# ---------------------------------------------------------------------------

urlpatterns = [
    # --- Authentication ---
    path('auth/register/',      RegisterView.as_view(),              name='register'),
    path('auth/login/',         LoginView.as_view(),                 name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshAnnotatedView.as_view(), name='token_refresh'),
    path('auth/logout/',        LogoutView.as_view(),                name='logout'),

    # --- Tasks CRUD ---
    path('tasks/',          TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(),    name='task-detail'),
]
