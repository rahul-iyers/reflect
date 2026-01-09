from datetime import date, timedelta
from typing import Dict
from sqlalchemy.orm import Session
from models import DailyReflection


def get_user_stats(*, db: Session, user_id: int) -> Dict:
    """
    Calculate user statistics including streak and total reflections.
    """
    # Get all reflections for user, ordered by date descending
    reflections = (
        db.query(DailyReflection)
        .filter(DailyReflection.user_id == user_id)
        .order_by(DailyReflection.reflection_date.desc())
        .all()
    )

    total_reflections = len(reflections)

    if total_reflections == 0:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "total_reflections": 0
        }

    # Calculate current streak
    current_streak = 0
    today = date.today()
    check_date = today

    reflection_dates = {r.reflection_date for r in reflections}

    # Check if there's a reflection today or yesterday to start the streak
    if today in reflection_dates:
        current_streak = 1
        check_date = today - timedelta(days=1)
    elif (today - timedelta(days=1)) in reflection_dates:
        current_streak = 1
        check_date = today - timedelta(days=2)
    else:
        current_streak = 0

    # Count consecutive days backwards
    while check_date in reflection_dates:
        current_streak += 1
        check_date -= timedelta(days=1)

    # Calculate longest streak
    longest_streak = 0
    temp_streak = 0

    sorted_dates = sorted(reflection_dates)

    if sorted_dates:
        temp_streak = 1
        for i in range(1, len(sorted_dates)):
            diff = (sorted_dates[i] - sorted_dates[i-1]).days
            if diff == 1:
                temp_streak += 1
            else:
                longest_streak = max(longest_streak, temp_streak)
                temp_streak = 1
        longest_streak = max(longest_streak, temp_streak)

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "total_reflections": total_reflections
    }
