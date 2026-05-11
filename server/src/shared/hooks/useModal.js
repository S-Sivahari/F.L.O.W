import { useState, useCallback } from 'react';

export default function useModal(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  const [data, setData] = useState(null);

  const open = useCallback((payload = null) => {
    setData(payload);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  return { isOpen, data, open, close };
}
