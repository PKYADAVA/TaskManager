"""
views.py — Business logic for each API endpoint.

BEGINNER TIP:
  A "view" is a Python function/class that:
    1. Receives an HTTP request (GET, POST, PUT, DELETE)
    2. Does some work (query DB, validate data, etc.)
    3. Returns an HTTP response (usually JSON)

  We use DRF's class-based views:
    - generics.CreateAPIView      → POST  (create one object)
    - generics.ListCreateAPIView  → GET (list) + POST (create)
    - generics.RetrieveUpdateDestroyAPIView → GET/PUT/PATCH/DELETE one object

JWT FLOW (how authentication works):
  1. User logs in  → server returns { access: "...", refresh: "..." }
  2. React stores tokens in localStorage.
  3. Every subsequent request includes header:  Authorization: Bearer <access_token>
  4. DRF verifies the token. If valid, request.user is set automatically.
  5. When access token expires, React hits /api/token/refresh/ with the
     refresh token to get a new access token — no re-login needed.

SWAGGER DOCS:
  @extend_schema decorators (from drf-spectacular) annotate each endpoint
  with tags, summaries, descriptions, and example request/response bodies.
  drf-spectacular reads these annotations and builds the OpenAPI schema
  — visible at http://localhost:8000/api/docs/
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User

from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiParameter,
    OpenApiExample,
    OpenApiResponse,
    inline_serializer,
)
from drf_spectacular.types import OpenApiTypes
from rest_framework import serializers as drf_serializers

from .models import Task
from .serializers import RegisterSerializer, TaskSerializer


# ---------------------------------------------------------------------------
# Authentication Views
# ---------------------------------------------------------------------------

@extend_schema(
    tags=['Auth'],
    summary='Register a new user',
    description=(
        'Creates a new user account. No authentication required.\n\n'
        'After registering, use the **Login** endpoint to obtain JWT tokens.'
    ),
    request=RegisterSerializer,
    responses={
        201: RegisterSerializer,
        400: OpenApiResponse(description='Validation error (e.g. username already taken)'),
    },
    examples=[
        OpenApiExample(
            'Example request',
            value={'username': 'alice', 'email': 'alice@example.com', 'password': 'secret123'},
            request_only=True,
        ),
        OpenApiExample(
            'Example response',
            value={'id': 1, 'username': 'alice', 'email': 'alice@example.com'},
            response_only=True,
            status_codes=['201'],
        ),
    ],
)
class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/

    Creates a new user account.
    No authentication required — anyone can register.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]   # public endpoint — no token needed


@extend_schema(
    tags=['Auth'],
    summary='Logout (invalidate refresh token)',
    description=(
        'Blacklists the provided refresh token on the server so it can no '
        'longer be used to obtain new access tokens.\n\n'
        'After calling this, also remove both tokens from `localStorage` on the client.'
    ),
    request=inline_serializer(
        name='LogoutRequest',
        fields={'refresh': drf_serializers.CharField()},
    ),
    responses={
        200: OpenApiResponse(description='Logged out successfully'),
        400: OpenApiResponse(description='Invalid or expired refresh token'),
    },
    examples=[
        OpenApiExample(
            'Example request',
            value={'refresh': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'},
            request_only=True,
        ),
    ],
)
class LogoutView(APIView):
    """
    POST /api/auth/logout/

    Blacklists the refresh token so it can no longer be used.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()   # invalidate this specific refresh token
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Task Views
# ---------------------------------------------------------------------------

@extend_schema_view(
    # Annotate the GET (list) action
    list=extend_schema(
        tags=['Tasks'],
        summary='List my tasks',
        description=(
            'Returns all tasks belonging to the currently authenticated user.\n\n'
            'Use the optional `completed` query parameter to filter results.'
        ),
        parameters=[
            OpenApiParameter(
                name='completed',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Filter by completion status. Pass `true` or `false`.',
                enum=['true', 'false'],
            )
        ],
        responses={200: TaskSerializer(many=True)},
        examples=[
            OpenApiExample(
                'Filtered: pending tasks',
                value=[
                    {'id': 1, 'title': 'Buy groceries', 'description': 'Milk, bread', 'completed': False, 'created_at': '2026-04-14T10:00:00Z', 'user': 'alice'},
                ],
                response_only=True,
                status_codes=['200'],
            ),
        ],
    ),
    # Annotate the POST (create) action
    create=extend_schema(
        tags=['Tasks'],
        summary='Create a task',
        description='Creates a new task owned by the currently authenticated user.',
        request=TaskSerializer,
        responses={201: TaskSerializer},
        examples=[
            OpenApiExample(
                'Example request',
                value={'title': 'Buy groceries', 'description': 'Milk, bread, eggs'},
                request_only=True,
            ),
            OpenApiExample(
                'Example response',
                value={'id': 1, 'title': 'Buy groceries', 'description': 'Milk, bread, eggs', 'completed': False, 'created_at': '2026-04-14T10:00:00Z', 'user': 'alice'},
                response_only=True,
                status_codes=['201'],
            ),
        ],
    ),
)
class TaskListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/tasks/   → list all tasks for the logged-in user
    POST /api/tasks/   → create a new task

    BEGINNER TIP:
      get_queryset() is called automatically by DRF for GET requests.
      We FILTER by request.user so each user only sees their own tasks.

      perform_create() is called after validation succeeds on a POST.
      We inject request.user as the task owner here.
    """
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return only the tasks that belong to the currently logged-in user."""
        user = self.request.user
        completed_param = self.request.query_params.get('completed', None)
        queryset = Task.objects.filter(user=user)
        if completed_param is not None:
            is_completed = completed_param.lower() == 'true'
            queryset = queryset.filter(completed=is_completed)
        return queryset

    def perform_create(self, serializer):
        """Automatically set the task's user to the currently logged-in user."""
        serializer.save(user=self.request.user)


@extend_schema_view(
    retrieve=extend_schema(
        tags=['Tasks'],
        summary='Get a single task',
        description='Retrieves one task by ID. Only the owner can access it.',
        responses={
            200: TaskSerializer,
            404: OpenApiResponse(description='Task not found or not owned by you'),
        },
    ),
    update=extend_schema(
        tags=['Tasks'],
        summary='Fully update a task',
        description='Replaces all fields of an existing task (PUT — all fields required).',
        request=TaskSerializer,
        responses={200: TaskSerializer},
    ),
    partial_update=extend_schema(
        tags=['Tasks'],
        summary='Partially update a task',
        description=(
            'Updates only the provided fields (PATCH). Ideal for toggling `completed` '
            'without sending the full task body.'
        ),
        request=TaskSerializer,
        responses={200: TaskSerializer},
        examples=[
            OpenApiExample(
                'Toggle completed',
                value={'completed': True},
                request_only=True,
            ),
        ],
    ),
    destroy=extend_schema(
        tags=['Tasks'],
        summary='Delete a task',
        description='Permanently deletes a task. Only the owner can delete it.',
        responses={
            204: OpenApiResponse(description='Deleted successfully — no content returned'),
            404: OpenApiResponse(description='Task not found or not owned by you'),
        },
    ),
)
class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/tasks/<id>/   → get a single task
    PUT    /api/tasks/<id>/   → fully update a task
    PATCH  /api/tasks/<id>/   → partially update a task
    DELETE /api/tasks/<id>/   → delete a task

    BEGINNER TIP:
      get_queryset() again filters by user — this prevents a user from
      accessing another user's task even if they guess the task ID.
      This is called "object-level authorisation".
    """
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Only allow the owner to view/edit/delete their own task."""
        return Task.objects.filter(user=self.request.user)
