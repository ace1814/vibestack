import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Vibe Coding Course — VibeStack",
  description:
    '6 free modules: learn to build and launch a Kanban board app with Cursor, Supabase, and Vercel. No coding experience needed.',
  alternates: { canonical: 'https://www.vibestack.in/course/content' },
};

// ── Helper components ────────────────────────────────────────────────────────

function SummaryBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-700/30 rounded-xl p-5 mb-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3">
        ⚡ Quick Summary
      </p>
      {children}
    </div>
  );
}

function YTEmbed({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="my-6 rounded-xl overflow-hidden border border-black/8 dark:border-white/8">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        className="w-full aspect-video"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-zinc-950 dark:bg-zinc-900 text-zinc-100 rounded-xl px-5 py-4 my-4 overflow-x-auto text-sm leading-relaxed font-mono whitespace-pre-wrap">
      {children}
    </pre>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-sm bg-black/6 dark:bg-white/8 px-1.5 py-0.5 rounded font-mono">
      {children}
    </code>
  );
}

function FAQItem({ q, a }: { q: string; a: React.ReactNode }) {
  return (
    <details className="border border-black/8 dark:border-white/8 rounded-xl overflow-hidden group">
      <summary className="cursor-pointer px-5 py-4 font-medium text-sm select-none flex items-center justify-between gap-4 hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
        <span>{q}</span>
        <span className="text-black/30 dark:text-white/30 shrink-0 text-xs">▾</span>
      </summary>
      <div className="px-5 pb-5 pt-1 text-sm text-black/60 dark:text-white/60 leading-relaxed border-t border-black/6 dark:border-white/6">
        {a}
      </div>
    </details>
  );
}

