from datetime import date, timedelta

from db import Base, engine, SessionLocal
from models import DailyReflection, JournalEntry
from services.reflections import create_or_update_daily_reflection
from services.journal_entries import (
    create_journal_entry,
    get_journal_entries_for_date,
    update_journal_entry,
)


def main():
    print("=== Creating tables ===")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        user_id = 1
        today = date.today()
        yesterday = today - timedelta(days=1)

        print("\n=== Creating daily reflection ===")
        reflection = create_or_update_daily_reflection(
            db=db,
            user_id=user_id,
            reflection_date=yesterday,
            summary="Reflecting day",
            accomplishments="Built journal entries",
            improvements_to_make="None",
        )
        print(reflection)

        print("\n=== Creating journal entry ===")
        entry = create_journal_entry(
            db=db,
            user_id=user_id,
            content="Today I added journal entries to the system.",
            entry_date=yesterday,
            reflection_id=reflection.id,
        )
        print(entry)

        print("\n=== Fetching journal entries for date ===")
        entries = get_journal_entries_for_date(
            db=db,
            user_id=user_id,
            entry_date=yesterday,
        )

        for e in entries:
            print(e, "| reflection:", e.reflection)

        print("\n=== Updating journal entry ===")
        updated = update_journal_entry(
            db=db,
            entry_id=entry.id,
            user_id=user_id,
            content="Updated journal entry after review.",
        )
        print(updated)

        print("\n=== Access via relationship ===")
        for je in reflection.journal_entries:
            print("Reflection linked entry:", je)

    finally:
        db.close()
        print("\n=== DB session closed ===")


if __name__ == "__main__":
    main()
