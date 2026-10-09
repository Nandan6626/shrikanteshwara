"""Tests for enquiry email endpoint (no MongoDB persistence)."""
import os
import pytest
import requests
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else None
if not BASE_URL:
    # Fallback: load frontend env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]


@pytest.fixture(scope="module")
def mongo_db():
    c = MongoClient(MONGO_URL)
    yield c[DB_NAME]
    c.close()


@pytest.fixture
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def test_root(api):
    r = api.get(f"{BASE_URL}/api/")
    assert r.status_code == 200


def test_enquiry_valid_payload(api, mongo_db):
    before = mongo_db.enquiries.count_documents({})
    payload = {
        "name": "TEST_Parent",
        "email": "testparent@example.com",
        "grade": "Grade 5",
        "message": "Please share admission details.",
    }
    r = api.post(f"{BASE_URL}/api/enquiries", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("message") == "Enquiry received"
    assert "id" in data
    after = mongo_db.enquiries.count_documents({})
    assert after == before, "No document should be written to enquiries collection"


def test_enquiry_empty_message_ok(api):
    payload = {"name": "TEST_Parent2", "email": "p2@example.com", "grade": "LKG", "message": ""}
    r = api.post(f"{BASE_URL}/api/enquiries", json=payload)
    assert r.status_code == 200, r.text
    assert r.json().get("message") == "Enquiry received"


def test_enquiry_missing_message_ok(api):
    payload = {"name": "TEST_Parent3", "email": "p3@example.com", "grade": "UKG"}
    r = api.post(f"{BASE_URL}/api/enquiries", json=payload)
    assert r.status_code == 200, r.text


def test_enquiry_missing_name_422(api):
    payload = {"email": "p4@example.com", "grade": "Grade 1", "message": "hi"}
    r = api.post(f"{BASE_URL}/api/enquiries", json=payload)
    assert r.status_code == 422


def test_enquiry_missing_grade_422(api):
    payload = {"name": "TEST_Parent5", "email": "p5@example.com", "message": "hi"}
    r = api.post(f"{BASE_URL}/api/enquiries", json=payload)
    assert r.status_code == 422


def test_enquiry_invalid_email_still_sends(api):
    payload = {"name": "TEST_Parent6", "email": "not-an-email", "grade": "Grade 9-10", "message": "hi"}
    r = api.post(f"{BASE_URL}/api/enquiries", json=payload)
    assert r.status_code == 200, r.text
    assert r.json().get("message") == "Enquiry received"


def test_mongo_enquiries_collection_not_used(mongo_db, api):
    before = mongo_db.enquiries.count_documents({})
    api.post(f"{BASE_URL}/api/enquiries", json={
        "name": "TEST_NoMongo", "email": "nomongo@example.com", "grade": "Grade 6-8", "message": "x"
    })
    after = mongo_db.enquiries.count_documents({})
    assert after == before
