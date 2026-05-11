import Modal from './Modal.jsx';

export default function ConfirmDialog({ isOpen, title = 'Are you sure?', message, confirmLabel = 'Confirm', onConfirm, onCancel, danger }) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth={420}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
        </>
      }>
      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{message}</p>
    </Modal>
  );
}
