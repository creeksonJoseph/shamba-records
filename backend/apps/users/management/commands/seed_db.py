import random
from datetime import timedelta
from django.utils import timezone
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from apps.fields.models import Field
from apps.plants.models import Plant, PlantUpdate

CustomUser = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with users, fields, and plants'

    def handle(self, *args, **options):
        self.stdout.write("Starting database seeding...")

        # 1. Create Admins
        admins = []
        for i in range(1, 3):
            admin, created = CustomUser.objects.get_or_create(
                email=f'admin{i}@example.com',
                defaults={
                    'name': f'Admin User {i}',
                    'role': 'admin',
                    'is_staff': True,
                }
            )
            if created:
                admin.set_password('password123')
                admin.save()
            admins.append(admin)
        self.stdout.write(f"Ensure {len(admins)} admins exist.")

        # 2. Create Agents
        agents = []
        for i in range(1, 4):
            agent, created = CustomUser.objects.get_or_create(
                email=f'agent{i}@example.com',
                defaults={
                    'name': f'Field Agent {i}',
                    'role': 'agent',
                }
            )
            if created:
                agent.set_password('password123')
                agent.save()
            agents.append(agent)
        self.stdout.write(f"Ensure {len(agents)} agents exist.")

        # 3. Create 6 Fields
        field_locations = ['North Sector', 'South Valley', 'East Highland', 'West Plains', 'Central Hub', 'River Bed']
        fields = []
        for i in range(6):
            assigned_agent = agents[i % len(agents)]
            field, created = Field.objects.get_or_create(
                name=f'Field {i+1}',
                defaults={
                    'location': field_locations[i],
                    'assigned_agent': assigned_agent,
                    'created_by': admins[0],
                }
            )
            fields.append(field)
        self.stdout.write(f"Ensure {len(fields)} fields exist.")

        # 4. Create 20 Plants
        crop_types = ['Corn', 'Wheat', 'Soybeans', 'Tomatoes', 'Potatoes', 'Carrots', 'Coffee', 'Tea', 'Cotton']
        stages = ['planted', 'growing', 'ready', 'harvested']
        overrides = [None, None, 'at_risk', 'healthy']

        plants_created = 0
        for i in range(20):
            field = random.choice(fields)
            crop_type = random.choice(crop_types)
            stage = random.choice(stages)
            
            # Randomize planting date from 60 days ago to today
            days_ago = random.randint(0, 60)
            planting_date = timezone.now().date() - timedelta(days=days_ago)
            
            # Expected days randomly between 30 and 120
            expected_days = random.randint(30, 120)
            
            # Ensure uniqueness just in case we run it multiple times by checking field + type (we will just create new ones otherwise, but checking is safe)
            # Actually, multiple corn crops can exist on one field. Let's just create them.
            plant = Plant.objects.create(
                field=field,
                created_by=field.assigned_agent,
                crop_type=crop_type,
                planting_date=planting_date,
                expected_days=expected_days,
                stage=stage,
                status_override=random.choice(overrides),
                notes=f"Auto-generated sample for {crop_type}."
            )
            plants_created += 1
            
            # Create an initial update log
            PlantUpdate.objects.create(
                plant=plant,
                agent=field.assigned_agent,
                new_stage=stage,
                observation=f"Initial seed block: Status imported as {stage}."
            )

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {plants_created} new plants into the system!"))
