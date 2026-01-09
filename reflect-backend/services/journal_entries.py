from datetime import date
from typing import Optional, List

from sqlalchemy.orm import Session
from models import DailyReflection, JournalEntry

class JournalEntryNotFound(Exception):
    pass

class InvalidJournalEntry(Exception):
    pass

def create_journal_entry(
    *,
    db: Session,
    user_id: int,
    content: str,
    entry_date: date,
    reflection_id: Optional[int] = None,
) -> JournalEntry:
    if not content or not content.strip():
        raise InvalidJournalEntry("Journal entry content cannot be empty.")

    # Optional: validate reflection belongs to the same user
    if reflection_id is not None:
        reflection = (
            db.query(DailyReflection)
            .filter(
                DailyReflection.id == reflection_id,
                DailyReflection.user_id == user_id,
            )
            .one_or_none()
        )

        if reflection is None:
            raise InvalidJournalEntry(
                "Reflection does not exist or does not belong to user."
            )

    entry = JournalEntry(
        user_id=user_id,
        content=content,
        entry_date=entry_date,
        reflection_id=reflection_id,
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return entry


def get_journal_entries_for_date(
    *,
    db: Session,
    user_id: int,
    entry_date: date,
) -> List[JournalEntry]:
    """
    Fetch all journal entries for a user on a given date,
    ordered by creation time.
    """

    return (
        db.query(JournalEntry)
        .filter(
            JournalEntry.user_id == user_id,
            JournalEntry.entry_date == entry_date,
        )
        .order_by(JournalEntry.created_at.asc())
        .all()
    )


def update_journal_entry(
    *,
    db: Session,
    entry_id: int,
    user_id: int,
    content: Optional[str] = None,
    reflection_id: Optional[int] = None,
) -> JournalEntry:
    """
    Update an existing journal entry.

    Requires explicit entry_id.
    """

    entry = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == user_id,
        )
        .one_or_none()
    )

    if entry is None:
        raise JournalEntryNotFound("Journal entry not found.")

    if content is not None:
        if not content.strip():
            raise InvalidJournalEntry("Journal entry content cannot be empty.")
        entry.content = content

    if reflection_id is not None:
        if reflection_id is not None:
            reflection = (
                db.query(DailyReflection)
                .filter(
                    DailyReflection.id == reflection_id,
                    DailyReflection.user_id == user_id,
                )
                .one_or_none()
            )

            if reflection is None:
                raise InvalidJournalEntry(
                    "Reflection does not exist or does not belong to user."
                )

        entry.reflection_id = reflection_id

    db.commit()
    db.refresh(entry)

    return entry


def delete_journal_entry(
    *,
    db: Session,
    entry_id: int,
    user_id: int,
) -> None:
    """
    Delete a journal entry.

    Requires explicit entry_id and verifies user ownership.
    """
    entry = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == user_id,
        )
        .one_or_none()
    )

    if entry is None:
        raise JournalEntryNotFound("Journal entry not found.")

    db.delete(entry)
    db.commit()
