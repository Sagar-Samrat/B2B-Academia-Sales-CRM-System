import uuid
from datetime import datetime
from .db import get_db_collection

def log_activity(user: dict, action: str, details: str):
    """Logs a system action to the ActivityLogs collection."""
    try:
        activity_logs = get_db_collection("activity_logs")
        activity_logs.insert_one({
            "_id": str(uuid.uuid4()),
            "user_name": user.get("name", "System"),
            "user_email": user.get("email", "system@crm.com"),
            "action": action,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        print(f"Error logging activity: {e}")

def create_notification(title: str, message: str, notification_type: str = "info"):
    """Dispatches a system notification to the Notifications collection."""
    try:
        notifications = get_db_collection("notifications")
        notifications.insert_one({
            "_id": str(uuid.uuid4()),
            "title": title,
            "message": message,
            "type": notification_type,
            "is_read": False,
            "created_at": datetime.utcnow().isoformat()
        })
    except Exception as e:
        print(f"Error creating notification: {e}")
