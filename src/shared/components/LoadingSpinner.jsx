export default function LoadingSpinner({ fullPage = false }) {
  if (fullPage) {
    return <div className="spinner-fullpage"><div className="spinner" /></div>;
  }
  return <div className="spinner" />;
}
