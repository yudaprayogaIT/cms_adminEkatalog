// src/lib/useClickOutside.ts
import { useEffect } from 'react';

/**
 * Accepts a ref that may point to any HTMLElement (or be null).
 * Calls handler when a click happens outside the referenced element.
 */
export default function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref?.current) return;
      if (!ref.current.contains(e.target as Node)) handler();
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [ref, handler]);
}
