"""
models.py — Database schema definition.

BEGINNER TIP:
  A Django "model" is a Python class that maps to a database table.
  Each attribute you define becomes a column in that table.
  Django's ORM (Object-Relational Mapper) writes the SQL for you —
  you just work with normal Python objects.

TABLES CREATED:
  - tasks_task  (Task model below)
  Django also uses the built-in auth_user table for User — no extra work needed!
"""

from django.db import models
from django.contrib.auth.models import User   # Django's built-in User model


class Task(models.Model):
    """
    Represents a single to-do task belonging to a user.

    Relationship:
      Task  ---many-to-one--->  User
      (One user can have many tasks; each task belongs to one user.)
    """

    # CharField stores short text (up to max_length characters)
    title = models.CharField(max_length=255)

    # TextField stores long text (no character limit in practice)
    description = models.TextField(blank=True)   # blank=True → optional field

    # BooleanField stores True/False; default is False (not completed)
    completed = models.BooleanField(default=False)

    # DateTimeField with auto_now_add=True automatically sets the timestamp
    # when the record is FIRST created — you never set this yourself.
    created_at = models.DateTimeField(auto_now_add=True)

    # ForeignKey links this task to one User.
    # on_delete=CASCADE means: if the user is deleted, delete their tasks too.
    # related_name='tasks' lets us do user.tasks.all() from the User side.
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tasks'
    )

    class Meta:
        # Default ordering: newest tasks appear first
        ordering = ['-created_at']

    def __str__(self):
        # What Django shows when you print a Task object, e.g. in the admin
        return f"{self.title} (by {self.user.username})"
