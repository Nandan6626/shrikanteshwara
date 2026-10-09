# Srikanteshwara School Website PRD

## Original problem statement
Build a complete, modern, production-quality official website for Srikanteshwara School serving students from LKG to Grade 10. Use https://www.npswest.com/ as a reference for useful pages, navigation, information architecture and functionality, without copying its branding, visual design, or content. Include school information, academics, admissions, campus life, activities, events, gallery, notices, downloads, careers, contact, responsive layouts, SEO, placeholders for unknown official information, replaceable image organization, and one secure Gemini-powered chatbot through a backend API.

## Architecture decisions
- React frontend with existing CRA/Craco workspace and React Router, Framer Motion, Lucide React, Tailwind-compatible CSS.
- Existing supervisor runtime remains FastAPI on port 8001; APIs were expanded for enquiries and Gemini chat so the preview stays operational.
- MongoDB stores admissions enquiries and chatbot messages using the existing `MONGO_URL` and `DB_NAME` configuration.
- Gemini is called server-side through the Google GenAI SDK using `GEMINI_API_KEY`; it is never placed in frontend code.
- Placeholder content and Unsplash placeholder image URLs are centralized near the top of `frontend/src/App.js` for future replacement.

## User personas
- Parents exploring the school and requesting admissions information.
- Existing families looking for notices, dates, downloads, and contact details.
- Prospective staff looking for career information.
- School administrators who will later replace placeholder content with official information.

## Core requirements
- Modern official school website for LKG through Grade 10.
- Home, About, Academics, Admissions, Facilities/Campus Life, Activities, Events, Gallery, Notices, Downloads, Careers, Contact.
- Responsive navigation for mobile, tablet, laptop, and desktop.
- Admissions enquiry form persisted to MongoDB.
- Floating Gemini assistant with loading and error states.
- Placeholder-safe copy and organized temporary imagery.
- Page title, meta description, Open Graph metadata, robots.txt, and sitemap.xml.

## Implemented (2026-10-07)
- Replaced starter screen with a complete branded school website shell and responsive home page.
- Added routed pages for About, Academics, Admissions, Campus Life, Events, Gallery, Notices, Downloads, Careers, and Contact.
- Added admissions form, MongoDB persistence endpoint, placeholder document download states, navigation, footer, social links, enquiry messaging, and animated chatbot panel.
- Added server-side Gemini endpoint with secure environment variable usage, safe placeholder school context, current model configuration, and bounded upstream timeout.
- Added SEO metadata, sitemap, robots configuration, and responsive mobile navigation.
- Verified production frontend build, API health, enquiry persistence flow, homepage rendering, chatbot UI, and mobile menu in browser.

## Prioritized backlog
- P0: Replace placeholder school identity, address, contacts, principal message, admissions dates, and academic details.
- P0: Replace temporary images with approved campus, faculty, facilities, activity, and event media.
- P1: Add admin/editor workflow for notices, events, gallery items, and downloads.
- P1: Add official downloadable PDFs and connect event/gallery data to MongoDB.
- P1: Validate the supplied Gemini credential/API availability so live assistant answers work.
- P2: Add analytics, richer gallery filtering, and a real campus map embed after official details are supplied.

## Next tasks
1. Add official text: Principal name & message, faculty names/qualifications, address, phone, email, academic year, notices/events, documents.
2. Provide missing image categories (campus buildings, classrooms, labs, library, events) — folders 04_Campus, 05_Facilities, 07_Events, 09_Documents were empty in the asset ZIP.
3. Chatbot: replace failing Gemini `/api/chat` with ChatGPT (OpenAI via Emergent LLM key) — still pending from prior fork.
4. Add the content management workflow once update frequency and staff roles are known.

## Next tasks submissions (name, email, grade, message) to srikanteshwaravidyasamsthe66@gmail.com via Emergent-managed Resend proxy (integrations.emergentagent.com). Reply-To = visitor's email. No MongoDB used for enquiries. Backend: `send_email` + `_assert_safe_email` guardrail gate in server.py; env keys EMERGENT_EMAIL_KEY, EMAIL_FROM_NAME="Srikanteshwara School", ENQUIRY_RECIPIENT_EMAIL. Verified by testing_agent (iteration_2.json, 100% backend+frontend).
- Image storage note: all school images are LOCAL project assets in /app/frontend/public/school/ served at /school/*. Not Emergent storage, not external URLs, not MongoDB.
- Known (out of scope): /api/chat uses Gemini model name "gemini-3.8-flash" which fails (502); chatbot→ChatGPT migration still pending.

## Changelog (earlier)
- 2026-06: Integrated official Srikanteshwara School assets (12 images from client ZIP; ZIP labelled "15" but contained 12). Stored web-optimized copies in `frontend/public/school/`.
  - Logo (transparent PNG, checkerboard removed) in header + footer.
  - Hero = campus yoga photo; home "Learning in action" feature = science exhibition.
  - Principal photo added to home quote band + new "From the Principal" block on About page.
  - New Faculty grid on About page (4 real headshots; names/qualifications kept as placeholders — none supplied).
  - New Gallery section on Events/Gallery page (6 real photos: drill, yoga, sports felicitation, sports team, science exhibition, sports meet) with descriptive captions.
  - FacilityGrid relabeled to real categories with available photos (Science & exhibitions, Sports & athletics, Yoga & wellness).
  - No names/achievements/dates invented; placeholders preserved where official info/assets unavailable.