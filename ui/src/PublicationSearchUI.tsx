import { useState } from "react";
import {
  Search,
  ArrowLeft,
  ExternalLink,
  Loader2,
  BadgeCheck,
  BookOpen,
  AlertTriangle,
} from "lucide-react";

const API_BASE = "/api";

async function fetchCandidates(name, email) {
  const params = new URLSearchParams({ name });
  if (email) params.set("email", email);
  const res = await fetch(`${API_BASE}/Authors/candidates?${params}`);
  if (!res.ok) throw new Error(`candidates request failed (${res.status})`);
  return res.json();
}

async function fetchWorks(authorId) {
  const params = new URLSearchParams({ authorId });
  const res = await fetch(`${API_BASE}/Authors/getAllWorks?${params}`);
  if (!res.ok) throw new Error(`works request failed (${res.status})`);
  return res.json();
}

const DEMO_CANDIDATES = {
  resolvedInstitution: "Meridian Institute of Technology",
  candidates: [
    { openAlexId: "A5012345678", displayName: "Elena Marchetti", orcid: "0000-0002-4521-8890", institution: "Meridian Institute of Technology", worksCount: 84, citedByCount: 3120 },
    { openAlexId: "A5087654321", displayName: "Elena M. Marchetti", orcid: null, institution: "Coastal Polytechnic Union", worksCount: 6, citedByCount: 41 },
  ],
};

const DEMO_WORKS = {
  count: 4,
  results: [
    { id: "W1", title: "Radiation-hardened imaging for long-duration plasma confinement studies", publication_year: 2023, cited_by_count: 58, doi: "10.1000/demo.0001", primary_location: { source: { display_name: "Journal of Fusion Diagnostics" }, is_oa: true } },
    { id: "W2", title: "Shield geometry optimization for neutron flux attenuation in toroidal reactors", publication_year: 2021, cited_by_count: 112, doi: "10.1000/demo.0002", primary_location: { source: { display_name: "Nuclear Instruments Quarterly" }, is_oa: false } },
    { id: "W3", title: "Sensor lifetime extension under sustained gamma exposure", publication_year: 2019, cited_by_count: 203, doi: "10.1000/demo.0003", primary_location: { source: { display_name: "Applied Radiation Letters" }, is_oa: true } },
    { id: "W4", title: "A cross-facility survey of camera degradation in confinement devices", publication_year: 2017, cited_by_count: 76, doi: "10.1000/demo.0004", primary_location: { source: { display_name: "Fusion Engineering Review" }, is_oa: false } },
  ],
};

const c = {
  bg: "#F5F6F8",
  surface: "#FFFFFF",
  border: "#E2E5EA",
  ink: "#161A22",
  inkSoft: "#5B6472",
  accent: "#2C5F8A",
  accentDeep: "#1F4A6D",
  accentSoft: "#E9F1F8",
  success: "#1F7A4D",
  successSoft: "#E7F5EC",
  danger: "#B3413B",
};

