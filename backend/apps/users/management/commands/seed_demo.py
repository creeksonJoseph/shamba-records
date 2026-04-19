from datetime import date, timedelta
from django.core.management.base import BaseCommand
from apps.users.models import CustomUser
from apps.fields.models import Field
from apps.plants.models import Plant


class Command(BaseCommand):
    help = 'Seed demo data: 1 admin, 2 agents, 3 fields, 5 plants with varied stages'

    def handle(self, *args, **kwargs):
        self.stdout.write('🌱  Seeding demo data...')

        # --- Users ---
        admin, _ = CustomUser.objects.get_or_create(
            email='admin@smartseason.com',
            defaults={'name': 'Admin User', 'role': 'admin', 'is_staff': True},
        )
        admin.set_password('admin1234')
        admin.save()

        agent1, _ = CustomUser.objects.get_or_create(
            email='agent1@smartseason.com',
            defaults={'name': 'Alice Kamau', 'role': 'agent'},
        )
        agent1.set_password('agent1234')
        agent1.save()

        agent2, _ = CustomUser.objects.get_or_create(
            email='agent2@smartseason.com',
            defaults={'name': 'Bob Otieno', 'role': 'agent'},
        )
        agent2.set_password('agent1234')
        agent2.save()

        # --- Fields ---
        f1, _ = Field.objects.get_or_create(
            name='Kiambu North Plot',
            defaults={'location': 'Kiambu, Kenya', 'assigned_agent': agent1, 'created_by': admin},
        )
        f2, _ = Field.objects.get_or_create(
            name='Nakuru South Farm',
            defaults={'location': 'Nakuru, Kenya', 'assigned_agent': agent2, 'created_by': admin},
        )
        f3, _ = Field.objects.get_or_create(
            name='Meru Highland Plot',
            defaults={'location': 'Meru, Kenya', 'assigned_agent': agent1, 'created_by': admin},
        )

        # --- Plants (varied stages & statuses) ---
        today = date.today()

        Plant.objects.get_or_create(
            field=f1, crop_type='Maize',
            defaults={
                'created_by': agent1,
                'planting_date': today - timedelta(days=40),
                'expected_days': 90,
                'stage': 'growing',
            },
        )
        Plant.objects.get_or_create(
            field=f1, crop_type='Beans',
            defaults={
                'created_by': agent1,
                'planting_date': today - timedelta(days=120),   # overdue → at_risk
                'expected_days': 80,
                'stage': 'growing',
            },
        )
        Plant.objects.get_or_create(
            field=f2, crop_type='Tomatoes',
            defaults={
                'created_by': agent2,
                'planting_date': today - timedelta(days=100),
                'expected_days': 90,
                'stage': 'harvested',   # → completed
            },
        )
        Plant.objects.get_or_create(
            field=f3, crop_type='Wheat',
            defaults={
                'created_by': agent1,
                'planting_date': today - timedelta(days=10),
                'expected_days': 120,
                'stage': 'planted',
            },
        )
        Plant.objects.get_or_create(
            field=f3, crop_type='Potatoes',
            defaults={
                'created_by': agent1,
                'planting_date': today - timedelta(days=70),
                'expected_days': 90,
                'stage': 'ready',
            },
        )

        self.stdout.write(self.style.SUCCESS('✅  Demo data seeded!'))
        self.stdout.write(self.style.SUCCESS('   Admin:   admin@smartseason.com  /  admin1234'))
        self.stdout.write(self.style.SUCCESS('   Agent 1: agent1@smartseason.com /  agent1234'))
        self.stdout.write(self.style.SUCCESS('   Agent 2: agent2@smartseason.com /  agent1234'))
