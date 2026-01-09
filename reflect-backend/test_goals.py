from datetime import date, timedelta

from db import Base, engine, SessionLocal
from models import Goal
from services.goals import (
    create_goal,
    get_goals_for_user,
    update_goal,
)


def main():
    print("=== Creating tables ===")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        user_id = 1
        today = date.today()
        next_week = today + timedelta(days=7)

        print("\n=== Creating goals ===")
        goal1 = create_goal(
            db=db,
            user_id=user_id,
            description="Finish journaling + goals backend",
            deadline=next_week,
        )
        print(goal1)

        goal2 = create_goal(
            db=db,
            user_id=user_id,
            description="Add AI morning focus summary",
            deadline=None,
        )
        print(goal2)

        print("\n=== Fetching all goals ===")
        goals = get_goals_for_user(
            db=db,
            user_id=user_id,
        )
        for g in goals:
            print(g)

        print("\n=== Updating goal status and deadline ===")
        updated = update_goal(
            db=db,
            goal_id=goal1.id,
            user_id=user_id,
            status="completed",
            deadline=today,
        )
        print(updated)

        print("\n=== Fetching active goals only ===")
        active_goals = get_goals_for_user(
            db=db,
            user_id=user_id,
            status="active",
        )
        for g in active_goals:
            print(g)

        print("\n=== Fetching completed goals only ===")
        completed_goals = get_goals_for_user(
            db=db,
            user_id=user_id,
            status="completed",
        )
        for g in completed_goals:
            print(g)

    finally:
        db.close()
        print("\n=== DB session closed ===")


if __name__ == "__main__":
    main()
