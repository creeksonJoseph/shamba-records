from datetime import date


class PlantStatusService:
    """
    Computes the status of a plant based on its stage, override flag, and planting progress.

    Priority order:
        1. stage == 'harvested'          → completed  (always wins)
        2. status_override == 'at_risk'  → at_risk    (agent flagged disease/issue)
        3. status_override == 'healthy'  → active     (agent confirmed healthy, overrides timeline)
        4. progress > 1.2 (20% overdue) → at_risk    (automatic)
        5. everything else               → active

    where progress = days_elapsed / expected_days
    """

    @staticmethod
    def compute_status(plant) -> str:
        # 1. Harvested always wins
        if plant.stage == 'harvested':
            return 'completed'

        # 2 & 3. Manual agent override takes precedence over timeline
        if getattr(plant, 'status_override', None) == 'at_risk':
            return 'at_risk'
        if getattr(plant, 'status_override', None) == 'healthy':
            return 'active'

        # 4. Automatic time-based computation
        if plant.planting_date and plant.expected_days:
            days_elapsed = (date.today() - plant.planting_date).days
            progress = days_elapsed / plant.expected_days
            if progress > 1.2:
                return 'at_risk'

        return 'active'
