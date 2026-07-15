function Crosshairs() {
  return (
    <>
      <div className="fui-crosshair top-left" />
      <div className="fui-crosshair top-right" />
      <div className="fui-crosshair bottom-left" />
      <div className="fui-crosshair bottom-right" />
    </>
  );
}

export function BlinkingStatus({ text, active }: { text: string; active?: boolean }) {
  return (
    <div className={`fui-status ${active ? 'active' : ''}`}>
      <span className="fui-status-dot" />
      <span>{text}</span>
    </div>
  );
}

export function Radar() {
  return (
    <div className="fui-radar-container">
      <svg className="fui-radar" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" className="radar-ring" />
        <circle cx="50" cy="50" r="32" className="radar-ring" />
        <circle cx="50" cy="50" r="16" className="radar-ring" />
        <line x1="50" y1="2" x2="50" y2="98" className="radar-axis" />
        <line x1="2" y1="50" x2="98" y2="50" className="radar-axis" />
        <path d="M50,50 L50,2 A48,48 0 0,1 98,50 Z" className="radar-sweep" />
      </svg>
      <div className="radar-metrics">
        <span>LAT: 51° 30' N</span>
        <span>SCAN: 360°</span>
        <span className="fui-red">ROTATION ACTIVE</span>
      </div>
    </div>
  );
}

export function AudioWaveform({ active }: { active: boolean }) {
  return (
    <div className={`fui-waveform ${active ? 'active' : ''}`}>
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="fui-bar" style={{ animationDelay: `${i * 0.05}s` }} />
      ))}
    </div>
  );
}

export function BracketWrap({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="fui-bracket-wrap">
      {title && <div className="fui-bracket-title">{"// "}{title}</div>}
      <Crosshairs />
      <div className="fui-bracket-content">
        {children}
      </div>
    </div>
  );
}
