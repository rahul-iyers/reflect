from datetime import datetime, date, timezone
from db import Base

from sqlalchemy import (
    Column,
    Integer,
    Date,
    DateTime,
    Text,
    Time,
    Boolean,
    UniqueConstraint,
    ForeignKey
)

from sqlalchemy.orm import relationship


class DailyReflection(Base):
    __tablename__ = "daily_reflections"

    # identity
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)

    # time stuff
    reflection_date = Column(Date, nullable=False)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # reflection content
    summary = Column(Text, nullable=True)
    accomplishments = Column(Text, nullable=True)
    improvements_to_make = Column(Text, nullable=True)

    # uniqueness constraint
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "reflection_date",
            name="uq_user_reflection_date",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<DailyReflection "
            f"id={self.id} "
            f"user_id={self.user_id} "
            f"reflection_date={self.reflection_date}>"
        )
    
class JournalEntry(Base):
    __tablename__ = "journal_entries"

    # identity
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)

    # optional link to daily reflection
    reflection_id = Column(
        Integer,
        ForeignKey("daily_reflections.id", ondelete="SET NULL"),
        nullable=True,
    )

    # content
    content = Column(Text, nullable=False)

    # time
    entry_date = Column(Date, nullable=False)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # relationship
    reflection = relationship(
        "DailyReflection",
        backref="journal_entries",
    )

    def __repr__(self) -> str:
        return (
            f"<JournalEntry "
            f"id={self.id} "
            f"user_id={self.user_id} "
            f"entry_date={self.entry_date}>"
        )

class Goal(Base):
    __tablename__ = "goals"

    # identity
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)

    # goal content
    description = Column(Text, nullable=False)

    # time
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    deadline = Column(
        Date,
        nullable=True,   # deadlines can be added later or removed
    )

    # status
    status = Column(
        Text,
        nullable=False,
        default="active",
    )

    def __repr__(self) -> str:
        return (
            f"<Goal "
            f"id={self.id} "
            f"user_id={self.user_id} "
            f"status={self.status} "
            f"deadline={self.deadline}>"
        )

class ScheduledTask(Base):
    __tablename__ = "scheduled_tasks"

    # identity
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)

    # task content
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)

    # time scheduling
    task_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    # recurrence
    is_recurring = Column(Boolean, default=False, nullable=False)
    recurrence_pattern = Column(Text, nullable=True)  # 'daily', 'weekly', 'weekdays', or JSON for custom

    # status
    is_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # metadata
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return (
            f"<ScheduledTask "
            f"id={self.id} "
            f"user_id={self.user_id} "
            f"title={self.title} "
            f"date={self.task_date} "
            f"time={self.start_time}-{self.end_time}>"
        )
