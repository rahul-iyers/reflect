from datetime import date, time, datetime
from flask import Flask, request, jsonify, g
from flask_cors import CORS
app = Flask(__name__)
CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:5173"}},
    supports_credentials=True
)

from db import SessionLocal
from services.reflections import (
    create_or_update_daily_reflection,
    get_reflection_for_date,
    get_reflections_in_range,
    InvalidReflectionDate,
)

from services.journal_entries import (
    create_journal_entry,
    get_journal_entries_for_date,
    update_journal_entry,
    delete_journal_entry,
    InvalidJournalEntry,
    JournalEntryNotFound
)

from services.goals import (
    create_goal,
    get_goals_for_user,
    update_goal,
    InvalidGoal,
    GoalNotFound
)

from services.stats import get_user_stats

from services.scheduled_tasks import (
    create_scheduled_task,
    get_scheduled_tasks_for_week,
    update_scheduled_task,
    delete_scheduled_task,
    ScheduledTaskNotFound
)

from services.ai_insights import generate_morning_insights

# -- HELPERS --

def parse_date(value: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError:
        raise InvalidReflectionDate("invalid date format: should be YYYY-MM-DD.")

def parse_time(value: str) -> time:
    """Parse time string in HH:MM format"""
    try:
        return datetime.strptime(value, "%H:%M").time()
    except ValueError:
        raise ValueError("invalid time format: should be HH:MM.")

def reflection_to_dict(reflection):
    # Ensure timezone-aware datetime serialization
    from datetime import timezone
    created_at = reflection.created_at.replace(tzinfo=timezone.utc) if reflection.created_at.tzinfo is None else reflection.created_at
    updated_at = reflection.updated_at.replace(tzinfo=timezone.utc) if reflection.updated_at.tzinfo is None else reflection.updated_at

    return {
        "id": reflection.id,
        "user_id": reflection.user_id,
        "reflection_date": reflection.reflection_date.isoformat(),
        "summary": reflection.summary,
        "accomplishments": reflection.accomplishments,
        "improvements_to_make": reflection.improvements_to_make,
        "created_at": created_at.isoformat(),
        "updated_at": updated_at.isoformat()
    }

def journal_entry_to_dict(entry):
    # Ensure timezone-aware datetime serialization
    from datetime import timezone
    created_at = entry.created_at.replace(tzinfo=timezone.utc) if entry.created_at.tzinfo is None else entry.created_at
    updated_at = entry.updated_at.replace(tzinfo=timezone.utc) if entry.updated_at.tzinfo is None else entry.updated_at

    return {
        "id": entry.id,
        "user_id": entry.user_id,
        "content": entry.content,
        "entry_date": entry.entry_date.isoformat(),
        "reflection_id": entry.reflection_id,
        "created_at": created_at.isoformat(),
        "updated_at": updated_at.isoformat(),
    }

def goal_to_dict(goal):
    # Ensure timezone-aware datetime serialization
    from datetime import timezone
    created_at = goal.created_at.replace(tzinfo=timezone.utc) if goal.created_at.tzinfo is None else goal.created_at

    return {
        "id": goal.id,
        "user_id": goal.user_id,
        "description": goal.description,
        "status": goal.status,
        "deadline": goal.deadline.isoformat() if goal.deadline else None,
        "created_at": created_at.isoformat(),
    }

def scheduled_task_to_dict(task):
    # Ensure timezone-aware datetime serialization
    from datetime import timezone
    created_at = task.created_at.replace(tzinfo=timezone.utc) if task.created_at.tzinfo is None else task.created_at
    updated_at = task.updated_at.replace(tzinfo=timezone.utc) if task.updated_at.tzinfo is None else task.updated_at
    completed_at = task.completed_at.replace(tzinfo=timezone.utc) if task.completed_at and task.completed_at.tzinfo is None else task.completed_at

    return {
        "id": task.id,
        "user_id": task.user_id,
        "title": task.title,
        "description": task.description,
        "task_date": task.task_date.isoformat(),
        "start_time": task.start_time.strftime("%H:%M"),
        "end_time": task.end_time.strftime("%H:%M"),
        "is_recurring": task.is_recurring,
        "recurrence_pattern": task.recurrence_pattern,
        "is_completed": task.is_completed,
        "completed_at": completed_at.isoformat() if completed_at else None,
        "created_at": created_at.isoformat(),
        "updated_at": updated_at.isoformat(),
    }

# -- ROUTES --

@app.before_request
def load_user():

    # code to allow cors connection between react and flask
    if request.method == "OPTIONS":
        return None
    """
    temporary identity loader.
    Expects X-User-Id header.
    """
    user_id = request.headers.get("X-User-Id")

    if user_id is None:
        return jsonify({"error": "X-User-Id header required"}), 401

    try:
        g.user_id = int(user_id)
    except ValueError:
        return jsonify({"error": "X-User-Id must be an integer"}), 400


# -- DAILY REFLECTION ROUTES --

@app.route("/api/reflections", methods=["POST"])
def create_or_update_reflection():
    db = SessionLocal()
    try:
        data = request.get_json()

        # providing user identity via request header
        user_id = g.user_id

        reflection = create_or_update_daily_reflection(
            db=db,
            user_id=user_id,
            reflection_date=parse_date(data["reflection_date"]),
            summary=data.get("summary"),
            accomplishments=data.get("accomplishments"),
            improvements_to_make=data.get("improvements_to_make"),
        )

        return jsonify(reflection_to_dict(reflection)), 200
    
    except InvalidReflectionDate as e:
        return jsonify({"error": str(e)}), 400
    
    finally: 
        db.close()


@app.route("/api/reflections", methods=["GET"])
def get_reflections():
    db = SessionLocal()
    try:

        # providing user identity via request header
        user_id = g.user_id

        if "date" in request.args:
            reflection = get_reflection_for_date(
                db=db,
                user_id=user_id,
                reflection_date=parse_date(request.args["date"]),
            )

            if reflection is None:
                return jsonify(None), 200

            return jsonify(reflection_to_dict(reflection)), 200

        if "start" in request.args and "end" in request.args:
            reflections = get_reflections_in_range(
                db=db,
                user_id=user_id,
                start_date=parse_date(request.args["start"]),
                end_date=parse_date(request.args["end"]),
            )

            return jsonify(
                [reflection_to_dict(r) for r in reflections]
            ), 200

        return jsonify({"error": "invalid query parameters"}), 400

    except InvalidReflectionDate as e:
        return jsonify({"error": str(e)}), 400

    finally:
        db.close()


# -- JOURNAL ENTRY ROUTES --

@app.route("/api/journal-entries", methods=["POST"])
def create_journal_entry_route():
    db = SessionLocal()
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be JSON"}), 400

        entry = create_journal_entry(
            db=db,
            user_id=g.user_id,
            content=data.get("content"),
            entry_date=parse_date(data["entry_date"]),
            reflection_id=data.get("reflection_id"),
        )

        return jsonify(journal_entry_to_dict(entry)), 201

    except InvalidJournalEntry as e:
        return jsonify({"error": str(e)}), 400

    finally:
        db.close()


@app.route("/api/journal-entries", methods=["GET"])
def get_journal_entries_route():
    db = SessionLocal()
    try:
        # If date parameter is provided, get entries for that specific date
        if "date" in request.args:
            entries = get_journal_entries_for_date(
                db=db,
                user_id=g.user_id,
                entry_date=parse_date(request.args["date"]),
            )
            return jsonify([journal_entry_to_dict(e) for e in entries]), 200
        
        # NEW: Get ALL journal entries for user (sorted by date descending)
        from models import JournalEntry
        entries = (
            db.query(JournalEntry)
            .filter(JournalEntry.user_id == g.user_id)
            .order_by(JournalEntry.entry_date.desc(), JournalEntry.created_at.desc())
            .all()
        )
        return jsonify([journal_entry_to_dict(e) for e in entries]), 200

    finally:
        db.close()


@app.route("/api/journal-entries/<int:entry_id>", methods=["PATCH"])
def update_journal_entry_route(entry_id):
    db = SessionLocal()
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be JSON"}), 400

        entry = update_journal_entry(
            db=db,
            entry_id=entry_id,
            user_id=g.user_id,
            content=data.get("content"),
        )

        return jsonify(journal_entry_to_dict(entry)), 200

    except JournalEntryNotFound as e:
        return jsonify({"error": str(e)}), 404

    except InvalidJournalEntry as e:
        return jsonify({"error": str(e)}), 400

    finally:
        db.close()


@app.route("/api/journal-entries/<int:entry_id>", methods=["DELETE"])
def delete_journal_entry_route(entry_id):
    db = SessionLocal()
    try:
        delete_journal_entry(
            db=db,
            entry_id=entry_id,
            user_id=g.user_id,
        )
        return jsonify({"message": "Journal entry deleted"}), 200

    except JournalEntryNotFound as e:
        return jsonify({"error": str(e)}), 404

    finally:
        db.close()


# -- GOALS ROUTES --

@app.route("/api/goals", methods=["POST"])
def create_goal_route():
    db = SessionLocal()
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be JSON"}), 400

        goal = create_goal(
            db=db,
            user_id=g.user_id,
            description=data.get("description"),
            deadline=parse_date(data["deadline"]) if data.get("deadline") else None,
        )

        return jsonify(goal_to_dict(goal)), 201

    except InvalidGoal as e:
        return jsonify({"error": str(e)}), 400

    finally:
        db.close()

@app.route("/api/goals", methods=["GET"])
def get_goals_route():
    db = SessionLocal()
    try:
        status = request.args.get("status")

        goals = get_goals_for_user(
            db=db,
            user_id=g.user_id,
            status=status,
        )

        return jsonify([goal_to_dict(g) for g in goals]), 200

    finally:
        db.close()

@app.route("/api/goals/<int:goal_id>", methods=["PATCH"])
def update_goal_route(goal_id: int):
    db = SessionLocal()
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be JSON"}), 400

        goal = update_goal(
            db=db,
            goal_id=goal_id,
            user_id=g.user_id,
            description=data.get("description"),
            deadline=parse_date(data["deadline"]) if data.get("deadline") else None,
            status=data.get("status"),
        )

        return jsonify(goal_to_dict(goal)), 200

    except GoalNotFound:
        return jsonify({"error": "Goal not found"}), 404

    except InvalidGoal as e:
        return jsonify({"error": str(e)}), 400

    finally:
        db.close()

# -- STATS ROUTES --

@app.route("/api/stats", methods=["GET"])
def get_stats_route():
    db = SessionLocal()
    try:
        stats = get_user_stats(db=db, user_id=g.user_id)
        return jsonify(stats), 200
    finally:
        db.close()

@app.route("/api/goals/<int:goal_id>", methods=["DELETE"])
def delete_goal_route(goal_id: int):
    db = SessionLocal()
    try:
        from models import Goal
        
        # Find the goal
        goal = (
            db.query(Goal)
            .filter(
                Goal.id == goal_id,
                Goal.user_id == g.user_id,
            )
            .one_or_none()
        )
        
        if goal is None:
            return jsonify({"error": "Goal not found"}), 404
        
        # Delete the goal
        db.delete(goal)
        db.commit()
        
        return jsonify({"message": "Goal deleted successfully"}), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        db.close()


# -- SCHEDULED TASKS ROUTES --

@app.route("/api/scheduled-tasks", methods=["POST"])
def create_scheduled_task_route():
    db = SessionLocal()
    try:
        data = request.get_json()
        user_id = g.user_id

        task = create_scheduled_task(
            db=db,
            user_id=user_id,
            title=data["title"],
            description=data.get("description"),
            task_date=parse_date(data["task_date"]),
            start_time=parse_time(data["start_time"]),
            end_time=parse_time(data["end_time"]),
            is_recurring=data.get("is_recurring", False),
            recurrence_pattern=data.get("recurrence_pattern"),
        )

        return jsonify(scheduled_task_to_dict(task)), 201

    except KeyError as e:
        return jsonify({"error": f"missing field: {e}"}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()


@app.route("/api/scheduled-tasks", methods=["GET"])
def get_scheduled_tasks_route():
    db = SessionLocal()
    try:
        user_id = g.user_id
        start_date = parse_date(request.args.get("start_date"))
        end_date = parse_date(request.args.get("end_date"))

        tasks = get_scheduled_tasks_for_week(
            db=db,
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
        )

        return jsonify([scheduled_task_to_dict(task) for task in tasks]), 200

    except KeyError as e:
        return jsonify({"error": f"missing parameter: {e}"}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()


@app.route("/api/scheduled-tasks/<int:task_id>", methods=["PATCH"])
def update_scheduled_task_route(task_id: int):
    db = SessionLocal()
    try:
        data = request.get_json()
        user_id = g.user_id

        # Parse optional fields
        update_params = {"db": db, "task_id": task_id, "user_id": user_id}

        if "title" in data:
            update_params["title"] = data["title"]
        if "description" in data:
            update_params["description"] = data["description"]
        if "task_date" in data:
            update_params["task_date"] = parse_date(data["task_date"])
        if "start_time" in data:
            update_params["start_time"] = parse_time(data["start_time"])
        if "end_time" in data:
            update_params["end_time"] = parse_time(data["end_time"])
        if "is_recurring" in data:
            update_params["is_recurring"] = data["is_recurring"]
        if "recurrence_pattern" in data:
            update_params["recurrence_pattern"] = data["recurrence_pattern"]
        if "is_completed" in data:
            update_params["is_completed"] = data["is_completed"]

        task = update_scheduled_task(**update_params)

        return jsonify(scheduled_task_to_dict(task)), 200

    except ScheduledTaskNotFound as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()


@app.route("/api/scheduled-tasks/<int:task_id>", methods=["DELETE"])
def delete_scheduled_task_route(task_id: int):
    db = SessionLocal()
    try:
        delete_scheduled_task(db=db, task_id=task_id, user_id=g.user_id)
        return jsonify({"message": "Scheduled task deleted successfully"}), 200

    except ScheduledTaskNotFound as e:
        return jsonify({"error": str(e)}), 404
    finally:
        db.close()


@app.route("/api/morning-insights", methods=["GET"])
def get_morning_insights():
    """Generate AI-powered morning insights based on goals and yesterday's reflection"""
    from datetime import timedelta
    db = SessionLocal()
    try:
        # Get user's active goals
        goals = get_goals_for_user(db, g.user_id, status='active')
        goals_list = [goal_to_dict(g) for g in goals]

        # Get yesterday's reflection
        yesterday = date.today() - timedelta(days=1)
        yesterday_reflection = None
        try:
            reflection = get_reflection_for_date(db, g.user_id, yesterday)
            yesterday_reflection = reflection_to_dict(reflection) if reflection else None
        except:
            pass  # No reflection from yesterday is okay

        # Generate insights
        insights = generate_morning_insights(goals_list, yesterday_reflection)

        return jsonify(insights), 200

    except Exception as e:
        print(f"Error in get_morning_insights: {e}")
        return jsonify({"error": "Failed to generate insights"}), 500
    finally:
        db.close()


if __name__ == "__main__":
    app.run(debug=True)


