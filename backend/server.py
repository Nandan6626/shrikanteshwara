from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
import asyncio
from google import genai
from datetime import datetime, timezone
import re
import ipaddress
import httpx
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', '').strip().strip("'").strip('"')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'srikanteshwara_school').strip()]

# Create the main app without a prefix
app = FastAPI()

@app.get("/")
@app.head("/")
async def root():
    return {"status": "ok", "service": "Srikanteshwara School Backend"}

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class Enquiry(BaseModel):
    name: str
    email: str
    grade: str
    message: Optional[str] = ""

class ChatRequest(BaseModel):
    message: str

# ---- Emergent managed email (Resend) ----
EMAIL_BASE_URL = "https://integrations.emergentagent.com"  # constant — survives deployment
EMAIL_KEY = os.environ["EMERGENT_EMAIL_KEY"]
EMAIL_FROM_NAME = os.environ["EMAIL_FROM_NAME"]
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
ENQUIRY_RECIPIENT_EMAIL = os.environ["ENQUIRY_RECIPIENT_EMAIL"]
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)

def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)

def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)

class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []
    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []
    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)
    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []

def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan(); scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")

async def send_email(*, to: str, subject: str, html: str, reply_to: Optional[str] = None) -> Optional[str]:
    # Check if SMTP is configured (e.g. Gmail App Password)
    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASSWORD")
    if smtp_user and smtp_pass:
        try:
            import smtplib
            from email.mime.multipart import MIMEMultipart
            from email.mime.text import MIMEText
            
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{EMAIL_FROM_NAME} <{smtp_user}>"
            msg["To"] = to
            if reply_to:
                msg["Reply-To"] = reply_to
            msg.attach(MIMEText(html, "html"))
            
            smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
            smtp_port = int(os.environ.get("SMTP_PORT", 587))
            
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
            server.quit()
            logger.info(f"Email sent via SMTP to {to}")
            return "smtp_delivered"
        except Exception as e:
            logger.error(f"SMTP send failed: {e}")

    # Fallback to Emergent proxy if a valid key is provided
    if EMAIL_KEY and "dummy" not in EMAIL_KEY.lower():
        try:
            _assert_safe_email(subject, html)
            payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
            if reply_to or EMAIL_REPLY_TO:
                payload["contact_email"] = reply_to or EMAIL_REPLY_TO
            async with httpx.AsyncClient(timeout=15) as http_client:
                resp = await http_client.post(
                    f"{EMAIL_BASE_URL}/api/v1/email/send",
                    headers={"X-Email-Key": EMAIL_KEY},
                    json=payload,
                )
            resp.raise_for_status()
            return resp.json().get("id")
        except httpx.HTTPStatusError as e:
            logger.warning(f"Email proxy returned {e.response.status_code}: {e.response.text}")
        except Exception as e:
            logger.warning(f"Email send error: {str(e)}")
    else:
        logger.info("No active email key or SMTP configured; enquiry stored in database.")

    return "stored_in_database"

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Srikanteshwara Vidya Samsthe API", "status": "ok"}

@api_router.get("/content")
async def get_content():
    return {"notices": [], "events": [], "message": "Official content will appear here once provided by the school."}

@api_router.get("/enquiries")
async def get_enquiries():
    enquiries = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return enquiries

@api_router.post("/enquiries")
async def create_enquiry(input: Enquiry):
    name = (input.name or "").strip() or "Not provided"
    visitor_email = (input.email or "").strip()
    grade = (input.grade or "").strip() or "Not specified"
    message = (input.message or "").strip() or "(No message provided)"
    reply_to = visitor_email if EMAIL_RE.match(visitor_email) else None
    now_dt = datetime.now(timezone.utc)
    submitted = now_dt.strftime("%d %b %Y, %H:%M UTC")

    # 1. Always safely persist the enquiry in MongoDB
    enquiry_id = str(uuid.uuid4())
    try:
        doc = {
            "id": enquiry_id,
            "name": name,
            "email": visitor_email,
            "grade": grade,
            "message": message,
            "submitted_at": submitted,
            "created_at": now_dt.isoformat()
        }
        await db.enquiries.insert_one(doc)
    except Exception as db_exc:
        logger.error(f"Failed to save enquiry in MongoDB: {db_exc}")

    subject = f"New admission enquiry from {name}"
    html = (
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
        'style="font-family:Arial,Helvetica,sans-serif;color:#10263b"><tr><td style="padding:24px">'
        '<h2 style="margin:0 0 4px;font-size:20px;color:#10263b">New Admission Enquiry</h2>'
        '<p style="margin:0 0 18px;color:#657586;font-size:13px">Submitted via the Srikanteshwara Vidya Samsthe website on '
        f'{escape(submitted)}.</p>'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
        'style="border-collapse:collapse;font-size:14px">'
        f'<tr><td style="padding:10px 0;border-bottom:1px solid #e5e5e5;width:150px;color:#657586">Parent / Guardian</td>'
        f'<td style="padding:10px 0;border-bottom:1px solid #e5e5e5"><strong>{escape(name)}</strong></td></tr>'
        f'<tr><td style="padding:10px 0;border-bottom:1px solid #e5e5e5;color:#657586">Email</td>'
        f'<td style="padding:10px 0;border-bottom:1px solid #e5e5e5">{escape(visitor_email or "Not provided")}</td></tr>'
        f'<tr><td style="padding:10px 0;border-bottom:1px solid #e5e5e5;color:#657586">Grade</td>'
        f'<td style="padding:10px 0;border-bottom:1px solid #e5e5e5">{escape(grade)}</td></tr>'
        f'<tr><td style="padding:10px 0;color:#657586;vertical-align:top">Message</td>'
        f'<td style="padding:10px 0">{escape(message)}</td></tr>'
        '</table>'
        '<p style="margin:22px 0 0;font-size:12px;color:#888">Reply directly to this email to respond to the enquirer. '
        'Sent by Srikanteshwara Vidya Samsthe website. We never ask for passwords or payment details by email.</p>'
        '</td></tr></table>'
    )
    
    # 2. Try email send without breaking the request if third-party email service is unavailable
    email_id = None
    try:
        email_id = await send_email(to=ENQUIRY_RECIPIENT_EMAIL, subject=subject, html=html, reply_to=reply_to)
    except Exception as em_exc:
        logger.warning(f"Email delivery skipped: {em_exc}")

    return {"id": email_id or enquiry_id, "message": "Enquiry received"}

@api_router.post("/chat")
async def chat(input: ChatRequest):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="Chat assistant is not configured")
    try:
        client = genai.Client(api_key=api_key)
        prompt = ("You are the friendly official assistant for Srikanteshwara Vidya Samsthe, serving LKG to Grade 10. "
                  "Use only the placeholder context below, never invent official facts, and clearly say when information is pending. "
                  "Keep answers concise and helpful. Placeholder context: address, phone, email, principal, fees, dates, staff, "
                  "facilities and admissions details are not yet provided. User question: " + input.message)
        response = await asyncio.wait_for(
            client.aio.models.generate_content(model="gemini-2.5-flash", contents=prompt),
            timeout=15,
        )
        reply = response.text or "I’m sorry, I could not answer that right now."
        try:
            await db.chat_messages.insert_one({"role": "user", "message": input.message, "reply": reply, "created_at": datetime.now(timezone.utc).isoformat()})
        except Exception as db_exc:
            logger.warning("Could not log chat message to DB: %s", db_exc)
        return {"reply": reply}
    except Exception as exc:
        logger.exception("Gemini request failed: %s", exc)
        raise HTTPException(status_code=502, detail="The school assistant is temporarily unavailable")

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()