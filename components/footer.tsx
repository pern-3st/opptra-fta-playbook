export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-grey-light/60 bg-white/40">
      <div className="max-w-5xl mx-auto px-5 py-6 flex items-center justify-between text-xs text-grey">
        <span className="font-heading font-light tracking-wide text-navy">Opptra</span>
        <span>© {year} Opptra Internal — FTA Playbook</span>
      </div>
    </footer>
  );
}
