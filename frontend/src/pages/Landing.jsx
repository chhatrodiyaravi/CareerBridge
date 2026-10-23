import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  BarChart2,
  BookOpen,
  CheckCircle,
  ChevronRight,
  FileText,
  Search,
  Zap,
} from "lucide-react"
import Logo from "../components/Logo"
const features = [
  {
    icon: Zap,
    title: "Skill-Based Matching",
    desc: "Compare the skills on your profile with requirements from published internships.",
    color: "#2563EB",
  },
  {
    icon: Search,
    title: "Internship Discovery",
    desc: "Search current opportunities by role, skills, and work mode.",
    color: "#7c3aed",
  },
  {
    icon: BarChart2,
    title: "Skill Gap Insights",
    desc: "See which required skills are not yet listed on your profile.",
    color: "#059669",
  },
  {
    icon: BookOpen,
    title: "Personalized Recommendations",
    desc: "Explore opportunities ranked using your saved skills.",
    color: "#d97706",
  },
  {
    icon: FileText,
    title: "Application Tracking",
    desc: "Review your applications and the status updates shared by companies.",
    color: "#dc2626",
  },
]
const steps = [
  {
    n: "01",
    title: "Create Your Profile",
    desc: "Register and save your education and contact details.",
  },
  {
    n: "02",
    title: "Add Your Skills",
    desc: "Keep your skills up to date in your profile.",
  },
  {
    n: "03",
    title: "Explore Opportunities",
    desc: "Review published internships and compare skill matches.",
  },
  {
    n: "04",
    title: "Apply and Track",
    desc: "Submit applications and follow their status in your dashboard.",
  },
]
export default function Landing() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3.5 sm:px-6">
          <Logo />
          <div className="hidden flex-1 items-center gap-6 md:flex">
            <a
              href="#home"
              className="text-sm font-medium text-slate-600 hover:text-blue-600"
            >
              Home
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-blue-600"
            >
              Features
            </a>
            <a
              href="#how"
              className="text-sm font-medium text-slate-600 hover:text-blue-600"
            >
              How It Works
            </a>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <button
              onClick={() => navigate("/login")}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 py-20 md:py-28"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.08),transparent)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
              <span className="text-xs font-semibold text-blue-700">
                Opportunities matched to your skills
              </span>
            </div>
            <h1
              className="mb-5 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl lg:text-6xl"
              style={{ fontFamily: "'Outfit',sans-serif" }}
            >
              Bridge Your Skills to Your Dream{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Internship
              </span>
            </h1>
            <p className="mb-8 max-w-lg text-lg leading-relaxed text-slate-500">
              Discover current internship opportunities, understand their skill
              requirements, and keep your applications organized.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/student/internships")}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700"
              >
                Find Internships <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("/register")}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 font-semibold text-blue-600 transition-colors hover:bg-blue-50"
              >
                Get Started <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-2xl shadow-slate-200">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                CareerBridge workflow
              </p>
              <h2
                className="mb-6 text-2xl font-bold text-slate-900"
                style={{ fontFamily: "'Outfit',sans-serif" }}
              >
                From profile to application
              </h2>
              {[
                {
                  title: "Your profile",
                  desc: "Education and saved skills",
                  icon: CheckCircle,
                },
                {
                  title: "Published internships",
                  desc: "Requirements from company listings",
                  icon: Search,
                },
                {
                  title: "Match insights",
                  desc: "Skills you have and skills to develop",
                  icon: BarChart2,
                },
                {
                  title: "Application tracking",
                  desc: "Status updates in one place",
                  icon: FileText,
                },
              ].map(({ title, desc, icon: Icon }, index) => (
                <div key={title} className="flex items-center gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      index === 0
                        ? "bg-green-50 text-green-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 border-b border-slate-100 py-4 last:border-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {title}
                    </p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-600 py-10">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-lg font-semibold text-white">
            A single place to discover, apply, and track.
          </p>
          <p className="mt-2 text-sm text-blue-100">
            Student profiles, company postings, and application updates
            connected to live data.
          </p>
        </div>
      </section>

      <section id="how" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <h2
              className="mb-3 text-3xl font-extrabold text-slate-900 md:text-4xl"
              style={{ fontFamily: "'Outfit',sans-serif" }}
            >
              How It Works
            </h2>
            <p className="mx-auto max-w-xl text-slate-500">
              Manage your internship search in a few simple steps.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.n}
                className="relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className="mb-3 text-3xl font-extrabold text-blue-100"
                  style={{ fontFamily: "'Outfit',sans-serif" }}
                >
                  {step.n}
                </div>
                <h3
                  className="mb-2 text-sm font-semibold text-slate-800"
                  style={{ fontFamily: "'Outfit',sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-500">
                  {step.desc}
                </p>
                {index < steps.length - 1 && (
                  <ChevronRight
                    size={16}
                    className="absolute -right-3 top-1/2 z-10 hidden text-slate-300 lg:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <h2
              className="mb-3 text-3xl font-extrabold text-slate-900 md:text-4xl"
              style={{ fontFamily: "'Outfit',sans-serif" }}
            >
              Tools for Your Internship Search
            </h2>
            <p className="mx-auto max-w-xl text-slate-500">
              Your profile and platform activity stay connected across the app.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-100 p-6 shadow-sm transition-all hover:border-slate-200 hover:bg-slate-50 hover:shadow-md"
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: `${feature.color}15` }}
                >
                  <feature.icon size={20} style={{ color: feature.color }} />
                </div>
                <h3
                  className="mb-2 font-semibold text-slate-800"
                  style={{ fontFamily: "'Outfit',sans-serif" }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {feature.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2
            className="mb-4 text-3xl font-extrabold text-white md:text-4xl"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            Ready to Bridge the Gap?
          </h2>
          <p className="mb-8 text-lg text-blue-100">
            Create your profile and start exploring internship opportunities.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="rounded-xl bg-white px-10 py-4 text-base font-bold text-blue-600 shadow-xl transition-colors hover:bg-blue-50"
          >
            Create Your Account
          </button>
        </div>
      </section>

      <footer className="bg-slate-900 py-10 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div>
            <Logo dark />
            <p className="mt-3 text-xs">Bridge your skills to your career.</p>
          </div>
          <div className="flex gap-5 text-xs">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#how" className="hover:text-white">
              How It Works
            </a>
            <button
              onClick={() => navigate("/register")}
              className="hover:text-white"
            >
              Create Account
            </button>
          </div>
          <p className="text-xs">© 2026 CareerBridge.</p>
        </div>
      </footer>
    </div>
  )
}
