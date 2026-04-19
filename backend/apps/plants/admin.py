from django.contrib import admin
from .models import Plant, PlantUpdate


@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    list_display = ['crop_type', 'field', 'stage', 'status', 'planting_date', 'expected_days', 'created_by']
    list_filter = ['stage', 'status']
    search_fields = ['crop_type', 'field__name']
    raw_id_fields = ['field', 'created_by']


@admin.register(PlantUpdate)
class PlantUpdateAdmin(admin.ModelAdmin):
    list_display = ['plant', 'agent', 'new_stage', 'created_at']
    list_filter = ['new_stage', 'created_at']
    raw_id_fields = ['plant', 'agent']
