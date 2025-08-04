export default function CSSTestPage() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-4xl font-bold text-foreground">CSS Variables Test</h1>
      
      {/* Background Test */}
      <div className="bg-background p-4 border border-border rounded">
        <p className="text-foreground">Background: {typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--background') : 'Loading...'}</p>
      </div>

      {/* Primary Color Test */}
      <div className="bg-primary text-primary-foreground p-4 rounded">
        <p>Primary Color: {typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--primary') : 'Loading...'}</p>
      </div>

      {/* Card Test */}
      <div className="bg-card text-card-foreground p-4 border border-border rounded shadow">
        <p>Card Background</p>
        <p className="text-muted-foreground">Muted text</p>
      </div>

      {/* Force Browser to Show CSS Values */}
      <div className="space-y-2 text-sm font-mono">
        <h3 className="font-bold">Computed CSS Variables:</h3>
        <div className="bg-muted p-3 rounded">
          <div>--background: <span id="bg-value">Loading...</span></div>
          <div>--primary: <span id="primary-value">Loading...</span></div>
          <div>--foreground: <span id="fg-value">Loading...</span></div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              const root = getComputedStyle(document.documentElement);
              document.getElementById('bg-value').textContent = root.getPropertyValue('--background');
              document.getElementById('primary-value').textContent = root.getPropertyValue('--primary');
              document.getElementById('fg-value').textContent = root.getPropertyValue('--foreground');
            }, 100);
          }
        `
      }} />
    </div>
  );
}
