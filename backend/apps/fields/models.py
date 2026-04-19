import uuid
from django.db import models
from django.conf import settings


class Field(models.Model):
    """
    A physical land parcel managed by admins and assigned to an agent.
    Agents cannot create fields — only admins can.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    location = models.TextField(blank=True)
    assigned_agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_fields',
        limit_choices_to={'role': 'agent'},
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_fields',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'fields'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
