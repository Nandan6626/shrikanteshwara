import { useMemo, useState } from "react";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpen, CalendarDays, ChevronDown, Download, Facebook, Image as ImageIcon, Instagram, Library, Mail, MapPin, Menu, MessageCircle, Microscope, Phone, Quote, Send, Sparkles, Trophy, Users, X, Youtube } from "lucide-react";
import "@/App.css";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const images = {
  hero: "/school/campus-wide.jpg",
  campus: "/school/campus-wide.jpg",
  library: "/school/facility-classroom.jpg",
  lab: "/school/campus-gate.jpg",
  activity: "/school/activity-yoga.jpg",
};

const nav = [
  ["About", "/about"], ["Academics", "/academics"], ["Admissions", "/admissions"],
  ["Campus life", "/facilities"], ["Updates", "/events"], ["Contact", "/contact"],
];
const news = [
  { date: "[DATE]", title: "[Announcement or school update]", type: "Notice" },
  { date: "[DATE]", title: "[Upcoming campus event]", type: "Event" },
  { date: "[DATE]", title: "[Admissions information]", type: "Admissions" },
];

function SiteShell({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return <div className="site-shell">
    <div className="announcement" data-testid="announcement-bar"><span>Admissions enquiries for [Academic Year] are now open</span><Link data-testid="announcement-admissions-link" to="/admissions">Explore admissions <ArrowRight size={14} /></Link></div>
    <header className="site-header" data-testid="site-header">
      <Link className="brand" to="/" data-testid="school-logo-link"><img className="brand-logo" src="/school/logo.png" alt="Srikanteshwara Vidya Samsthe, K.N.Pura, Mysuru logo" /><span><strong>Srikanteshwara Vidya Samsthe</strong></span></Link>
      <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation" data-testid="mobile-menu-button">{open ? <X /> : <Menu />}</button>
      <nav className={`main-nav ${open ? "is-open" : ""}`} data-testid="main-navigation">{nav.map(([label, to]) => <Link key={to} to={to} onClick={() => setOpen(false)} className={location.pathname === to ? "active" : ""} data-testid={`nav-${label.toLowerCase().replaceAll(" ", "-")}-link`}>{label}</Link>)}<Link className="nav-cta" to="/admissions" onClick={() => setOpen(false)} data-testid="nav-apply-link">Start a conversation <ArrowRight size={15} /></Link></nav>
    </header>
    <main>{children}</main>
    <Footer />
    <Chatbot />
  </div>;
}

function Footer() { return <footer className="footer" data-testid="site-footer"><div className="footer-grid"><div><Link className="brand footer-brand" to="/" data-testid="footer-logo-link"><img className="brand-logo" src="/school/logo.png" alt="Srikanteshwara Vidya Samsthe, K.N.Pura, Mysuru logo" /><span><strong>Srikanteshwara Vidya Samsthe</strong></span></Link><p className="footer-note">A place to begin well, belong deeply, and grow with purpose.</p><div className="socials"><a href="https://www.instagram.com/shrikanteshwara_vidya_samste?mdxt=ZWgxaDZzaG5iaDIx" target="_blank" rel="noopener noreferrer" aria-label="Instagram" data-testid="instagram-link"><Instagram size={17} /></a><a href="https://youtube.com" aria-label="YouTube" data-testid="youtube-link"><Youtube size={17} /></a><a href="https://facebook.com" aria-label="Facebook" data-testid="facebook-link"><Facebook size={17} /></a></div></div><div><h4>Explore</h4><Link to="/about" data-testid="footer-about-link">About school</Link><Link to="/academics" data-testid="footer-academics-link">Academics</Link><Link to="/facilities" data-testid="footer-facilities-link">Campus life</Link><Link to="/gallery" data-testid="footer-gallery-link">Gallery</Link></div><div><h4>For families</h4><Link to="/admissions" data-testid="footer-admissions-link">Admissions</Link><Link to="/notices" data-testid="footer-notices-link">Notices</Link><Link to="/downloads" data-testid="footer-downloads-link">Downloads</Link><Link to="/careers" data-testid="footer-careers-link">Careers</Link></div><div><h4>Find us</h4><p data-testid="footer-address">Srikanteshwara Pvt Industrial Training Institute, K.N. Pura Udayagiri (P), K.N. Pura, Mysore–570019</p><p data-testid="footer-phone">8970354517</p><p data-testid="footer-email">srikanteshwaravidyasamsthe66@gmail.com</p></div></div><div className="footer-bottom"><span>© 1988 Srikanteshwara Vidya Samsthe</span><Link to="/contact" data-testid="footer-contact-link">Contact Srikanteshwara Vidya Samsthe <ArrowRight size={14} /></Link></div></footer>; }

function Home() { return <>
  <section className="hero" data-testid="home-hero"><img src={images.hero} alt="Srikanteshwara School students during a morning session on campus" /><div className="hero-overlay" /><div className="hero-content"><p className="eyebrow light">A thoughtful beginning for every learner</p><h1>Learn boldly.<br /><em>Live kindly.</em></h1><p className="hero-copy">A nurturing school community for curious young minds, from LKG through Grade 10.</p><div className="hero-actions"><Link className="button button-light" to="/about" data-testid="hero-discover-button">Discover our school <ArrowRight size={17} /></Link><Link className="text-link light-link" to="/admissions" data-testid="hero-admissions-link">Admissions <ArrowRight size={15} /></Link></div></div><div className="hero-caption"><span>01 / 03</span><span>Future-ready, values-led learning</span></div></section>
  <section className="intro band" data-testid="home-intro"><div className="section-kicker">The Srikanteshwara way</div><div className="intro-grid"><h2>Growing capable people,<br /><span>not just bright students.</span></h2><div><p className="lead">At Srikanteshwara School, education is a daily practice of wonder, responsibility, and connection.</p><Link className="text-link" to="/about" data-testid="intro-about-link">Meet the school <ArrowRight size={15} /></Link></div></div></section>
  <section className="feature-band" data-testid="home-learning-section"><div className="feature-image"><img src="/school/activity-science.jpg" alt="Students presenting projects at the school science exhibition" /></div><div className="feature-copy"><span className="section-kicker">Learning in action</span><h2>Room to ask.<br /><em>Space to become.</em></h2><p>Our classrooms and shared spaces are designed for focused learning, open conversation, and the confidence to try something new.</p><Link className="button button-dark" to="/academics" data-testid="home-academics-button">Explore academics <ArrowRight size={17} /></Link></div></section>
  <section className="pillars band" data-testid="home-pillars"><div className="section-heading"><div><span className="section-kicker">What matters here</span><h2>Three anchors for<br /><em>the school years.</em></h2></div><p>Every programme, space, and relationship is shaped by these shared commitments.</p></div><div className="pillar-grid">{[[BookOpen,"Deep learning","Strong foundations paired with the courage to think independently."],[Users,"Belonging","A warm, respectful community where every child is known."],[Trophy,"Whole growth","Sport, creativity, service, and leadership alongside academics."]].map(([Icon,title,copy]) => <article className="pillar" key={title} data-testid={`pillar-${title.toLowerCase().replace(" ", "-")}`}><Icon /><h3>{title}</h3><p>{copy}</p><Link to="/about" data-testid={`pillar-${title.toLowerCase().replace(" ", "-")}-link`}>Learn more <ArrowRight size={14} /></Link></article>)}</div></section>
  <section className="updates band" data-testid="home-updates"><div className="section-heading"><div><span className="section-kicker">From the school desk</span><h2>Latest <em>notes.</em></h2></div><Link className="text-link" to="/notices" data-testid="home-all-updates-link">See all updates <ArrowRight size={15} /></Link></div><div className="news-grid">{news.map(item => <article className="news-card" key={item.title} data-testid="news-card"><span>{item.type}</span><time>{item.date}</time><h3>{item.title}</h3><Link to="/notices" data-testid="news-card-link">Read update <ArrowRight size={14} /></Link></article>)}</div></section>
  <section className="quote-band" data-testid="home-quote"><Quote size={34} /><blockquote>“We believe education should nurture knowledge, confidence, character and strong values, helping every child discover their potential and grow into a responsible individual.”</blockquote><div className="quote-attr" data-testid="home-principal-attr"><img src="/school/principal.jpg" alt="Dr. Sowmya H. S., Principal of Srikanteshwara School" /><div><p>Dr. Sowmya H. S.</p><span>Principal</span></div></div></section>
  <section className="contact-strip" data-testid="home-contact-strip"><div><span className="section-kicker">Come see what is possible</span><h2>Questions are a good<br /><em>place to begin.</em></h2></div><Link className="button button-dark" to="/contact" data-testid="home-contact-button">Talk to the school <ArrowRight size={17} /></Link></section>
 </>; }

const pageData = { about: ["About the school", "A school day with room for rigor, imagination, and the ordinary magic of growing up.", images.campus], academics: ["Academics", "A considered journey from first questions in LKG to confident preparation for Grade 10.", images.library], facilities: ["Campus life", "Spaces and experiences that help students learn with their hands, voices, bodies, and hearts.", images.lab], events: ["Events & gallery", "The moments, celebrations, and everyday scenes that make a school community feel alive.", images.activity] };
const contentCopy = { about: { kicker: "Our story", heading: "A Legacy of Education and Service", lead: "Srikanteshwara Vidya Samsthe has a long-standing journey of educational service and community development. From its early beginnings, the institution has continued to expand its educational initiatives and create opportunities for students to learn, grow and contribute to society.", details: ["A Legacy Since 1988", "Expanding Educational Opportunities", "Committed to Student Development"] }, academics: { kicker: "Our academic journey", heading: "Learning from LKG to Grade 10", lead: "A strong academic foundation that nurtures knowledge, confidence, creativity and responsible learning from the early years through Grade 10.", details: ["LKG to Grade 10", "Strong Academic Foundation", "Holistic Student Development"] }, facilities: { kicker: "Our campus", heading: "A Place to Learn, Grow and Explore", lead: "Our campus provides students with a supportive environment for academic learning, creativity, physical activity and personal development.", details: ["Well-Equipped Computer Labs", "School Library", "Playground and Sports Activities"] }, events: { kicker: "Events & activities", heading: "Celebrating Learning, Talent and Togetherness", lead: "Our school events and activities provide opportunities for students to learn, showcase their talents, celebrate together and create lasting memories.", details: ["School Events", "Annual Day", "Sports Activities", "Cultural Activities"] } };
function PageHero({ eyebrow, title, copy, image }) { return <section className="page-hero" data-testid="page-hero"><img src={image} alt={title} /><div className="hero-overlay" /><div className="page-hero-content"><span className="eyebrow light">{eyebrow || "Srikanteshwara Vidya Samsthe"}</span><h1>{title}</h1><p>{copy}</p></div></section>; }
function StandardPage({ kind }) { const [title, copy, image] = pageData[kind]; const c = contentCopy[kind] || { kicker: "A clear beginning", heading: `[A considered statement about ${kind}.]`, lead: "This prototype uses carefully marked placeholders so the school team can add official details, stories, images, and documents without changing the structure.", details: ["[Key detail or promise]", "[Key detail or promise]", "[Key detail or promise]"] }; return <><PageHero eyebrow="Srikanteshwara Vidya Samsthe" title={title} copy={copy} image={image} /><section className="content-band band" data-testid={`${kind}-content`}><div className="section-kicker">{c.kicker}</div><div className="content-grid"><div><h2>{c.heading}</h2><p className="lead">{c.lead}</p></div><div className="detail-list">{c.details.map((d, i) => <div key={i}><strong>{`0${i + 1}`}</strong><span>{d}</span></div>)}</div></div>{kind === "about" && <PrincipalMessage />}{kind === "about" && <FoundersAbout />}{kind === "about" && <FacultyAbout />}{kind === "academics" && <GradeBands />}{kind === "facilities" && <FacilityGrid />}{kind === "events" && <GalleryGrid />}</section></>; }
function GradeBands() { return <div className="grade-bands" data-testid="grade-bands">{[["LKG · UKG","Foundational learning through play, exploration and early skill development."],["Grades 1—5","Building strong foundations in knowledge, language, numeracy and essential learning skills."],["Grades 6—8","Developing deeper subject knowledge, critical thinking and independent learning."],["Grades 9—10","Strengthening academic knowledge and preparing students for higher studies and future goals."]].map(([grade, desc], i) => <div className="grade-band" key={grade} data-testid={`grade-band-${i + 1}`}><span>0{i + 1}</span><h3>{grade}</h3><p>{desc}</p><ArrowRight size={18} /></div>)}</div>; }
function FacilityGrid() { return <div className="facility-grid" data-testid="facility-grid">{[[BookOpen,"Classrooms","/school/facility-classroom.jpg","Spacious, well-lit classrooms that support focused and comfortable learning."],[Library,"Computer Lab","/school/facility-computerlab.jpg","A dedicated computer lab introducing students to digital skills and technology."],[Microscope,"Science Lab","/school/activity-sciencelab.jpg","Practical, hands-on science sessions that build curiosity and understanding."],[Users,"Assembly Hall","/school/facility-auditorium.jpg","An indoor hall for assemblies, events and cultural programmes."],[Sparkles,"Staff Room","/school/facility-conference.jpg","A dedicated space for teachers to plan, meet and collaborate."],[Trophy,"Sports & Games","/school/event-1.jpg","Teams, tournaments and games that build fitness, discipline and team spirit."]].map(([Icon,title,image,desc]) => <article key={title} className="facility-card" data-testid={`facility-${title.toLowerCase().replaceAll(" ", "-").replaceAll("&","and")}`}><img src={image} alt={title} loading="lazy" /><div><Icon /><h3>{title}</h3><p>{desc}</p></div></article>)}</div>; }
function Events() { return <div className="event-list" data-testid="event-list">{news.map((item, i) => <article key={item.title} className="event-row" data-testid={`event-row-${i + 1}`}><div className="event-date"><strong>[DD]</strong><span>[MON]</span></div><div><span className="section-kicker">{item.type}</span><h3>{item.title}</h3><p>[Event detail or notice summary]</p></div><ArrowRight size={18} /></article>)}</div>; }

const gallery = [["/school/event-1.jpg","School sports team with trophies"],["/school/event-2.jpg","Athletics team with medals and certificates"],["/school/activity-science.jpg","Science exhibition projects"],["/school/facility-drill.jpg","Morning drill & physical training"],["/school/activity-yoga.jpg","Yoga session on campus"],["/school/activity-sciencelab.jpg","Students during a science practical"]];
function PrincipalMessage() { return <div className="principal-message" data-testid="principal-message"><div className="principal-photo"><img src="/school/principal.jpg" alt="Dr. Sowmya H. S., Principal of Srikanteshwara School" /></div><div className="principal-text"><span className="section-kicker">From the Principal</span><h2>A message from<br /><em>Dr. Sowmya H. S.</em></h2><p className="lead">Welcome to Srikanteshwara School, where every child is encouraged to learn, grow and discover their potential. We strive to nurture knowledge, confidence, character and strong values in every student. Together, we build a brighter future through education.</p><p className="principal-name">Dr. Sowmya H. S. · Principal</p><p className="principal-quals" data-testid="principal-qualifications">PhD · MSc Psychology · MEd · MA Sociology · MA English · PG Diplomas in Guidance &amp; Counseling and English · UGC-NET &amp; KSET (Education)</p></div></div>; }

const staffDetails = [
  { sl: "1", name: "B M KUSUMALATHA", qual: "MA.B.ED", exp: "18 YEARS" },
  { sl: "2", name: "GANGADHAR GOWDA K S", qual: "MA.B.ED", exp: "18 YEARS" },
  { sl: "3", name: "SAVITHA K S", qual: "MSC.B.ED", exp: "18 YEARS" },
  { sl: "4", name: "I NIRANJAN", qual: "MSC.B.ED", exp: "18 YEARS" },
  { sl: "5", name: "APPAJI GOWDA M S", qual: "BA.BP.ED", exp: "20 YEARS" },
  { sl: "6", name: "SHOBHA", qual: "MA.B.ED", exp: "8 YEARS" },
  { sl: "7", name: "CHIKKALINGAIAH B", qual: "BA.TCH", exp: "18 YEARS" },
  { sl: "8", name: "RANGASWAMY M G", qual: "BA.TCH", exp: "20 YEARS" },
  { sl: "9", name: "CHANDREGOWDA T N", qual: "BA.TCH", exp: "22 YEARS" },
  { sl: "10", name: "KUMARA S G", qual: "PUC D.ED", exp: "18 YEARS" },
  { sl: "11", name: "SOWBHAGYALAKSHMI S", qual: "PUC D.ED", exp: "18 YEARS" },
  { sl: "12", name: "VEENA M S", qual: "PUC D.ED", exp: "18 YEARS" },
  { sl: "13", name: "ANITHA G R", qual: "PUC CP.ED", exp: "22 YEARS" },
  { sl: "14", name: "ARCHANA L", qual: "BA.B.ED", exp: "4 YEARS" },
  { sl: "15", name: "GEETHA R", qual: "M.COM.D.ED", exp: "10 YEARS" },
  { sl: "16", name: "SOWMYA R", qual: "MA", exp: "4 YEARS" },
  { sl: "17", name: "SHILPA G", qual: "PUC.D.ED", exp: "4 YEARS" },
  { sl: "18", name: "ANJALI M", qual: "MSC.B.ED", exp: "4 YEARS" },
  { sl: "19", name: "SHWETHA KUMARI", qual: "MA.B.ED", exp: "5 YEARS" },
  { sl: "20", name: "VEENA V", qual: "MA.M.ED", exp: "6 YEARS" },
  { sl: "21", name: "SARASWATHI", qual: "PUC.D.ED", exp: "3 YEARS" },
  { sl: "22", name: "DHAKSHINA MURTHY M", qual: "MA.M.ED", exp: "14 YEARS" },
];

function FacultyAbout() {
  return (
    <div className="faculty-block" data-testid="faculty-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Our Team</span>
          <h2>Meet the <em>faculty & staff.</em></h2>
        </div>
        <p>A dedicated team of qualified teachers and staff guiding every learner at Srikanteshwara Vidya Samsthe.</p>
      </div>

      <div className="staff-table-wrapper" data-testid="staff-table-wrapper">
        <div className="staff-table-header">
          <h3>SRIKANTESHWARA VIDYA SAMSTHE(R) K N PURA MYSURU-19</h3>
          <span className="staff-table-badge">STAFF DETAILS</span>
        </div>
        <div className="staff-table-responsive">
          <table className="staff-table" data-testid="staff-details-table">
            <thead>
              <tr>
                <th>SL NO</th>
                <th>NAMES</th>
                <th>QUALIFICATION</th>
                <th>EXPERIENCE</th>
              </tr>
            </thead>
            <tbody>
              {staffDetails.map((staff) => (
                <tr key={staff.sl}>
                  <td className="sl-col">{staff.sl}</td>
                  <td className="name-col">{staff.name}</td>
                  <td className="qual-col">
                    <span className="qual-badge">{staff.qual}</span>
                  </td>
                  <td className="exp-col">{staff.exp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FoundersAbout() {
  const founders = [
    { name: "Sri H N Srikantaiah B Ped.M A( L L B)", title: "Founder · Srikanteshwara Vidya Samsthe", img: "/school/founder-1.jpg" },
    { name: "Smt H M Shanthakumari M A", title: "Founder · Srikanteshwara Vidya Samsthe", img: "/school/founder-2.jpg" }
  ];
  return (
    <div className="faculty-block" data-testid="founders-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Our founders</span>
          <h2>Guided by our <em>founders.</em></h2>
        </div>
        <p>The visionaries behind Srikanteshwara Vidya Samsthe whose dedicated leadership laid the foundation of our institution.</p>
      </div>
      <div className="faculty-grid founders-grid">
        {founders.map((f, i) => (
          <article className="faculty-card founder-card" key={i} data-testid={`founder-card-${i + 1}`}>
            <img src={f.img} alt={`${f.name}, Founder of Srikanteshwara Vidya Samsthe`} loading="lazy" />
            <div className="founder-info">
              <h3 className="founder-name" title={f.name}>{f.name}</h3>
              <p className="founder-title">{f.title}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
function GalleryGrid() { return <div className="gallery-block" data-testid="gallery-section"><div className="section-heading"><div><span className="section-kicker">Life at school</span><h2>Moments from<br /><em>our campus.</em></h2></div><p>Glimpses of activities, events, and achievements at Srikanteshwara Vidya Samsthe.</p></div><div className="gallery-grid">{gallery.map(([src,cap],i) => <figure className="gallery-item" key={i} data-testid={`gallery-item-${i+1}`}><img src={src} alt={cap} loading="lazy" /><figcaption>{cap}</figcaption></figure>)}</div></div>; }

function Admissions() { const [sent, setSent] = useState(false); const [error, setError] = useState(false); const [busy, setBusy] = useState(false); const submit = async e => { e.preventDefault(); setBusy(true); setSent(false); setError(false); try { const body = Object.fromEntries(new FormData(e.target)); const response = await fetch(`${API}/enquiries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); if (!response.ok) throw new Error("Enquiry request failed"); setSent(true); e.target.reset(); } catch { setError(true); } finally { setBusy(false); } }; return <><PageHero eyebrow="Admissions" title="Let’s start a conversation." copy="Tell us a little about your family and we’ll share the next step when official admissions information is ready." image={images.hero} /><section className="form-band band" data-testid="admissions-section"><div><span className="section-kicker">Enquiry form</span><h2>Find your next<br /><em>right question.</em></h2><p className="lead">[Admission cycle, age criteria, application timeline, and fee information will be added here.]</p></div><form className="enquiry-form" onSubmit={submit} data-testid="admissions-form"><label>Parent / guardian name<input name="name" required placeholder="Your name" data-testid="admissions-name-input" /></label><label>Email address<input name="email" type="email" required placeholder="you@example.com" data-testid="admissions-email-input" /></label><label>Child’s grade<select name="grade" required data-testid="admissions-grade-select"><option value="">Select a grade</option><option>LKG</option><option>UKG</option><option>Grade 1–5</option><option>Grade 6–8</option><option>Grade 9–10</option></select></label><label>How can we help?<textarea name="message" rows="4" placeholder="Tell us what you’d like to know" data-testid="admissions-message-input" /></label><button className="button button-dark" disabled={busy} type="submit" data-testid="admissions-submit-button">{busy ? "Sending…" : "Send enquiry"} <Send size={16} /></button>{sent && <p className="form-success" data-testid="admissions-success-message">Thank you — your enquiry has been recorded for the school team.</p>}{error && <p className="form-error" data-testid="admissions-error-message">We couldn’t send that enquiry just now. Please try again or contact the school directly.</p>}</form></section></>; }

function ResourcePage({ type }) { const isCareer = type === "careers"; return <><PageHero eyebrow={isCareer ? "Work with us" : "Resources"} title={isCareer ? "Bring your best self." : "Useful, when you need it."} copy={isCareer ? "[Faculty openings and application details will be posted here.]" : "Browse school notices, calendars, syllabi, and other official documents as they become available."} image={images.campus} /><section className="resource-band band" data-testid={`${type}-resource-section`}><div className="section-heading"><div><span className="section-kicker">{isCareer ? "Opportunities" : "Library"}</span><h2>{isCareer ? "Open roles." : "The school desk."}</h2></div><p>[Information placeholder — replace with official {type} content.]</p></div>{isCareer ? <div className="empty-state" data-testid="careers-empty-state"><Users size={30} /><h3>[Current openings]</h3><p>Official career opportunities will appear here.</p><Link className="button button-dark" to="/contact" data-testid="careers-contact-button">Send a general enquiry <ArrowRight size={16} /></Link></div> : <div className="resource-list">{["Academic calendar · [Year]", "Curriculum overview · [Grade range]", "Parent handbook · [Year]", "Admissions guide · [Year]"].map((doc, i) => <div className="resource-row" key={doc} data-testid={`resource-row-${i + 1}`}><div><Download size={19} /><span>{doc}</span></div><button type="button" onClick={() => alert("Official document placeholder — this will be replaced with a downloadable file.")} data-testid={`resource-download-${i + 1}`}>Download <Download size={14} /></button></div>)}</div>}</section></>; }

function Contact() { return <><PageHero eyebrow="Contact" title="We’re here to help." copy="For admissions, school visits, or general questions, please use the channels below." image={images.activity} /><section className="contact-band band" data-testid="contact-section"><div className="contact-details"><span className="section-kicker">Reach out</span><h2>Make the first<br /><em>connection.</em></h2>{[[MapPin,"Visit", "Srikanteshwara Pvt Industrial Training Institute, K.N. Pura Udayagiri (P), K.N. Pura, Mysore–570019"],[Phone,"Call", "8970354517"],[Mail,"Email", "srikanteshwaravidyasamsthe66@gmail.com"]].map(([Icon,label,value]) => <div className="contact-item" key={label} data-testid={`contact-${label.toLowerCase()}-detail`}><Icon /><div><span>{label}</span><strong>{value}</strong></div></div>)}</div><div className="map-placeholder" data-testid="contact-map-placeholder"><MapPin size={30} /><span>Map / campus location placeholder</span><small>Replace with the official location when available.</small></div></section></>; }

function Chatbot() { const [open, setOpen] = useState(false); const [input, setInput] = useState(""); const [loading, setLoading] = useState(false); const [messages, setMessages] = useState([{ role: "assistant", text: "Hello. I’m the Srikanteshwara School assistant. What would you like to know?" }]); const send = async e => { e?.preventDefault(); if (!input.trim() || loading) return; const question = input.trim(); setInput(""); setMessages(m => [...m, { role: "user", text: question }]); setLoading(true); try { const res = await fetch(`${API}/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: question }) }); const data = await res.json(); setMessages(m => [...m, { role: "assistant", text: data.reply || "I’m sorry, I couldn’t answer that right now." }]); } catch { setMessages(m => [...m, { role: "assistant", text: "I’m having trouble connecting right now. Please try the contact page instead." }]); } finally { setLoading(false); } }; return <><button className="chat-trigger" onClick={() => setOpen(!open)} aria-label="Open school assistant" data-testid="chatbot-open-button">{open ? <X /> : <MessageCircle />}<span>Ask the school assistant</span></button>{open && <motion.aside initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="chat-panel" data-testid="chatbot-panel"><div className="chat-header"><div><Sparkles size={17} /><strong>School assistant</strong></div><button onClick={() => setOpen(false)} aria-label="Close chatbot" data-testid="chatbot-close-button"><X size={17} /></button></div><div className="chat-messages" data-testid="chatbot-messages">{messages.map((m, i) => <div className={`chat-message ${m.role}`} key={i} data-testid={`chat-message-${m.role}-${i}`}>{m.text}</div>)}{loading && <div className="chat-message assistant loading" data-testid="chatbot-loading">Thinking…</div>}</div><form className="chat-form" onSubmit={send}><input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about the school…" aria-label="Chat question" data-testid="chatbot-input" /><button type="submit" aria-label="Send question" data-testid="chatbot-send-button"><Send size={16} /></button></form></motion.aside>}</>; }

function App() { return <BrowserRouter><SiteShell><AnimatePresence mode="wait"><Routes><Route path="/" element={<Home />} /><Route path="/about" element={<StandardPage kind="about" />} /><Route path="/academics" element={<StandardPage kind="academics" />} /><Route path="/facilities" element={<StandardPage kind="facilities" />} /><Route path="/events" element={<StandardPage kind="events" />} /><Route path="/gallery" element={<StandardPage kind="events" />} /><Route path="/admissions" element={<Admissions />} /><Route path="/notices" element={<ResourcePage type="notices" />} /><Route path="/downloads" element={<ResourcePage type="downloads" />} /><Route path="/careers" element={<ResourcePage type="careers" />} /><Route path="/contact" element={<Contact />} /><Route path="*" element={<Home />} /></Routes></AnimatePresence></SiteShell></BrowserRouter>; }
export default App;