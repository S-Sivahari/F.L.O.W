import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth,
  className = "",
}) {
  if (!isOpen) return null;
  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal ${className}`.trim()}
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