function FAQSection({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  return (
    <div className="mt-12 pt-8 border-t border-black/8 dark:border-white/8">
      <p className="text-xs font-semibold uppercase tracking-wider text-black/40 dark:text-white/40 mb-4">
        Frequently Asked Questions
      </p>
      <div className="space-y-2">
        {items.map(({ q, a }) => (
          <FAQItem key={q} q={q} a={a} />
        ))}
      </div>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold mt-10 mb-4 leading-snug">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold mt-8 mb-3 leading-snug">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-black/75 dark:text-white/75 leading-relaxed mb-4">{children}</p>;
}

function StepList({ steps }: { steps: React.ReactNode[] }) {
  return (
    <ol className="space-y-2 my-4 pl-4">
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-black/75 dark:text-white/75 leading-relaxed">
          <span className="w-5 h-5 rounded-full bg-black/8 dark:bg-white/10 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
            {i + 1}
          </span>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2 my-4 pl-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-black/75 dark:text-white/75 leading-relaxed">
          <span className="text-black/30 dark:text-white/30 shrink-0 mt-1">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Module data ───────────────────────────────────────────────────────────────

const MODULES = [
  { id: 'module-1', number: 1, emoji: '🧠', title: 'What Is Vibe Coding?' },
  { id: 'module-2', number: 2, emoji: '🛠', title: 'Set Up Your Tools' },
  { id: 'module-3', number: 3, emoji: '💬', title: 'How to Talk to AI' },
  { id: 'module-4', number: 4, emoji: '🖥', title: 'Build Your Kanban Board' },
  { id: 'module-5', number: 5, emoji: '🗄', title: 'Save Tasks to Supabase' },
  { id: 'module-6', number: 6, emoji: '🌍', title: 'Go Live with Vercel' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CourseContentPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
      {/* Header */}
      <header className="border-b border-black/8 dark:border-white/8 px-6 py-4 sticky top-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-black dark:text-white hover:opacity-70 transition-opacity"
          >
            vibestack
          </Link>
          <Link
            href="/course"
            className="text-xs text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
          >
            ← Course overview
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-14">

          {/* ── Sidebar ────────────────────────────────────────────────────── */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-black/40 dark:text-white/40 mb-4">
                Modules
              </p>
              <ul className="space-y-1">
                {MODULES.map((m) => (
                  <li key={m.id}>
                    <a
                      href={`#${m.id}`}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-black/60 dark:text-white/60 hover:bg-black/4 dark:hover:bg-white/4 hover:text-black dark:hover:text-white transition-colors"
                    >
                      <span className="text-base leading-none">{m.emoji}</span>
                      <span>
                        <span className="font-medium text-black/30 dark:text-white/30 mr-1">{m.number}.</span>
                        {m.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-black/8 dark:border-white/8">
                <Link
                  href="/"
                  className="text-xs text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
                >
                  Browse VibeStack tools →
                </Link>
              </div>
            </nav>
          </aside>

          {/* ── Main content ───────────────────────────────────────────────── */}
          <main className="min-w-0">
            {/* Course intro */}
            <div className="mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
                Vibe Coding for People Who&apos;ve Never Coded
              </h1>
              <p className="text-black/55 dark:text-white/55 text-lg leading-relaxed">
                6 modules · Free forever · Build a real Kanban board app from scratch
              </p>
            </div>

            {/* Mobile module nav */}
            <div className="lg:hidden mb-10 p-4 bg-stone-50 dark:bg-zinc-900 rounded-xl border border-black/6 dark:border-white/6">
              <p className="text-xs font-semibold uppercase tracking-wider text-black/40 dark:text-white/40 mb-3">Jump to module</p>
              <div className="flex flex-wrap gap-2">
                {MODULES.map((m) => (
                  <a
                    key={m.id}
                    href={`#${m.id}`}
                    className="text-xs px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:border-black/30 dark:hover:border-white/30 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {m.number}. {m.title}
                  </a>
                ))}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                MODULE 1: What Is Vibe Coding?
            ═══════════════════════════════════════════════════════════════ */}
            <section id="module-1" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-black/8 dark:bg-white/10 flex items-center justify-center text-xs font-bold">1</div>
                <h2 className="text-2xl font-bold">🧠 What Is Vibe Coding?</h2>
              </div>

              <SummaryBox>
                <ul className="space-y-1.5 text-sm text-amber-800 dark:text-amber-200">
                  <li>• The internet is made of pages built with code (HTML, CSS, JavaScript)</li>
                  <li>• AI can write that code for you when you describe what you want</li>
                  <li>• Vibe coding = describe → AI builds → you review → repeat</li>
                  <li>• You&apos;ll build a real Kanban board app by the end of this course</li>
                </ul>
                <p className="text-xs mt-3 text-amber-700/60 dark:text-amber-400/60">
                  Already know this?{' '}
                  <a href="#module-2" className="underline underline-offset-2">Skip to Module 2 →</a>
                </p>
              </SummaryBox>

              <H2>What is the internet?</H2>
              <P>
                Think of the internet like a giant library. Every website is a book in that library. When you
                type a website address (like <InlineCode>google.com</InlineCode>), you&apos;re asking the library
                to find that book and show it to you.
              </P>
              <P>
                The &quot;book&quot; lives on a computer somewhere in the world — called a server — that&apos;s
                always switched on and connected to the internet. When you visit a website, your computer
                fetches that book from the server and displays it on your screen.
              </P>

              <H2>What makes a website work?</H2>
              <P>Every website is built from 3 things. You don&apos;t need to learn them — just know they exist:</P>
              <BulletList
                items={[
                  <><strong>HTML</strong> — the words and pictures (like the pages of a book)</>,
                  <><strong>CSS</strong> — how it looks (the fonts, colours, spacing)</>,
                  <><strong>JavaScript</strong> — things that move or change (like a button you click, or a pop-up)</>,
                ]}
              />
              <P>
                In the old days you had to write all of this by hand. Learning to do that well took years.
                That&apos;s what people mean when they say &quot;I know how to code.&quot;
              </P>

              <H2>What is AI?</H2>
              <P>
                AI (Artificial Intelligence) is a computer program that&apos;s very good at predicting what
                comes next — like autocomplete on your phone, but a million times smarter and better trained.
              </P>
              <P>
                When you type a sentence describing what you want, the AI figures out what code would match your
                description and writes it. It&apos;s not magic — it&apos;s a very well-trained pattern matcher.
                But for our purposes, the result is the same: you describe, it builds.
              </P>

              <H2>So what is vibe coding?</H2>
              <P>
                <strong>Vibe coding = using AI to write the code for you.</strong>
              </P>
              <P>
                You describe what you want in plain English. The AI writes the code. You open it in your browser
                and check it looks right. If something&apos;s off, you describe the fix. The AI fixes it.
                Repeat until it&apos;s done.
              </P>
              <P>You never write a single line of code yourself.</P>

              <H2>What you&apos;ll build in this course</H2>
              <P>A <strong>Kanban board</strong> — a task management tool with three columns:</P>
              <BulletList
                items={[
                  <><strong>📋 To Do</strong> — tasks you haven&apos;t started yet</>,
                  <><strong>🔄 In Progress</strong> — tasks you&apos;re working on now</>,
                  <><strong>✅ Done</strong> — tasks you&apos;ve finished</>,
                ]}
              />
              <P>
                You&apos;ll be able to add tasks, move them between columns, and delete them. The data will save
                to a real database. The app will be live on the internet, at a real URL, that anyone can visit.
              </P>

              <FAQSection
                items={[
                  {
                    q: 'Do I need to know anything about computers to start?',
                    a: 'No. If you can use a website or send an email, you have all the computer knowledge you need.',
                  },
                  {
                    q: 'Is vibe coding "real" coding?',
                    a: "Your app will be real — it'll run on real servers, save real data, and have a real URL. Whether you call the process \"real coding\" is just words. What matters is that it works.",
                  },
                  {
                    q: 'Which AI should I use?',
                    a: 'Claude (made by Anthropic) and GPT-4o (made by OpenAI) are both excellent for writing code. For this course we use Claude because it writes clean, readable code. The prompts in this course work with either.',
                  },
                  {
                    q: 'How long will this course take?',
                    a: 'Most people finish in 2–4 hours spread across a few sessions. Each module takes 20–30 minutes.',
                  },
                  {
                    q: 'What if the AI makes a mistake?',
                    a: "It will — and that's completely normal. You just describe what's wrong and ask it to fix it. We'll practice this in Module 3.",
                  },
                ]}
              />
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                MODULE 2: Set Up Your Tools
            ═══════════════════════════════════════════════════════════════ */}
            <section id="module-2" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-black/8 dark:bg-white/10 flex items-center justify-center text-xs font-bold">2</div>
                <h2 className="text-2xl font-bold">🛠 Set Up Your Tools</h2>
              </div>

              <SummaryBox>
                <ul className="space-y-1.5 text-sm text-amber-800 dark:text-amber-200">
                  <li>• You need 4 free tools: Cursor (editor), GitHub (code storage), Supabase (database), Vercel (hosting)</li>
                  <li>• No credit card needed for any of them</li>
                  <li>• Each section below has a video walkthrough</li>
                  <li>• Setup takes about 20–30 minutes total</li>
                </ul>
                <p className="text-xs mt-3 text-amber-700/60 dark:text-amber-400/60">
                  Already know this?{' '}
                  <a href="#module-3" className="underline underline-offset-2">Skip to Module 3 →</a>
                </p>
              </SummaryBox>

              {/* Tool 1: Cursor */}
              <div className="mb-12">
                <H3>🛠 Tool 1: Cursor — Your AI-Powered Editor</H3>
                <P>
                  Cursor is where you&apos;ll spend most of your time. Think of it like Microsoft Word, but instead
                  of writing documents, you&apos;re describing your app — and an AI assistant inside it does the
                  actual writing. It&apos;s free to start.
                </P>

                <p className="text-sm font-semibold mb-2 mt-6">Steps to set up Cursor:</p>
                <StepList
                  steps={[
                    <>Go to <a href="https://cursor.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">cursor.com</a></>,
                    <>Click the big <strong>Download</strong> button</>,
                    <>Open the downloaded file and install it (same as installing any app on your computer)</>,
                    <>When it opens, click <strong>Sign Up</strong> and create a free account</>,
                    <>It may ask if you want to import VS Code settings — you can skip this</>,
                    <>You&apos;re in. You&apos;ll see a file explorer on the left and a big empty area in the middle.</>,
                  ]}
                />

                <p className="text-sm font-semibold mb-2 mt-6">Watch this setup tutorial:</p>
                <YTEmbed videoId="ocMOZpuAMw4" title="Cursor Tutorial for Beginners (AI Code Editor)" />

                <div className="mt-4 p-4 bg-stone-50 dark:bg-zinc-900 rounded-xl border border-black/6 dark:border-white/6 text-sm text-black/60 dark:text-white/60">
                  <strong className="text-black dark:text-white">Alternative to Cursor:</strong> If you&apos;d rather not
                  download software, try{' '}
                  <a href="https://bolt.new" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Bolt.new</a>{' '}
                  or{' '}
                  <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Lovable</a>{' '}
                  — they run entirely in your browser. The prompts in this course work the same way.
                </div>

                <FAQSection
                  items={[
                    {
                      q: 'Is Cursor really free?',
                      a: 'Yes. The free plan gives you plenty of AI usage to complete this course. You do not need to pay anything.',
                    },
                    {
                      q: "I see it says 'VS Code' somewhere. What's that?",
                      a: "VS Code is another popular code editor. Cursor is built on top of it. You don't need to know anything about VS Code — just use Cursor.",
                    },
                    {
                      q: "I'm on Windows, will it work?",
                      a: 'Yes. Cursor works on Windows, Mac, and Linux.',
                    },
                  ]}
                />
              </div>

              {/* Tool 2: GitHub */}
              <div className="mb-12">
                <H3>🛠 Tool 2: GitHub — Where Your Code Lives</H3>
                <P>
                  GitHub is like Google Drive, but for code. Every time you save your work, it goes to GitHub.
                  Later, Vercel reads your code from GitHub and puts your app live on the internet. It&apos;s free.
                </P>

                <p className="text-sm font-semibold mb-2 mt-6">Steps to set up GitHub:</p>
                <StepList
                  steps={[
                    <>Go to <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">github.com</a></>,
                    <>Click <strong>Sign up</strong> in the top right</>,
                    <>Enter your email, create a password, choose a username</>,
                    <>Verify your email (check your inbox)</>,
                    <>When it asks about your plan, choose <strong>Free</strong></>,
                    <>Create your first repository: click the <strong>+</strong> icon → <strong>New repository</strong></>,
                    <>Name it <InlineCode>kanban-app</InlineCode> → scroll down → click <strong>Create repository</strong></>,
                    <>Keep this page open — you&apos;ll need the URL in Module 6</>,
                  ]}
                />

                <p className="text-sm font-semibold mb-2 mt-6">Watch this setup tutorial:</p>
                <YTEmbed videoId="tRZGeaHPoaw" title="Git and GitHub Tutorial for Beginners" />

                <FAQSection
                  items={[
                    {
                      q: "What's a repository?",
                      a: 'A repository (or "repo") is just a folder where your project lives on GitHub. Think of it like a project folder on your computer, stored safely online so it can\'t get lost.',
                    },
                    {
                      q: 'Do I need to understand Git commands?',
                      a: "Not really. Cursor has a built-in tool to push your code to GitHub with a few clicks. We'll use that in Module 6.",
                    },
                    {
                      q: 'Is GitHub free?',
                      a: 'Yes. The free plan is more than enough for this course and for personal projects.',
                    },
                  ]}
                />
              </div>

              {/* Tool 3: Supabase */}
              <div className="mb-12">
                <H3>🛠 Tool 3: Supabase — Your App&apos;s Database</H3>
                <P>
                  Supabase is your app&apos;s memory. When someone adds a task to your Kanban board, Supabase saves
                  it. When they come back, Supabase shows it again. Think of it like a Google Sheet that your app
                  can read and write to automatically. Free tier is generous.
                </P>

                <p className="text-sm font-semibold mb-2 mt-6">Steps to set up Supabase:</p>
                <StepList
                  steps={[
                    <>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">supabase.com</a></>,
                    <>Click <strong>Start your project</strong></>,
                    <>Sign up with GitHub (easiest) or your email</>,
                    <>Click <strong>New project</strong></>,
                    <>Name it <InlineCode>kanban-app</InlineCode></>,
                    <>Choose a strong database password (save it somewhere — you may need it later)</>,
                    <>Pick the region closest to you (e.g., &quot;Europe West&quot; if you&apos;re in Europe)</>,
                    <>Click <strong>Create new project</strong> and wait ~2 minutes</>,
                    <>Once ready, go to <strong>Project Settings → API</strong></>,
                    <>Copy both the <strong>Project URL</strong> and the <strong>anon / public</strong> key — paste them in a text file for Module 5</>,
                  ]}
                />

                <p className="text-sm font-semibold mb-2 mt-6">Watch this setup tutorial:</p>
                <YTEmbed videoId="dU7GwCOgvNY" title="Learn Supabase (Firebase Alternative) – Full Tutorial for Beginners" />

                <FAQSection
                  items={[
                    {
                      q: "What's a database?",
                      a: "A database is like a spreadsheet that your app can read and write automatically. You don't open it manually — your app does it for you when someone adds or moves a task.",
                    },
                    {
                      q: "What's the anon key?",
                      a: "It's a password that lets your app talk to your database. It's safe to use in your app's code for reading and writing basic data.",
                    },
                    {
                      q: 'Is Supabase free?',
                      a: 'Yes. The free tier gives you 500MB of database storage and up to 50,000 monthly active users — more than enough for this course and many real projects.',
                    },
                  ]}
                />
              </div>

              {/* Tool 4: Vercel */}
              <div className="mb-4">
                <H3>🛠 Tool 4: Vercel — Where Your App Goes Live</H3>
                <P>
                  Vercel takes your code from GitHub and puts it on the internet. Every time you make a change and
                  push it to GitHub, Vercel automatically updates your live app within 30 seconds. Your app gets a
                  free URL like <InlineCode>kanban-app.vercel.app</InlineCode>.
                </P>

                <p className="text-sm font-semibold mb-2 mt-6">Steps to set up Vercel:</p>
                <StepList
                  steps={[
                    <>Go to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">vercel.com</a></>,
                    <>Click <strong>Sign Up</strong></>,
                    <>Choose <strong>Continue with GitHub</strong> — this links Vercel to your GitHub account</>,
                    <>You&apos;ll land on your Vercel dashboard — it&apos;s empty for now. That&apos;s fine.</>,
                  ]}
                />

                <p className="text-sm font-semibold mb-2 mt-6">Watch this setup tutorial:</p>
                <YTEmbed videoId="TbQilT_TttE" title="Deploy Your Website to Vercel in 5 Minutes" />

                <FAQSection
                  items={[
                    {
                      q: 'Why does Vercel need my GitHub?',
                      a: 'Because Vercel deploys your code from GitHub. When you push new code to GitHub, Vercel automatically updates your live app.',
                    },
                    {
                      q: 'Is Vercel free?',
                      a: 'Yes. The Hobby plan is free forever for personal projects.',
                    },
                    {
                      q: 'Can I use a custom domain?',
                      a: 'Yes — you can connect your own domain name to Vercel for free. We won\'t cover this in the course, but it\'s straightforward once your app is live.',
                    },
                  ]}
                />
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                MODULE 3: How to Talk to AI
            ═══════════════════════════════════════════════════════════════ */}
            <section id="module-3" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-black/8 dark:bg-white/10 flex items-center justify-center text-xs font-bold">3</div>
                <h2 className="text-2xl font-bold">💬 How to Talk to AI</h2>
              </div>

              <SummaryBox>
                <ul className="space-y-1.5 text-sm text-amber-800 dark:text-amber-200">
                  <li>• A &quot;prompt&quot; is just what you type to the AI — like a text message</li>
                  <li>• Specific, detailed prompts get much better results than vague ones</li>
                  <li>• You have choices: Claude, GPT-4o, or Gemini — all work similarly</li>
                  <li>• When something goes wrong, describe what you see and what you want instead</li>
                </ul>
                <p className="text-xs mt-3 text-amber-700/60 dark:text-amber-400/60">
                  Already know this?{' '}
                  <a href="#module-4" className="underline underline-offset-2">Skip to Module 4 →</a>
                </p>
              </SummaryBox>

              <H2>Pick your AI</H2>
              <P>All of these can write code. Use whatever you prefer:</P>

              <div className="overflow-x-auto my-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-black/8 dark:border-white/8">
                      <th className="text-left py-2.5 pr-4 font-semibold text-black/60 dark:text-white/60 whitespace-nowrap">AI</th>
                      <th className="text-left py-2.5 pr-4 font-semibold text-black/60 dark:text-white/60">Where to use it</th>
                      <th className="text-left py-2.5 font-semibold text-black/60 dark:text-white/60">Best for</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/6 dark:divide-white/6">
                    <tr>
                      <td className="py-2.5 pr-4 font-medium whitespace-nowrap">Claude (Anthropic)</td>
                      <td className="py-2.5 pr-4 text-black/65 dark:text-white/65">Cursor (built in) or claude.ai</td>
                      <td className="py-2.5 text-black/65 dark:text-white/65">Clean code, long context</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-medium whitespace-nowrap">GPT-4o (OpenAI)</td>
                      <td className="py-2.5 pr-4 text-black/65 dark:text-white/65">Cursor (built in) or chatgpt.com</td>
                      <td className="py-2.5 text-black/65 dark:text-white/65">Very widely used, fast</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-medium whitespace-nowrap">Gemini (Google)</td>
                      <td className="py-2.5 pr-4 text-black/65 dark:text-white/65">Cursor (built in) or gemini.google.com</td>
                      <td className="py-2.5 text-black/65 dark:text-white/65">Good for Google tools</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <P>
                <strong>For this course:</strong> Use whatever is already in Cursor — by default it uses Claude.
                You can change it in Cursor settings under &quot;Models.&quot;
              </P>

              <H2>Pick your editor</H2>
              <P>If you&apos;re not using Cursor, here are the alternatives:</P>

              <div className="overflow-x-auto my-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-black/8 dark:border-white/8">
                      <th className="text-left py-2.5 pr-4 font-semibold text-black/60 dark:text-white/60">Tool</th>
                      <th className="text-left py-2.5 pr-4 font-semibold text-black/60 dark:text-white/60">How it works</th>
                      <th className="text-left py-2.5 font-semibold text-black/60 dark:text-white/60">Best for</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/6 dark:divide-white/6">
                    <tr>
                      <td className="py-2.5 pr-4 font-medium">Cursor</td>
                      <td className="py-2.5 pr-4 text-black/65 dark:text-white/65">Download app, AI inside</td>
                      <td className="py-2.5 text-black/65 dark:text-white/65">Most control</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-medium">Bolt.new</td>
                      <td className="py-2.5 pr-4 text-black/65 dark:text-white/65">Browser only, instant start</td>
                      <td className="py-2.5 text-black/65 dark:text-white/65">No downloads</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-medium">Lovable</td>
                      <td className="py-2.5 pr-4 text-black/65 dark:text-white/65">Browser, visual + AI</td>
                      <td className="py-2.5 text-black/65 dark:text-white/65">Beginners who want speed</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-medium">Windsurf</td>
                      <td className="py-2.5 pr-4 text-black/65 dark:text-white/65">Download app, similar to Cursor</td>
                      <td className="py-2.5 text-black/65 dark:text-white/65">Alternative to Cursor</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <H2>What is a prompt?</H2>
              <P>
                A prompt is just what you type to the AI — like a text message to a very smart assistant. The
                clearer you are, the better the result.
              </P>

              <H3>Bad prompt vs good prompt</H3>
              <P>❌ Bad:</P>
              <CodeBlock>{'Make me an app'}</CodeBlock>
              <P>The AI doesn&apos;t know what kind of app, what it should look like, or what it should do.</P>

              <P>✅ Good:</P>
              <CodeBlock>{`Create a Kanban board web app using HTML, CSS, and JavaScript.
It should have three columns: "To Do", "In Progress", and "Done".
Each column should have a button to add a new task card.
Task cards should have a title and a right-arrow button that moves them to the next column.
Cards in the "Done" column should have a delete button instead.
The design should be clean and minimal with a white background and subtle card shadows.`}</CodeBlock>

              <H3>The prompt formula</H3>
              <CodeBlock>{`Create [what you want].
It should have [specific features].
When someone [does action], it should [result].
The design should be [style description].
Use [technology or colours if you have a preference].`}</CodeBlock>

              <H3>The &quot;fix it&quot; formula</H3>
              <P>
                When something looks wrong, don&apos;t say &quot;it&apos;s broken.&quot; Describe what you see:
              </P>
              <CodeBlock>{`The "Move Right" button on cards in the "In Progress" column is not visible.
Please make it visible and style it as a small blue button.`}</CodeBlock>

              <H3>The starter prompt for your Kanban board</H3>
              <P>Copy this into Cursor&apos;s AI chat (press <InlineCode>Cmd+L</InlineCode> on Mac or <InlineCode>Ctrl+L</InlineCode> on Windows):</P>
              <CodeBlock>{`Create a Kanban board web app as a single HTML file called index.html.

The board should have three columns: "To Do", "In Progress", and "Done".

Each column should:
- Have a bold heading at the top
- Show a list of task cards
- Have an "Add Task" button at the bottom that shows an input for typing a task name

Each task card should:
- Show the task title
- Have a right-arrow (→) button to move it to the next column
- Have a delete (×) button to remove it from the board

The "Done" column should not have a right-arrow button.

Style it with:
- Light grey (#f4f4f5) page background
- White column backgrounds with rounded corners
- Subtle drop shadows on cards
- Blue "Add Task" buttons
- Clean, readable font (use system-ui or Inter from Google Fonts)

Store the tasks in the browser's localStorage so they persist after page refresh.`}</CodeBlock>

              <FAQSection
                items={[
                  {
                    q: 'Which AI gives better code — Claude or GPT-4o?',
                    a: "Both are excellent. Claude tends to write cleaner, more readable code with fewer bugs. GPT-4o is faster. Try both and use whichever feels right for you.",
                  },
                  {
                    q: 'What if the AI gives me something completely different from what I asked?',
                    a: 'Add more detail. Instead of starting over, add a follow-up message: "That\'s not quite right. I specifically need [describe what\'s missing]."',
                  },
                  {
                    q: 'Can I just paste the prompts from this course?',
                    a: 'Yes! The prompts in this course are ready to copy and paste.',
                  },
                  {
                    q: 'The AI keeps asking me questions instead of writing code.',
                    a: 'Add this to the end of your prompt: "Don\'t ask clarifying questions, just build it."',
                  },
                  {
                    q: 'How many times can I ask the AI to fix things?',
                    a: "As many times as you need. There's no limit. Professional developers go back and forth with AI dozens of times per feature.",
                  },
                ]}
              />
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                MODULE 4: Build Your Kanban Board
            ═══════════════════════════════════════════════════════════════ */}
            <section id="module-4" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-black/8 dark:bg-white/10 flex items-center justify-center text-xs font-bold">4</div>
                <h2 className="text-2xl font-bold">🖥 Build Your Kanban Board</h2>
              </div>

              <SummaryBox>
                <ul className="space-y-1.5 text-sm text-amber-800 dark:text-amber-200">
                  <li>• Open Cursor, create a new project folder called <InlineCode>kanban-app</InlineCode></li>
                  <li>• Open the AI chat with <InlineCode>Cmd+L</InlineCode> / <InlineCode>Ctrl+L</InlineCode></li>
                  <li>• Paste the starter prompt — the AI writes all the code</li>
                  <li>• Preview it in your browser, then make changes by describing them</li>
                </ul>
                <p className="text-xs mt-3 text-amber-700/60 dark:text-amber-400/60">
                  Already know this?{' '}
                  <a href="#module-5" className="underline underline-offset-2">Skip to Module 5 →</a>
                </p>
              </SummaryBox>

              <H2>Step 1: Open Cursor and create your project</H2>
              <StepList
                steps={[
                  'Open Cursor on your computer',
                  <>Click <strong>File</strong> in the top menu → <strong>Open Folder</strong></>,
                  <>Navigate to your Desktop → click <strong>New Folder</strong> → name it <InlineCode>kanban-app</InlineCode> → click Open</>,
                  "You'll see an empty file list on the left. That's your project. It's blank for now.",
                ]}
              />

              <H2>Step 2: Open the AI chat</H2>
              <P>
                Press <InlineCode>Cmd+L</InlineCode> (Mac) or <InlineCode>Ctrl+L</InlineCode> (Windows).
              </P>
              <P>
                A panel opens on the right side of the screen. This is your AI chat. Everything you type here
                goes to Claude (or whichever AI you set in the previous module).
              </P>

              <H2>Step 3: Build the board with your first prompt</H2>
              <P>
                Copy the prompt from Module 3 and paste it into the AI chat. Press Enter. Watch the AI write
                the code — it takes 30–60 seconds.
              </P>
              <P>
                When it finishes, you&apos;ll see it has created a file called <InlineCode>index.html</InlineCode>{' '}
                in the left panel.
              </P>

              <H2>Step 4: See your app in your browser</H2>
              <P>When the AI finishes, look at the left panel. Click on <InlineCode>index.html</InlineCode>.</P>
              <P>
                Now press <InlineCode>Ctrl+Shift+P</InlineCode> (Windows) or <InlineCode>Cmd+Shift+P</InlineCode>{' '}
                (Mac) → type <strong>Live Preview</strong> → click <strong>Show Live Preview</strong>.
              </P>
              <P>Your browser opens and you&apos;ll see your Kanban board.</P>

              <H2>Step 5: Test it</H2>
              <StepList
                steps={[
                  <>Click <strong>Add Task</strong> in the &quot;To Do&quot; column</>,
                  <>Type a task name like &quot;Buy groceries&quot;</>,
                  <>Press Enter or click the button — a card should appear</>,
                  <>Click the <strong>→</strong> button — it should move to &quot;In Progress&quot;</>,
                  <>Click <strong>→</strong> again — it should move to &quot;Done&quot;</>,
                  <>Click the <strong>×</strong> button — it should disappear</>,
                  <>Refresh the page — the tasks should still be there (localStorage)</>,
                ]}
              />

              <H2>Step 6: Make changes by describing them</H2>
              <P>Go back to the AI chat. Try these follow-up prompts one at a time:</P>
              <CodeBlock>{'Add a task count badge to each column heading showing how many tasks are in it.'}</CodeBlock>
              <CodeBlock>{`Make the card background slightly different per column:
- To Do: white
- In Progress: light blue tint (#f0f7ff)
- Done: light green tint (#f0fdf4)`}</CodeBlock>
              <P>
                Each time, check the preview. If something looks off, describe it in plain English and ask the
                AI to fix it.
              </P>

              <FAQSection
                items={[
                  {
                    q: "The AI made a file but I can't find it.",
                    a: 'Look at the left sidebar panel in Cursor. All files in your project folder appear there. If you don\'t see index.html, click the refresh icon at the top of the sidebar.',
                  },
                  {
                    q: "The Live Preview isn't working.",
                    a: 'In the AI chat, type: "Can you show me how to open index.html in my browser from Cursor?" The AI will guide you.',
                  },
                  {
                    q: 'The AI wrote code but the board looks blank or broken.',
                    a: 'Open the AI chat and type: "The page is blank when I open index.html. Can you check the code for errors and fix them?"',
                  },
                  {
                    q: 'The tasks disappear when I refresh the page.',
                    a: 'Type in the AI chat: "Tasks are disappearing when I refresh the page. Please make sure they are being saved and loaded from localStorage correctly."',
                  },
                  {
                    q: 'How do I undo a change the AI made that broke something?',
                    a: 'Press Cmd+Z (Mac) or Ctrl+Z (Windows) to undo. Or type in the AI chat: "The last change broke the layout. Please revert it."',
                  },
                ]}
              />
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                MODULE 5: Save Tasks to Supabase
            ═══════════════════════════════════════════════════════════════ */}
            <section id="module-5" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-black/8 dark:bg-white/10 flex items-center justify-center text-xs font-bold">5</div>
                <h2 className="text-2xl font-bold">🗄 Save Tasks to Supabase</h2>
              </div>

              <SummaryBox>
                <ul className="space-y-1.5 text-sm text-amber-800 dark:text-amber-200">
                  <li>• Right now tasks are in your browser only — they vanish on another device</li>
                  <li>• Supabase gives your app a real database so tasks persist everywhere</li>
                  <li>• You&apos;ll create a <InlineCode>tasks</InlineCode> table and connect it to your board</li>
                  <li>• This module takes about 20 minutes</li>
                </ul>
                <p className="text-xs mt-3 text-amber-700/60 dark:text-amber-400/60">
                  Already know this?{' '}
                  <a href="#module-6" className="underline underline-offset-2">Skip to Module 6 →</a>
                </p>
              </SummaryBox>

              <H2>Why do we need Supabase?</H2>
              <P>
                Right now your tasks are stored in <InlineCode>localStorage</InlineCode> — a small amount of
                memory inside your browser. If you open your app on a different computer, the tasks won&apos;t
                be there. And if you clear your browser history, they disappear.
              </P>
              <P>
                Supabase gives your app a real database on the internet. Tasks are saved there. Anyone who opens
                your app will see the same tasks.
              </P>

              <H2>Step 1: Create the tasks table</H2>
              <StepList
                steps={[
                  <>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">supabase.com</a> and log in</>,
                  <>Click on your <InlineCode>kanban-app</InlineCode> project</>,
                  <>Click <strong>Table Editor</strong> in the left sidebar</>,
                  <>Click <strong>New Table</strong></>,
                  <>Name it: <InlineCode>tasks</InlineCode></>,
                  <>Add these columns (click &quot;Add Column&quot; for each):</>,
                  <><InlineCode>title</InlineCode> — type: <strong>text</strong> — uncheck &quot;nullable&quot; (required field)</>,
                  <><InlineCode>status</InlineCode> — type: <strong>text</strong> — default value: <InlineCode>todo</InlineCode></>,
                  <>Leave the <InlineCode>id</InlineCode> and <InlineCode>created_at</InlineCode> columns that are already there</>,
                  <>Click <strong>Save</strong></>,
                ]}
              />

              <H2>Step 2: Allow your app to read and write tasks</H2>
              <P>
                Supabase blocks everything by default for security. You need to allow your app to read and write
                data in your <InlineCode>tasks</InlineCode> table.
              </P>
              <StepList
                steps={[
                  <>In Supabase, click <strong>Authentication</strong> in the left sidebar</>,
                  <>Click <strong>Policies</strong></>,
                  <>Find the <InlineCode>tasks</InlineCode> table → click <strong>New Policy</strong></>,
                  <>Choose <strong>Enable read access for all users</strong> → Save</>,
                  <>Click <strong>New Policy</strong> again → choose <strong>Enable insert access for all users</strong> → Save</>,
                  <>Repeat for <strong>update</strong> and <strong>delete</strong></>,
                ]}
              />

              <H2>Step 3: Connect your app to Supabase</H2>
              <P>
                Get your Supabase URL and anon key from: <strong>Project Settings → API</strong>. You saved
                these in Module 2 — find that text file now.
              </P>
              <P>Now go to the Cursor AI chat and type:</P>
              <CodeBlock>{`Update my Kanban board to use Supabase instead of localStorage.

My Supabase URL is: [paste your URL here]
My Supabase anon key is: [paste your key here]

Changes needed:
1. Load tasks from Supabase on page load (select all rows from the "tasks" table)
2. When adding a task, insert a new row into "tasks" with the title and status
   (use "todo", "in-progress", or "done" as the status value)
3. When moving a task with the → button, update its "status" in Supabase
4. When deleting a task with the × button, delete its row from Supabase

Use the Supabase JavaScript library via CDN (add it as a script tag in the HTML).`}</CodeBlock>

              <H2>Step 4: Test the database connection</H2>
              <StepList
                steps={[
                  'Open your app in the browser',
                  'Add a task',
                  <>Go to Supabase → <strong>Table Editor</strong> → <strong>tasks</strong> — you should see a new row</>,
                  'Move the task to "In Progress"',
                  'Refresh Supabase — the status column should have updated',
                  'Open the app in a different browser tab — the task should appear there too',
                ]}
              />

              <FAQSection
                items={[
                  {
                    q: 'I see an error about "CORS" or "not allowed."',
                    a: 'It means Supabase is blocking the request. Make sure you\'ve completed Step 2 (setting up Row Level Security policies). Also type in the AI chat: "I\'m getting a CORS or permission error when trying to connect to Supabase. Can you help me debug it?"',
                  },
                  {
                    q: 'The app loads but shows no tasks even though I added them.',
                    a: 'Check that the table name in the code matches exactly — it must be "tasks" (lowercase). Also check the Supabase URL and anon key are correct.',
                  },
                  {
                    q: 'Is my Supabase anon key secret?',
                    a: 'The anon key is designed to be used in front-end code. It\'s not a big secret for personal projects. The service role key (in Supabase Settings → API → Service Role) is secret — never use that one in your front-end code.',
                  },
                  {
                    q: 'Can multiple people use the board at the same time?',
                    a: 'Yes — because the data is in Supabase, anyone who opens the URL sees the same tasks. For separate boards per user you\'d need authentication, which is a more advanced topic.',
                  },
                  {
                    q: 'What do "todo", "in-progress", and "done" mean in the database?',
                    a: 'These are the status values we store to track which column a task is in. The code maps each status string to a column on the board.',
                  },
                ]}
              />
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                MODULE 6: Go Live with Vercel
            ═══════════════════════════════════════════════════════════════ */}
            <section id="module-6" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-black/8 dark:bg-white/10 flex items-center justify-center text-xs font-bold">6</div>
                <h2 className="text-2xl font-bold">🌍 Go Live with Vercel</h2>
              </div>

              <SummaryBox>
                <ul className="space-y-1.5 text-sm text-amber-800 dark:text-amber-200">
                  <li>• &quot;Deploying&quot; means copying your app to a server so anyone can visit it</li>
                  <li>• You push your code to GitHub → Vercel picks it up automatically</li>
                  <li>• Your app gets a free URL like <InlineCode>kanban-app.vercel.app</InlineCode></li>
                  <li>• Every future change deploys in ~30 seconds</li>
                </ul>
                <p className="text-xs mt-3 text-amber-700/60 dark:text-amber-400/60">
                  This is the last module — you&apos;re almost there!
                </p>
              </SummaryBox>

              <H2>What does &quot;going live&quot; mean?</H2>
              <P>
                Right now your app only works on your computer. Nobody else can see it.
                &quot;Deploying&quot; means copying it to a computer on the internet that&apos;s always on.
              </P>
              <P>
                Vercel does this for you — for free. It reads your code from GitHub and puts it live. Every
                time you make a change and push it to GitHub, Vercel redeploys within 30 seconds.
              </P>

              <H2>Step 1: Push your code to GitHub using Cursor</H2>
              <P>
                In Cursor, open the Source Control panel by pressing{' '}
                <InlineCode>Ctrl+Shift+G</InlineCode> (Windows) / <InlineCode>Cmd+Shift+G</InlineCode> (Mac),
                or click the branch icon (Y-shape) in the left sidebar.
              </P>
              <StepList
                steps={[
                  "You'll see your changed files listed",
                  <>Click the <strong>+</strong> next to each file to &quot;stage&quot; it (or the big <strong>+</strong> at the top to stage all)</>,
                  <>Type a message in the &quot;Message&quot; box: <InlineCode>my kanban app</InlineCode></>,
                  <>Click the checkmark <strong>✓</strong> to commit</>,
                  <>Click <strong>Publish Branch</strong> (or <strong>Push</strong>)</>,
                  <>It will ask you to link to GitHub — sign in and choose your <InlineCode>kanban-app</InlineCode> repository</>,
                ]}
              />

              <H3>Alternative: terminal commands</H3>
              <P>
                Press <InlineCode>Ctrl+`</InlineCode> (Windows) or <InlineCode>Cmd+`</InlineCode> (Mac) to
                open the terminal in Cursor. Type:
              </P>
              <CodeBlock>{`git init
git add .
git commit -m "my kanban app"
git branch -M main
git remote add origin [your GitHub repo URL]
git push -u origin main`}</CodeBlock>
              <P>
                Replace <InlineCode>[your GitHub repo URL]</InlineCode> with the URL from your GitHub
                repository page (e.g., <InlineCode>https://github.com/yourname/kanban-app.git</InlineCode>).
              </P>
              <P>
                Not sure about the commands? Ask the AI: <em>&quot;I want to push my code to my GitHub
                repository at [paste your repo URL]. Can you give me the exact terminal commands?&quot;</em>
              </P>

              <H2>Step 2: Deploy with Vercel</H2>
              <StepList
                steps={[
                  <>Go to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">vercel.com</a> and log in</>,
                  <>Click <strong>Add New…</strong> → <strong>Project</strong></>,
                  <>Find <InlineCode>kanban-app</InlineCode> in your GitHub repository list → click <strong>Import</strong></>,
                  <>Leave all settings as they are — Vercel is smart enough to detect your project</>,
                  <>Click <strong>Deploy</strong></>,
                  <>Wait about 30 seconds</>,
                ]}
              />

              <H2>Step 3: Get your URL</H2>
              <P>
                When Vercel shows &quot;Congratulations!&quot; you&apos;ll see a URL like{' '}
                <InlineCode>kanban-app.vercel.app</InlineCode>. Click it. Your app is live on the internet.
              </P>
              <P>
                Send that URL to anyone. They can use your Kanban board right now, from anywhere in the world.
              </P>

              <H2>Step 4: Future updates are automatic</H2>
              <P>Every time you make a change:</P>
              <StepList
                steps={[
                  'Edit your code in Cursor',
                  'Go to Source Control panel → stage your changes → commit',
                  'Click Push',
                  'Vercel detects the new code and redeploys within 30 seconds',
                ]}
              />

              <FAQSection
                items={[
                  {
                    q: 'The deployment failed. What do I do?',
                    a: 'Click "View Logs" in Vercel to see the error. Copy it and paste into Cursor AI chat: "My Vercel deployment failed with this error: [paste error]. How do I fix it?"',
                  },
                  {
                    q: 'My app works on my computer but not on Vercel.',
                    a: 'This is almost always because the Supabase URL or key is hardcoded in your HTML. For a live app, you should move these to Vercel environment variables: Vercel → Your Project → Settings → Environment Variables → add SUPABASE_URL and SUPABASE_ANON_KEY. Then ask the AI to update your code to read from environment variables.',
                  },
                  {
                    q: 'Can I get a custom domain?',
                    a: 'Yes — in Vercel → Your Project → Settings → Domains → add your domain. You\'ll need to update your domain\'s DNS settings. Your domain registrar will have instructions.',
                  },
                  {
                    q: 'How do I update my app after it\'s live?',
                    a: 'Make your changes in Cursor, commit, and push to GitHub. Vercel automatically picks up the new code and redeploys.',
                  },
                  {
                    q: 'Is Vercel really free forever?',
                    a: 'The Hobby plan is free for personal projects. If you start charging users or get very high traffic, you\'d consider upgrading.',
                  },
                ]}
              />
            </section>

            {/* ── You Did It ──────────────────────────────────────────────── */}
            <section className="bg-stone-50 dark:bg-zinc-900 rounded-2xl p-8 mb-8 text-center">
              <p className="text-4xl mb-4">🎉</p>
              <h2 className="text-2xl font-bold mb-4">You did it.</h2>
              <p className="text-black/65 dark:text-white/65 mb-6 leading-relaxed max-w-md mx-auto">
                You just built and deployed a real Kanban board app. Without writing a single line of code.
              </p>
              <ul className="text-left inline-block space-y-2 mb-8">
                {[
                  'A working Kanban board with To Do / In Progress / Done columns',
                  'Tasks that save to a real database (Supabase)',
                  'A live URL anyone in the world can visit',
                  'A GitHub repository with your code',
                  'Automatic deploys — every change goes live in 30 seconds',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✅</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black font-semibold px-5 py-2.5 rounded-full text-sm hover:opacity-80 transition-opacity"
                >
                  Browse VibeStack tools →
                </Link>
                <Link
                  href="/course"
                  className="inline-flex items-center justify-center gap-2 border border-black/12 dark:border-white/12 text-black/70 dark:text-white/70 font-medium px-5 py-2.5 rounded-full text-sm hover:border-black/30 dark:hover:border-white/30 hover:text-black dark:hover:text-white transition-colors"
                >
                  Share this course
                </Link>
              </div>
              <p className="text-xs text-black/35 dark:text-white/35 mt-6">
                Ideas for what to build next: expense tracker · habit tracker · reading list · simple CRM
              </p>
            </section>
          </main>
        </div>
      </div>

      <footer className="border-t border-black/8 dark:border-white/8 px-6 py-6 text-center text-sm text-black/40 dark:text-white/40">
        <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
          ← Back to VibeStack — curated tools for non-coder builders
        </Link>
      </footer>
    </div>
  );
}
