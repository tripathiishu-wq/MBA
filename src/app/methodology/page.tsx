import { INDICATORS } from '@/lib/data';

export const metadata = {
  title: 'Method & sources — World Finance Atlas',
  description: 'Definitions, sources, vintages and known comparability limits for every figure on the site.',
};

export default function MethodPage() {
  return (
    <div className="wrap-narrow" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div className="eyebrow">Method</div>
      <h1 style={{ fontFamily: 'var(--display)', fontSize: 38, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 12px' }}>
        What these numbers are, and what they are not
      </h1>
      <p style={{ color: 'var(--ink-2)', fontSize: 16 }}>
        Every figure here is an estimate published by an international statistical body. None is a
        measurement. The difference matters more in public finance than almost anywhere else, and
        this page is where the qualifications live.
      </p>

      <div className="section">
        <h2 style={{ fontFamily: 'var(--display)', fontSize: 25, fontWeight: 500 }}>Coverage</h2>
        <p>
          187 economies, covering approximately 99% of world output and world population. The list
          follows IMF World Economic Outlook coverage. Territories with separate statistical
          reporting — Hong Kong, Macao, Puerto Rico, Taiwan, Kosovo, Palestine — appear as
          separate rows because their data is published separately, not as a statement about
          political status.
        </p>
      </div>

      <div className="section">
        <h2 style={{ fontFamily: 'var(--display)', fontSize: 25, fontWeight: 500 }}>Indicators</h2>
        {Object.entries(INDICATORS).map(([k, v]) => (
          <div className="panel" key={k}>
            <h3>{v.name} · {v.unit}</h3>
            <p style={{ marginTop: 0 }}>{v.definition}</p>
            {v.caveat && (
              <div className="caveat">
                <b>Comparability</b>
                {v.caveat}
              </div>
            )}
            <dl style={{ margin: '14px 0 0' }}>
              <div className="pair"><dt>Source</dt><dd style={{ fontSize: 12 }}>{v.source}</dd></div>
              <div className="pair"><dt>Vintage</dt><dd style={{ fontSize: 12 }}>{v.vintage}</dd></div>
            </dl>
          </div>
        ))}
      </div>

      <div className="section">
        <h2 style={{ fontFamily: 'var(--display)', fontSize: 25, fontWeight: 500 }}>Known limits</h2>
        <div className="panel">
          <dl style={{ margin: 0 }}>
            <div className="pair" style={{ alignItems: 'flex-start' }}>
              <dt style={{ flex: '0 0 34%' }}><b>Estimates, not actuals</b></dt>
              <dd style={{ textAlign: 'left', fontFamily: 'var(--body)', fontWeight: 400, fontSize: 13 }}>
                2025–26 figures are projections. Revisions of 1–3% on GDP are normal.
              </dd>
            </div>
            <div className="pair" style={{ alignItems: 'flex-start' }}>
              <dt style={{ flex: '0 0 34%' }}><b>Low-confidence economies</b></dt>
              <dd style={{ textAlign: 'left', fontFamily: 'var(--body)', fontWeight: 400, fontSize: 13 }}>
                Venezuela, Syria, North Korea, Afghanistan, Libya and Somalia carry wide uncertainty
                bands. Treat them as indicative.
              </dd>
            </div>
            <div className="pair" style={{ alignItems: 'flex-start' }}>
              <dt style={{ flex: '0 0 34%' }}><b>Exchange rate sensitivity</b></dt>
              <dd style={{ textAlign: 'left', fontFamily: 'var(--body)', fontWeight: 400, fontSize: 13 }}>
                Nominal GDP in dollars moves with the dollar. Cross-year comparisons partly measure
                currency movement rather than real output.
              </dd>
            </div>
            <div className="pair" style={{ alignItems: 'flex-start' }}>
              <dt style={{ flex: '0 0 34%' }}><b>Ireland and Luxembourg</b></dt>
              <dd style={{ textAlign: 'left', fontFamily: 'var(--body)', fontWeight: 400, fontSize: 13 }}>
                GDP per capita is inflated by multinational profit booking and does not reflect
                domestic living standards.
              </dd>
            </div>
            <div className="pair" style={{ alignItems: 'flex-start' }}>
              <dt style={{ flex: '0 0 34%' }}><b>Missing debt figures</b></dt>
              <dd style={{ textAlign: 'left', fontFamily: 'var(--body)', fontWeight: 400, fontSize: 13 }}>
                Nine economies publish no comparable general government debt figure. They are shown
                as absent, never as zero.
              </dd>
            </div>
            <div className="pair" style={{ alignItems: 'flex-start' }}>
              <dt style={{ flex: '0 0 34%' }}><b>Bank coverage</b></dt>
              <dd style={{ textAlign: 'left', fontFamily: 'var(--body)', fontWeight: 400, fontSize: 13 }}>
                Not exhaustive. Large markets list many institutions; small markets may list one.
                Absence from the list is not evidence a country lacks a banking sector.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="section">
        <h2 style={{ fontFamily: 'var(--display)', fontSize: 25, fontWeight: 500 }}>What this site does not do</h2>
        <p>
          It does not forecast, rate creditworthiness, or offer investment guidance. It reports
          published estimates and explains what they mean. A ranking here is a description of the
          data, not an assessment of a country.
        </p>
      </div>
    </div>
  );
}
