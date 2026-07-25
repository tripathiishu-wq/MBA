import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'World Finance Atlas — GDP, population, land and debt for 187 economies',
  description:
    'A reference atlas of the world economy: output, people, territory, currency, government debt and major banks for 187 countries. Every figure carries its source, vintage and definition.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="masthead">
          <div className="masthead-inner">
            <Link href="/" className="wordmark">
              World Finance <span>Atlas</span>
            </Link>
            <nav className="nav">
              <Link href="/compare">Compare</Link>
              <Link href="/regions">Regions</Link>
              <Link href="/banks">Banks</Link>
              <Link href="/rates">Rates</Link>
              <Link href="/methodology">Method</Link>
            </nav>
            <div className="masthead-meta">187 economies · 2025–26</div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="foot">
          <div className="wrap foot-grid">
            <div>
              <h4>About</h4>
              <p className="note">
                A reference atlas of the world economy. Every figure on this site carries its
                source, vintage and definition, because a number without its qualifier is a
                number you cannot use.
              </p>
            </div>
            <div>
              <h4>Sections</h4>
              <ul>
                <li><Link href="/compare">Compare countries</Link></li>
                <li><Link href="/regions">Regional aggregates</Link></li>
                <li><Link href="/banks">Major banks</Link></li>
                <li><Link href="/methodology">Method &amp; sources</Link></li>
              </ul>
            </div>
            <div>
              <h4>Sources</h4>
              <ul>
                <li>IMF World Economic Outlook</li>
                <li>IMF Fiscal Monitor</li>
                <li>UN World Population Prospects</li>
                <li>UN Statistics Division</li>
                <li>S&amp;P Global Market Intelligence</li>
              </ul>
            </div>
          </div>
          <div className="wrap" style={{ marginTop: 26, fontSize: 12, color: 'var(--ink-3)' }}>
            PAGEUP.INC · Estimates and projections, not actuals. See{' '}
            <Link href="/methodology">method</Link> for known comparability limits.
          </div>
        </footer>
      </body>
    </html>
  );
}
