from datetime import date, timedelta

from db import Base, engine, SessionLocal
from models import DailyReflection
from services.reflections import (
    create_or_update_daily_reflection,
    get_reflection_for_date,
    get_reflections_in_range,
)


def main():
    print("=== Creating tables ===")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        user_id = 1
        today = date.today()
        yesterday = today - timedelta(days=1)

        print("\n=== Creating reflection for yesterday ===")
        r1 = create_or_update_daily_reflection(
            db=db,
            user_id=user_id,
            reflection_date=yesterday,
            summary="Felt productive but tired",
            accomplishments="Finished backend setup",
            improvements_to_make="Start earlier in the day",
        )
        print(r1)

        print("\n=== Creating reflection for today ===")
        r2 = create_or_update_daily_reflection(
            db=db,
            user_id=user_id,
            reflection_date=today,
            summary="Good focus",
            accomplishments="Implemented service layer",
            improvements_to_make="Take more breaks",
        )
        print(r2)

        print("\n=== Updating today's reflection ===")
        r2_updated = create_or_update_daily_reflection(
            db=db,
            user_id=user_id,
            reflection_date=today,
            summary="Very focused",
            accomplishments="Finished service + test script",
            improvements_to_make="None",
        )
        print(r2_updated)

        print("\n=== Fetching reflection for today ===")
        fetched = get_reflection_for_date(
            db=db,
            user_id=user_id,
            reflection_date=today,
        )
        print(fetched)
        print("Summary:", fetched.summary)

        print("\n=== Fetching reflections in range ===")
        reflections = get_reflections_in_range(
            db=db,
            user_id=user_id,
            start_date=yesterday,
            end_date=today,
        )
        for r in reflections:
            print(r.reflection_date, r.summary)

    finally:
        db.close()
        print("\n=== DB session closed ===")


if __name__ == "__main__":
    main()
