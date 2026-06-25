import os
import json
import uuid
import time
import logging
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from .config import settings

logger = logging.getLogger("academia_crm_db")
logging.basicConfig(level=logging.INFO)

class JSONDatabase:
    """A simple JSON-backed database that mimics MongoDB collections for fallback mode."""
    def __init__(self, filepath="academia_crm_data.json"):
        self.filepath = filepath
        self.data = {
            "users": [],
            "institutions": [],
            "contacts": [],
            "meetings": [],
            "followups": [],
            "proposals": [],
            "notifications": [],
            "activity_logs": [],
            "ai_insights": []
        }
        self.load()
        if not self.data.get("users"):
            self.seed_initial_data()

    def load(self):
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, "r") as f:
                    content = json.load(f)
                    for key in self.data.keys():
                        if key in content:
                            self.data[key] = content[key]
                logger.info(f"Loaded JSON database from {self.filepath}")
            except Exception as e:
                logger.error(f"Error loading JSON database: {e}")

    def save(self):
        try:
            with open(self.filepath, "w") as f:
                json.dump(self.data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving JSON database: {e}")

    def seed_initial_data(self):
        # We will add mock data here if it is empty
        # Let's seed an admin and a sales rep
        # Password for both will be hashed using bcrypt, but here we can write them down.
        # Admin: admin@crm.com / admin123
        # Sales: sales@crm.com / sales123
        # We will do the actual hashing in the auth route or during seeding.
        # Let's do it in main.py or here. We will do it in db.py first with basic plain passwords
        # and hash them if needed, or we will write the hashed passwords directly!
        # Hashed password for 'admin123' and 'sales123' (using bcrypt):
        # admin123 -> $2b$12$6K.jN083ZqT5l8t1.dYyPefwK.s1c2c3d4e5f6g7h8i9j1k2l3m4n
        # Wait, let's use a standard bcrypt hash or hash it on the fly. Let's hash it on the fly or put a dummy hash.
        # Actually, let's seed in main.py after the auth helper is available, or seed here using a simple script.
        pass

    def get_collection(self, collection_name):
        return JSONCollection(self, collection_name)


class JSONCollection:
    def __init__(self, db, name):
        self.db = db
        self.name = name

    def _get_list(self):
        if self.name not in self.db.data:
            self.db.data[self.name] = []
        return self.db.data[self.name]

    def find(self, query=None):
        query = query or {}
        results = []
        for item in self._get_list():
            match = True
            for k, v in query.items():
                if k not in item:
                    match = False
                    break
                # Simple matching
                if isinstance(v, dict):
                    # Check operators like $in or $regex
                    for op, val in v.items():
                        if op == "$in" and item[k] not in val:
                            match = False
                        elif op == "$regex":
                            import re
                            if not re.search(val, str(item[k]), re.IGNORECASE):
                                match = False
                elif item[k] != v:
                    match = False
                    break
            if match:
                results.append(item.copy())
        return results

    def find_one(self, query=None):
        results = self.find(query)
        return results[0] if results else None

    def insert_one(self, document):
        doc = document.copy()
        if "_id" not in doc:
            doc["_id"] = str(uuid.uuid4())
        # Parse datetimes to ISO strings
        for k, v in doc.items():
            if isinstance(v, datetime):
                doc[k] = v.isoformat()
        self._get_list().append(doc)
        self.db.save()
        return doc

    def update_one(self, query, update_dict):
        # e.g., {"$set": {...}}
        doc = self.find_one(query)
        if not doc:
            return None
        
        # Find index in list
        items = self._get_list()
        idx = -1
        for i, item in enumerate(items):
            if item["_id"] == doc["_id"]:
                idx = i
                break
        
        if idx != -1:
            set_fields = update_dict.get("$set", {})
            for k, v in set_fields.items():
                if isinstance(v, datetime):
                    items[idx][k] = v.isoformat()
                else:
                    items[idx][k] = v
            self.db.save()
            return items[idx]
        return None

    def delete_one(self, query):
        doc = self.find_one(query)
        if not doc:
            return False
        items = self._get_list()
        self.db.data[self.name] = [item for item in items if item["_id"] != doc["_id"]]
        self.db.save()
        return True


# Try to initialize MongoDB, fallback to JSON
mongo_client = None
db = None
is_mongodb = False

try:
    mongo_client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=1000)
    # Check if server is accessible
    mongo_client.server_info()
    db = mongo_client[settings.DATABASE_NAME]
    is_mongodb = True
    logger.info("Connected to MongoDB successfully.")
except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
    logger.warning(f"Failed to connect to MongoDB ({e}). Falling back to local JSON database.")
    json_db = JSONDatabase()
    is_mongodb = False

def get_db_collection(collection_name):
    if is_mongodb:
        return db[collection_name]
    else:
        return json_db.get_collection(collection_name)
