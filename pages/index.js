import Head from 'next/head';
import ChatWidget from '../components/ChatWidget';

const aiStack = [
  ['LLM Providers', 'Claude, GPT-4, Gemini, Grok'],
  ['Orchestration', 'Dify, N8N, LangChain'],
  ['RAG / Knowledge', 'Vector DB, document loaders, retrieval pipelines'],
  ['Automation', 'Webhook flows, API chaining, scheduled agents'],
  ['Deployment', 'Vercel, Netlify, AWS']
];

const experiences = [
  {
    company: 'KG AI Solution',
    role: 'Full-Stack Developer / AI Tester',
    meta: '6 Months',
    points: [
      'Built and maintained an AI-powered SaaS platform from backend to frontend.',
      'Engineered scalable Python APIs for AI features and backend services.',
      'Integrated LLM workflows with Dify, including prompt workflows and model orchestration.',
      'Designed database schemas and connected backend services with Vue.js interfaces.',
      'Built an admin portal for managing AI workflows, user configuration, and monitoring.'
    ]
  },
  {
    company: 'Scholarar Cambodia',
    role: 'Full-Stack Developer Intern',
    meta: 'B2B Portal Project',
    points: [
      'Built RESTful APIs with Laravel for enterprise backend services.',
      'Designed database structures for complex web application flows.',
      'Integrated Next.js for fast, responsive frontend interfaces.',
      'Collaborated on feature delivery, code quality, and system performance.'
    ]
  }
];

const projects = [
  {
    title: 'AI Chatbot',
    role: 'LLM / RAG Engineer',
    description: 'Knowledge-based conversational AI system with context-aware answers powered by RAG pipelines.',
    stack: ['Dify', 'RAG', 'LLM', 'Webhook Automation']
  },
  {
    title: 'Virtual Company II',
    role: 'Scrum Master / Full-Stack Developer',
    description: 'Leave management system for PNC School, built with Scrum delivery and full Laravel stack.',
    stack: ['Laravel', 'Vue.js', 'MySQL', 'GitHub', 'Jira', 'Figma']
  },
  {
    title: 'Virtual Company I',
    role: 'Full-Stack Developer',
    description: 'Coffee management system built from real business interviews and requirements gathering.',
    stack: ['PHP', 'Bootstrap', 'JavaScript', 'MySQL', 'API Integration']
  }
];

const skills = [
  {
    group: 'Languages & Frameworks',
    items: ['Laravel', 'PHP', 'ASP.NET', 'Node.js', 'Python', 'Vue.js', 'Next.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS']
  },
  {
    group: 'AI & Automation',
    items: ['Claude', 'GPT-4', 'Gemini', 'Grok', 'Poe', 'Dify', 'N8N', 'RAG', 'Prompt Engineering', 'Embeddings']
  },
  {
    group: 'Tools & Platforms',
    items: ['AWS', 'Vercel', 'Netlify', 'GitHub', 'Figma', 'Jira', 'Scrum', 'Power BI', 'Python Algorithms']
  }
];