export default function PublicationSearchUI() {
  const [view, setView] = useState("search");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [candidateData, setCandidateData] = useState(null);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [workData, setWorkData] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter the researcher's name to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    setDemoMode(false);
    try {
      const data = await fetchCandidates(name.trim(), email.trim());
      setCandidateData(data);
      setView("candidates");
    } catch (err) {
      setDemoMode(true);
      setCandidateData(DEMO_CANDIDATES);
      setView("candidates");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectCandidate(candidate) {
    setSelectedAuthor(candidate);
    setLoading(true);
    try {
      const data = demoMode ? DEMO_WORKS : await fetchWorks(candidate.openAlexId);
      setWorkData(data);
      setView("works");
    } catch {
      setWorkData(DEMO_WORKS);
      setDemoMode(true);
      setView("works");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setView("search");
    setCandidateData(null);
    setSelectedAuthor(null);
    setWorkData(null);
    setError(null);
  }

  return (
    <div className="min-h-screen w-full flex justify-center px-4 py-12 sm:py-20" style={{ background: c.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@1,500&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Newsreader', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        button, input { font-family: 'Inter', sans-serif; }
        input:focus-visible, button:focus-visible { outline: 2px solid ${c.accent}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
      `}</style>

      <div className="w-full max-w-2xl font-body">
        <div className="mb-10">
          <h1 className="font-display italic text-4xl sm:text-[2.75rem]" style={{ color: c.ink }}>
            Colophon
          </h1>
          <p className="mt-2 text-sm" style={{ color: c.inkSoft }}>
            Find a researcher by name and institution, then trace their full publication record.
          </p>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
          <div className="px-6 py-8 sm:px-9 sm:py-9">
            {view === "search" && (
              <form onSubmit={handleSearch} className="space-y-6">
                <Field label="Researcher name" required ink={c.ink} inkSoft={c.inkSoft}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-lg px-3.5 py-2.5 text-[15px]"
                    style={{ border: `1px solid ${c.border}`, color: c.ink, background: c.surface }}
                  />
                </Field>

                <Field
                  label="Institutional email"
                  hint="Optional — narrows results to their institution."
                  ink={c.ink}
                  inkSoft={c.inkSoft}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane.doe@university.edu"
                    className="font-mono w-full rounded-lg px-3.5 py-2.5 text-[14px]"
                    style={{ border: `1px solid ${c.border}`, color: c.ink, background: c.surface }}
                  />
                </Field>

                {error && (
                  <p className="text-sm flex items-center gap-2" style={{ color: c.danger }}>
                    <AlertTriangle size={14} aria-hidden="true" /> {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 text-[15px] font-medium rounded-lg transition-colors disabled:opacity-60"
                  style={{ background: c.accent, color: "#FFFFFF" }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />}
                  {loading ? "Searching…" : "Search"}
                </button>
              </form>
            )}

            {view === "candidates" && candidateData && (
              <div>
                <BackButton onClick={reset} color={c.inkSoft} />
                <h2 className="text-xl font-semibold mb-1" style={{ color: c.ink }}>
                  Confirm the researcher
                </h2>
                <p className="text-sm mb-6" style={{ color: c.inkSoft }}>
                  {candidateData.candidates.length} possible match{candidateData.candidates.length === 1 ? "" : "es"}
                  {candidateData.resolvedInstitution ? ` near ${candidateData.resolvedInstitution}` : ""}.
                </p>
                {demoMode && <DemoBanner color={c.accent} bg={c.accentSoft} />}
                <div className="space-y-2.5">
                  {candidateData.candidates.map((cand) => (
                    <button
                      key={cand.openAlexId}
                      onClick={() => handleSelectCandidate(cand)}
                      className="w-full text-left p-4 rounded-lg transition-colors"
                      style={{ border: `1px solid ${c.border}`, background: c.surface }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = c.accent)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = c.border)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium" style={{ color: c.ink }}>{cand.displayName}</p>
                          <p className="text-sm mt-0.5" style={{ color: c.inkSoft }}>{cand.institution || "Institution unknown"}</p>
                          {cand.orcid && <p className="font-mono text-xs mt-1.5" style={{ color: c.accent }}>{cand.orcid}</p>}
                        </div>
                        <div className="text-right shrink-0 text-xs font-mono" style={{ color: c.inkSoft }}>
                          <div>{cand.worksCount} works</div>
                          <div>{cand.citedByCount} citations</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {view === "works" && workData && selectedAuthor && (
              <div>
                <BackButton onClick={reset} color={c.inkSoft} />
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold" style={{ color: c.ink }}>{selectedAuthor.displayName}</h2>
                    <p className="text-sm" style={{ color: c.inkSoft }}>{workData.count ?? workData.results?.length ?? 0} works retrieved</p>
                  </div>
                  {selectedAuthor.orcid && (
                    <span
                      className="font-mono text-xs px-3 py-1.5 rounded-full"
                      style={{ background: c.accentSoft, color: c.accentDeep }}
                    >
                      {selectedAuthor.orcid}
                    </span>
                  )}
                </div>

                {demoMode && <DemoBanner color={c.accent} bg={c.accentSoft} />}

                <ol className="space-y-2.5">
                  {(workData.results || []).map((w, i) => (
                    <li key={w.id || i} className="p-4 rounded-lg" style={{ border: `1px solid ${c.border}`, background: c.surface }}>
                      <p className="font-medium leading-snug" style={{ color: c.ink }}>{w.title}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs" style={{ color: c.inkSoft }}>
                        <span>{w.primary_location?.source?.display_name || "Unknown venue"}</span>
                        <Dot color={c.border} />
                        <span className="font-mono">{w.publication_year}</span>
                        <Dot color={c.border} />
                        <span className="font-mono">{w.cited_by_count} citations</span>
                        {w.primary_location?.is_oa && (
                          <>
                            <Dot color={c.border} />
                            <span className="flex items-center gap-1" style={{ color: c.success }}>
                              <BadgeCheck size={13} aria-hidden="true" /> Open access
                            </span>
                          </>
                        )}
                        {w.doi && (
                          <>
                            <Dot color={c.border} />
                            <a
                              href={`https://doi.org/${w.doi.replace("https://doi.org/", "")}`}
                              className="font-mono flex items-center gap-1 hover:underline"
                              style={{ color: c.accent }}
                            >
                              {w.doi.replace("https://doi.org/", "")} <ExternalLink size={11} aria-hidden="true" />
                            </a>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                  {(!workData.results || workData.results.length === 0) && (
                    <li className="text-center py-10" style={{ color: c.inkSoft }}>
                      <BookOpen size={28} className="mx-auto mb-3" aria-hidden="true" />
                      No works on record for this entry yet.
                    </li>
                  )}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, required, children, ink, inkSoft }) {
  return (
    <label className="block">
      <span className="text-sm font-medium" style={{ color: ink }}>
        {label} {required && <span style={{ color: "#B3413B" }}>*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="block text-xs mt-1.5" style={{ color: inkSoft }}>{hint}</span>}
    </label>
  );
}

function BackButton({ onClick, color }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-sm mb-5" style={{ color }}>
      <ArrowLeft size={14} aria-hidden="true" /> Back to search
    </button>
  );
}

function Dot({ color }) {
  return <span style={{ color }}>•</span>;
}

function DemoBanner({ color, bg }) {
  return (
    <p className="text-xs mb-4 px-3 py-2 rounded-lg inline-block" style={{ color, background: bg }}>
      Showing demo data — connect this UI to your API to see live results.
    </p>
  );
}
