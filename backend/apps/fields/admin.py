from django.contrib import admin
from .models import Field


@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display = ['name', 'location', 'assigned_agent', 'created_by', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'location']
    raw_id_fields = ['assigned_agent', 'created_by']
