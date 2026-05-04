import os

# Must be set before any app module is imported so that Settings() does not
# reject missing Azure credentials during test collection.
os.environ.setdefault("TESTING", "true")
