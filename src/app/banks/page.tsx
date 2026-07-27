import Link from 'next/link';
import { getCountries, getBanks, fmtUsdBn, fmtPct, INDICATORS } from '@/lib/data';
import { bankSlug } from '@/lib/data';
import { flagUrl, flagAlt } from '@/lib/flags';

export const revalidate = 3600;
export const metadata = {
  title: 'Major banks — World Finance Atlas',
  description: 'The largest banks in the world by total assets, mapped to the economies that host them.',
};

export default async function BanksPage() {
  const banks = await getBanks();
  const countries = await getCountries();
  const byIso = new Map(countries.map((c) => [c.iso3, c]));
  const total = banks.reduce((s, b) => s + b.assets_usd_bn, 0);
  const worldGdp = countries.reduce((s, c) => s + c.gdp_usd_bn, 0);

  const perCountry = new Map<string, number>();
  banks.forEach((b) => perCountry.set(b.iso3, (perCountry.get(b.iso3) ?? 0) + b.assets_usd_bn));
  const hosts = [...perCountry.entries()]
    .map(([iso3, assets]) => ({ iso3, assets, c: byIso.get(iso3)! }))
    .filter((x) => x.c)
    .sort((a, b) => b.assets - a.assets)
    .slice(0, 12);

  const top = banks;
  const I = INDICATORS.BANK_ASSETS;

  return (
    <div className="wrap" style={{ paddingTop: 40 }}>
      <div className="eyebrow">Banking</div>
      <h1 style={{ fontFamily: 'var(--display)', fontSize: 38, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 12px' }}>
        Where the balance sheets are
      </h1>
      <p style={{ color: 'var(--ink-2)', maxWidth: '64ch' }}>
        {banks.length} institutions across {perCountry.size} economies, holding{' '}
        {fmtUsdBn(total)} in assets — a figure of the same order as world output itself.
      </p>

      <div className="caveat" style={{ marginTop: 20, marginBottom: 30 }}>
        <b>Assets, not market value</b>
        {I.caveat} {I.source}, {I.vintage}.
      </div>

      <div className="section-head"><div><h2>Largest banking systems</h2>
        <p>Combined assets of the institutions in this dataset, by host economy.</p></div></div>
      <table className="ledger" style={{ marginBottom: 40 }}>
        <thead>
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th>Economy</th>
            <th style={{ textAlign: 'right' }}>Bank assets</th>
            <th style={{ textAlign: 'right' }} className="hide-sm">National GDP</th>
            <th style={{ textAlign: 'right' }}>Assets ÷ GDP</th>
          </tr>
        </thead>
        <tbody>
          {hosts.map((h, i) => (
            <tr key={h.iso3}>
              <td className="rank">{i + 1}</td>
              <td className="cname"><Link href={`/country/${h.c.slug}`}>{<img src={flagUrl(h.c.iso3, 40)} alt={flagAlt(h.c.name)} width={16} height={12} loading="lazy" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6, borderRadius: 2, boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }} />}{h.c.name}</Link></td>
              <td className="num">{fmtUsdBn(h.assets)}</td>
              <td className="num hide-sm">{fmtUsdBn(h.c.gdp_usd_bn)}</td>
              <td className="num">{fmtPct((h.assets / h.c.gdp_usd_bn) * 100, 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="section-head"><div><h2>Largest institutions</h2>
        <p>By total assets. Chinese state banks lead on assets; US banks lead on market value.</p></div></div>
      <table className="ledger">
        <thead>
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th>Institution</th>
            <th className="hide-sm">Headquarters</th>
            <th>Economy</th>
            <th style={{ textAlign: 'right' }}>Total assets</th>
            <th style={{ textAlign: 'right' }} className="hide-sm">% world GDP</th>
          </tr>
        </thead>
        <tbody>
          {top.map((b, i) => {
            const c = byIso.get(b.iso3);
            return (
              <tr key={b.name}>
                <td className="rank">{i + 1}</td>
                <td className="cname">
                  <Link href={`/bank/${bankSlug(b.name)}`}>{b.name}</Link>
                  {b.ceo_name && (
                    <div style={{ fontSize: 11, fontWeight: 400, color: '#000', marginTop: 1 }}>{b.ceo_name}</div>
                  )}
                </td>
                <td className="hide-sm" style={{ color: 'var(--ink-2)', fontSize: 13 }}>{b.hq_city ?? '—'}</td>
                <td style={{ fontSize: 13 }}>
                  {c ? <Link href={`/country/${c.slug}`}>{c.name}</Link> : b.iso3}
                </td>
                <td className="num">{fmtUsdBn(b.assets_usd_bn)}</td>
                <td className="num hide-sm">{fmtPct((b.assets_usd_bn / worldGdp) * 100, 2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 16 }}>
        All {banks.length} institutions in this dataset, ranked by total assets. Each country page
        lists the ones headquartered there.
      </p>
    </div>
  );
}
