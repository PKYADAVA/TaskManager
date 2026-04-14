"""
admin.py — Register models to make them visible in Django's admin panel.

Visit http://localhost:8000/admin/ after creating a superuser.
"""

from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display  = ['title', 'user', 'completed', 'created_at']
    list_filter   = ['completed', 'user']
    search_fields = ['title', 'description']
