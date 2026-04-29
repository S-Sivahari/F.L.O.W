import { useToastContext } from '../context/ToastContext.jsx';

export default function useToast() {
  const ctx = useToastContext();
  return {
    success: (m) => ctx.push(m, 'success'),
    error: (m) => ctx.push(m, 'error'),
    info: (m) => ctx.push(m, 'info'),
    warning: (m) => ctx.push(m, 'warning'),
  };
}
