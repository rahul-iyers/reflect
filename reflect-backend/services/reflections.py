from datetime import date
from typing import Optional, List

from sqlalchemy.orm import Session
from models import DailyReflection

class InvalidReflectionDate(Exception):
    pass

class ReflectionNotFound(Exception):
    pass

def create_or_update_daily_reflection(
        *,
        db: Session,
        user_id: int,
        reflection_date: date,
        summary: Optional[str],
        accomplishments: Optional[str],
        improvements_to_make: Optional[str]
) -> DailyReflection:
    if reflection_date > date.today():
        raise InvalidReflectionDate("Err: Reflection date cannot be in the future.")
    reflection = db.query(DailyReflection).filter(
        DailyReflection.user_id == user_id,
        DailyReflection.reflection_date == reflection_date
        ).one_or_none()
    
    if reflection is None:
        reflection = DailyReflection(
            user_id=user_id,
            reflection_date=reflection_date,
            summary=summary,
            accomplishments=accomplishments,
            improvements_to_make=improvements_to_make
        )
        db.add(reflection)
    else:
        reflection.summary = summary
        reflection.accomplishments = accomplishments
        reflection.improvements_to_make = improvements_to_make
    db.commit()
    db.refresh(reflection)

    return reflection

def get_reflection_for_date(
        *,
        db: Session,
        user_id: int,
        reflection_date: date
) -> Optional[DailyReflection]:
    return (
        db.query(DailyReflection).filter(
            DailyReflection.user_id == user_id,
            DailyReflection.reflection_date == reflection_date
        )
        .one_or_none()
    )

def get_reflections_in_range(
        *,
        db: Session,
        user_id: int,
        start_date: date,
        end_date: date
) -> List[DailyReflection]:
    if start_date > end_date:
        raise InvalidReflectionDate("Err: Start date cannot be after end date.")
    
    return (
        db.query(DailyReflection).filter(
            DailyReflection.user_id == user_id,
            DailyReflection.reflection_date >= start_date,
            DailyReflection.reflection_date <= end_date
        )
        .order_by(DailyReflection.reflection_date.asc())
        .all()
    )

