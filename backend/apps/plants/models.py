import uuid
from django.db import models
from django.conf import settings

STAGE_CHOICES = [
    ('planted', 'Planted'),
    ('growing', 'Growing'),
    ('ready', 'Ready'),
    ('harvested', 'Harvested'),
]

STATUS_CHOICES = [
    ('active', 'Active'),
    ('at_risk', 'At Risk'),
    ('completed', 'Completed'),
]

STATUS_OVERRIDE_CHOICES = [
    ('at_risk', 'At Risk'),
    ('healthy', 'Healthy'),
]


class Plant(models.Model):
    """
    A crop record on a field, created by an agent.
    Status is automatically computed on every save via PlantStatusService.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    field = models.ForeignKey(
        'fields.Field',
        on_delete=models.CASCADE,
        related_name='plants',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_plants',
    )
    crop_type = models.CharField(max_length=100)
    planting_date = models.DateField()
    expected_days = models.PositiveIntegerField(help_text='Expected days from planting to harvest')
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='planted')
    status_override = models.CharField(
        max_length=20,
        choices=STATUS_OVERRIDE_CHOICES,
        null=True,
        blank=True,
        help_text='Agent-set override: forces at_risk or healthy regardless of timeline.',
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'plants'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.crop_type} on {self.field.name}"

    def save(self, *args, **kwargs):
        from .services import PlantStatusService
        self.status = PlantStatusService.compute_status(self)
        super().save(*args, **kwargs)


class PlantUpdate(models.Model):
    """
    Append-only audit log — every stage change or observation is recorded here.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plant = models.ForeignKey(Plant, on_delete=models.CASCADE, related_name='updates')
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='plant_updates',
    )
    new_stage = models.CharField(max_length=20, choices=STAGE_CHOICES, blank=True)
    observation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'plant_updates'
        ordering = ['-created_at']

    def __str__(self):
        return f"Update on {self.plant} ({self.created_at:%Y-%m-%d})"
