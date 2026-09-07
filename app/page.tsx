import BatchWorkspace from "@/components/BatchWorkspace";

export default function Home() {
  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="#" aria-label="BatchFlow home">
          <span className="brand-mark">B</span>
          <span>BatchFlow</span>
        </a>

        <div className="prototype-badge">
          <span className="status-dot" />
          Proof of work
        </div>
      </header>

      <BatchWorkspace />

      <footer className="footer">
        Built as a focused proof-of-work for reliable multi-file processing.
      </footer>
    </main>
  );
}
