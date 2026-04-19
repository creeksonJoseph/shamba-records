from datetime import date


class PlantStatusService:
    """
    Computes the status of a plant based on its stage and planting progress.

    Rules (from the design spec):
        stage == 'harvested'                → completed
        progress > 1.2  (20% overdue)      → at_risk
        everything else                     → active

    where progress = days_elapsed / expected_days
    """

    @staticmethod
    def compute_status(plant) -> str:
        if plant.stage == 'harvested':
            return 'completed'

        if plant.planting_date and plant.expected_days:
            days_elapsed = (date.today() - plant.planting_date).days
            progress = days_elapsed / plant.expected_days
            if progress > 1.2:
                return 'at_risk'

        return 'active'
