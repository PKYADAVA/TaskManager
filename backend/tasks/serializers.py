"""
serializers.py — Convert between Python objects and JSON.

BEGINNER TIP:
  Serializers are like translators between your database models and JSON.

  Django stores data as Python objects.
  React (and the browser) speaks JSON.

  A serializer does TWO things:
    1. Serialization:   Python object  →  JSON  (for API responses)
    2. Deserialization: JSON           →  Python object  (for API requests / validation)
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Task


# ---------------------------------------------------------------------------
# User Registration Serializer
# ---------------------------------------------------------------------------
class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles new user sign-up.

    We add a `password` field manually (write_only=True means it will NEVER
    be sent back in API responses — a security best practice).
    """

    password = serializers.CharField(
        write_only=True,          # password goes IN; never comes OUT
        min_length=8,             # enforce minimum length
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        # Only expose these fields in the API
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        """
        Override create() to use Django's create_user() helper,
        which properly HASHES the password before storing it.
        Never store plain-text passwords!
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        return user


# ---------------------------------------------------------------------------
# Task Serializer
# ---------------------------------------------------------------------------
class TaskSerializer(serializers.ModelSerializer):
    """
    Handles Task create / read / update / delete.

    `user` is read-only because we assign the logged-in user automatically
    in the view — we don't let the client specify an arbitrary user id.
    """

    # Show username string instead of just the numeric user id
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'completed', 'created_at', 'user']
        read_only_fields = ['id', 'created_at', 'user']

    # No custom create/update needed — ModelSerializer handles it automatically.
