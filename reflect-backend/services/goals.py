from datetime import date
from typing import List, Optional

from sqlalchemy.orm import Session

from models import Goal

class GoalNotFound(Exception):
    pass


class InvalidGoal(Exception):
    pass

def create_goal(
    *,
    db: Session,
    user_id: int,
    description: str,
    deadline: Optional[date] = None,
) -> Goal:
    """
    Create a new goal for a user.
    """

    if not description or not description.strip():
        raise InvalidGoal("Goal description cannot be empty.")

    goal = Goal(
        user_id=user_id,
        description=description.strip(),
        deadline=deadline,
        status="active",
    )

    db.add(goal)
    db.commit()
    db.refresh(goal)

    return goal


def get_goals_for_user(
    *,
    db: Session,
    user_id: int,
    status: Optional[str] = None,
) -> List[Goal]:
    """
    Fetch all goals for a user.

    Optionally filter by status.
    """

    query = db.query(Goal).filter(Goal.user_id == user_id)

    if status is not None:
        query = query.filter(Goal.status == status)

    return query.order_by(Goal.created_at.asc()).all()


def update_goal(
    *,
    db: Session,
    goal_id: int,
    user_id: int,
    description: Optional[str] = None,
    deadline: Optional[date] = None,
    status: Optional[str] = None,
) -> Goal:
    """
    Update an existing goal.

    Allows updating description, deadline, and status independently.
    """

    goal = (
        db.query(Goal)
        .filter(
            Goal.id == goal_id,
            Goal.user_id == user_id,
        )
        .one_or_none()
    )

    if goal is None:
        raise GoalNotFound("Goal not found.")

    if description is not None:
        if not description.strip():
            raise InvalidGoal("Goal description cannot be empty.")
        goal.description = description.strip()

    if deadline is not None:
        goal.deadline = deadline

    if status is not None:
        goal.status = status.strip()

    db.commit()
    db.refresh(goal)

    return goal