const volunteering = [
  'Web Programming Trainer at PNC — taught HTML, CSS, and JavaScript to first-year university students over 6 months.',
  'IT Awareness Sharing Session at PNC — introduced Microsoft Office, Google Workspace, and AI learning tools.'
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Sina Neak | Full-Stack Developer & AI Engineer</title>
        <meta name="description" content="Portfolio of Sina Neak, a full-stack developer and AI engineer specializing in LLM, RAG, Dify, N8N, Laravel, Vue.js, and Next.js." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main>

        {/* ── HERO ───────────────────────────────────────────── */}
        <section className="hero" id="top">
          <nav className="nav">
            <a className="brand" href="#top" aria-label="Sina Neak home">SN</a>
            <div className="nav-links">
              <a href="#work">Work</a>
              <a href="#projects">Projects</a>
              <a href="#skills">Skills</a>
              <a href="#contact">Contact</a>
            </div>
          </nav>

          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Phnom Penh, Cambodia</p>
              <h1>Sina<br /><span className="accent">Neak</span></h1>
              <p className="hero-title">Full-Stack Developer &amp; AI Engineer</p>
              <p className="hero-text">
                I build intelligent web systems that connect modern product engineering
                with applied AI — SaaS platforms, RESTful APIs, knowledge chatbots,
                automation workflows, and RAG-powered assistants.
              </p>
              <div className="hero-actions">
                <a className="button primary" href="mailto:neaksina752@gmail.com">Email Me</a>
                <a className="button ghost" href="#projects">View Projects</a>
              </div>
            </div>

            <div className="hero-panel" aria-label="AI system architecture visual">
              <div className="panel-top">
                <span>AI System Architecture</span>
                <span className="status-dot">Production Flow</span>
              </div>
              <div className="pipeline">
                <span>User Input</span>
                <span>Query Layer</span>
                <span>Embedding Model</span>
                <span>Vector Search</span>
                <span>Prompt Builder</span>
                <span>LLM Response</span>
              </div>
              <div className="architecture-card">
                <strong>RAG Pipeline</strong>
                <p>Retrieved documents + user query become a structured, useful response through Claude, GPT, Dify, and API/webhook delivery.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── ABOUT ──────────────────────────────────────────── */}
        <section className="section intro">
          <div>
            <p className="eyebrow">About</p>
            <h2>I architect AI-enabled web products from problem to production.</h2>
          </div>
          <p>
            Currently pursuing an Associate Degree in Information Technology at Passerelles Numeriques
            Cambodia. I have shipped real products, led teams as Scrum Master, trained junior developers,
            and integrated AI automation workflows using Dify, N8N, and the Anthropic/OpenAI ecosystem.
          </p>
        </section>

        {/* ── AI STACK ───────────────────────────────────────── */}
        <section className="section ai-section" id="ai">
          <div className="section-heading">
            <p className="eyebrow">AI Knowledge Flow</p>
            <h2>From user question to deployed intelligence</h2>
          </div>
          <div className="stack-grid">
            {aiStack.map(([layer, tools]) => (
              <div className="stack-item" key={layer}>
                <span>{layer}</span>
                <strong>{tools}</strong>
              </div>
            ))}
          </div>
        </section>

        {/* ── WORK EXPERIENCE ────────────────────────────────── */}
        <section className="section" id="work">
          <div className="section-heading">
            <p className="eyebrow">Work Experience</p>
            <h2>Product engineering with applied AI delivery</h2>
          </div>
          <div className="timeline">
            {experiences.map((job) => (
              <article className="timeline-item" key={job.company}>
                <div>
                  <h3>{job.company}</h3>
                  <p>{job.role}</p>
                </div>
                <span>{job.meta}</span>
                <ul>
                  {job.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* ── PROJECTS ───────────────────────────────────────── */}
        <section className="section projects" id="projects">
          <div className="section-heading">
            <p className="eyebrow">Projects</p>
            <h2>Systems built across AI, web, and business workflows</h2>
          </div>
          <div className="project-grid">
            {projects.map((project) => (
              <article className="project-card" key={project.title}>
                <p>{project.role}</p>
                <h3>{project.title}</h3>
                <span>{project.description}</span>
                <div className="chips">
                  {project.stack.map((item) => <em key={item}>{item}</em>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── SKILLS ─────────────────────────────────────────── */}
        <section className="section" id="skills">
          <div className="section-heading">
            <p className="eyebrow">Technical Skills</p>
            <h2>Tools I use to build reliable intelligent systems</h2>
          </div>
          <div className="skills-grid">
            {skills.map((skill) => (
              <div className="skill-block" key={skill.group}>
                <h3>{skill.group}</h3>
                <div className="chips">
                  {skill.items.map((item) => <em key={item}>{item}</em>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── VOLUNTEERING ───────────────────────────────────── */}
        <section className="section split">
          <div>
            <p className="eyebrow">Teaching</p>
            <h2>Volunteering &amp; knowledge sharing</h2>
          </div>
          <div className="plain-list">
            {volunteering.map((item) => <p key={item}>{item}</p>)}
          </div>
        </section>

        {/* ── EDUCATION ──────────────────────────────────────── */}
        <section className="section split education">
          <div>
            <p className="eyebrow">Education &amp; Languages</p>
            <h2>PNC Information Technology student</h2>
          </div>
          <div className="plain-list">
            <p><strong>Passerelles Numeriques Cambodia</strong> — Associate Degree in Information Technology, 2023–2026.</p>
            <p><strong>Hunsen Beang Preas High School</strong> — High School Diploma, 2021–2023.</p>
            <p><strong>Languages</strong> — Khmer native, English pre-intermediate.</p>
          </div>
        </section>

        {/* ── CHAT ───────────────────────────────────────────── */}
        <section className="section chat-section">
          <div className="section-heading">
            <p className="eyebrow">Portfolio Knowledge Chat</p>
            <h2>Ask anything about my experience</h2>
          </div>
          <ChatWidget />
        </section>

        {/* ── CONTACT ────────────────────────────────────────── */}
        <section className="section contact" id="contact">
          <p className="eyebrow">Let's Connect</p>
          <h2>Open to full-stack, AI/LLM, RAG, and mentoring opportunities.</h2>
          <div className="contact-links">
            <a href="mailto:neaksina752@gmail.com">neaksina752@gmail.com</a>
            <a href="tel:+855969780938">(+855) 969 780 938</a>
          </div>
        </section>

        <footer className="footer-line">
          Built by <span>Sina Neak</span> · Powered by Next.js &amp; Dify AI
        </footer>

      </main>
    </>
  );
}