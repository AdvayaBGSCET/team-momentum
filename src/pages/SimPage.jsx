import PollutionSimulator from '../components/PollutionSimulator';

export default function SimPage({ liveData, lang }) {
  return (
    <div style={{ padding: 16, height: '100%' }}>
      <PollutionSimulator liveData={liveData} lang={lang} />
    </div>
  );
}
