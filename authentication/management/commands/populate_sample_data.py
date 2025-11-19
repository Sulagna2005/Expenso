from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from goals.models import Challenge
from transactions.models import Notification

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create sample challenges
        challenges = [
            {
                'title': 'Save $100 this month',
                'description': 'Reduce your expenses and save at least $100',
                'reward_points': 50,
                'target_amount': 100.00
            },
            {
                'title': 'No dining out for a week',
                'description': 'Cook at home for 7 consecutive days',
                'reward_points': 30,
                'target_amount': 0.00
            },
            {
                'title': 'Track every expense',
                'description': 'Log all your expenses for 30 days',
                'reward_points': 25,
                'target_amount': 0.00
            }
        ]
        
        for challenge_data in challenges:
            challenge, created = Challenge.objects.get_or_create(
                title=challenge_data['title'],
                defaults=challenge_data
            )
            if created:
                self.stdout.write(f'Created challenge: {challenge.title}')
        
        self.stdout.write(
            self.style.SUCCESS('Successfully populated sample data!')
        )