import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastContext } from '../context/ToastContext.jsx';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

export default function Toast() {
  const { toasts, dismiss } = useToastContext();
  return (
    <div className="toast-stack">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info;
        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon size={16} />
              <span>{t.message}</span>
            </div>
            <button className="btn-ghost" onClick={() => dismiss(t.id)} style={{ padding: 2 }}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
