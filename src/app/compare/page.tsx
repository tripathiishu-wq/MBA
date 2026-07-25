import { getCountries } from '@/lib/data';
import CompareTable from './CompareTable';

export const revalidate = 3600;
export const metadata = {
  title: 'Compare economies — World Finance Atlas',
  description: 'Rank and filter 187 economies by output, population, land area, government debt, density and output per km².',
};

export default async function ComparePage({
  searchParams,
}: { searchParams: { metric?: string } }) {
  const rows = await getCountries();
  return (
    <div className="wrap" style={{ paddingTop: 40, paddingBottom: 20 }}>
      <div className="eyebrow">Comparison engine</div>
      <h1 style={{ fontFamily: 'var(--display)', fontSize: 38, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 12px' }}>
        Rank the world by one measure at a time
      </h1>
      <p style={{ color: 'var(--ink-2)', maxWidth: '64ch', marginTop: 0 }}>
        Each measure produces a different world. Switch between them and watch the order change —
        that movement is the point, not a flaw in the data.
      </p>
      <CompareTable rows={rows} initialMetric={searchParams.metric} />
    </div>
  );
}
