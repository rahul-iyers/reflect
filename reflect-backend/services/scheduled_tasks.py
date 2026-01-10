from datetime import datetime, date, time, timezone
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from models import ScheduledTask


class ScheduledTaskNotFound(Exception):
    pass


def create_scheduled_task(
    *,
    db: Session,
    user_id: int,
    title: str,
    description: Optional[str],
    task_date: date,
    start_time: time,
    end_time: time,
    is_recurring: bool = False,
    recurrence_pattern: Optional[str] = None,
) -> ScheduledTask:
    """
    Create a new scheduled task.
    """
    task = ScheduledTask(
        user_id=user_id,
        title=title,
        description=description,
        task_date=task_date,
        start_time=start_time,
        end_time=end_time,
        is_recurring=is_recurring,
        recurrence_pattern=recurrence_pattern,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def get_scheduled_tasks_for_week(
    *,
    db: Session,
    user_id: int,
    start_date: date,
    end_date: date,
) -> List[ScheduledTask]:
    """
    Get all scheduled tasks for a user within a date range (typically a week).
    """
    tasks = (
        db.query(ScheduledTask)
        .filter(
            ScheduledTask.user_id == user_id,
            ScheduledTask.task_date >= start_date,
            ScheduledTask.task_date <= end_date,
        )
        .order_by(ScheduledTask.task_date, ScheduledTask.start_time)
        .all()
    )
    return tasks


def get_scheduled_task(
    *,
    db: Session,
    task_id: int,
    user_id: int,
) -> ScheduledTask:
    """
    Get a single scheduled task by ID.
    """
    task = (
        db.query(ScheduledTask)
        .filter(
            ScheduledTask.id == task_id,
            ScheduledTask.user_id == user_id,
        )
        .one_or_none()
    )

    if task is None:
        raise ScheduledTaskNotFound("Scheduled task not found.")

    return task


def update_scheduled_task(
    *,
    db: Session,
    task_id: int,
    user_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    task_date: Optional[date] = None,
    start_time: Optional[time] = None,
    end_time: Optional[time] = None,
    is_recurring: Optional[bool] = None,
    recurrence_pattern: Optional[str] = None,
    is_completed: Optional[bool] = None,
) -> ScheduledTask:
    """
    Update a scheduled task.
    """
    task = get_scheduled_task(db=db, task_id=task_id, user_id=user_id)

    if title is not None:
        task.title = title
    if description is not None:
        task.description = description
    if task_date is not None:
        task.task_date = task_date
    if start_time is not None:
        task.start_time = start_time
    if end_time is not None:
        task.end_time = end_time
    if is_recurring is not None:
        task.is_recurring = is_recurring
    if recurrence_pattern is not None:
        task.recurrence_pattern = recurrence_pattern
    if is_completed is not None:
        task.is_completed = is_completed
        if is_completed:
            task.completed_at = datetime.now(timezone.utc)
        else:
            task.completed_at = None

    db.commit()
    db.refresh(task)
    return task


def delete_scheduled_task(
    *,
    db: Session,
    task_id: int,
    user_id: int,
) -> None:
    """
    Delete a scheduled task.
    """
    task = get_scheduled_task(db=db, task_id=task_id, user_id=user_id)
    db.delete(task)
    db.commit()
