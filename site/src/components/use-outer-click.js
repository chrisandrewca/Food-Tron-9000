import { useEffect, useRef } from 'preact/hooks';

const useOuterClick = (handleClick) => {
  const invokerRef = useRef();
  const elementRef = useRef();
  const handlerRef = useRef();

  useEffect(() => {
    handlerRef.current = handleClick;
  }, [handleClick]);

  useEffect(() => {
    const handleClick = (e) => {
      if (invokerRef.current
        && elementRef.current
        && handlerRef.current
        && !invokerRef.current.contains(e.target)
        && !elementRef.current.contains(e.target)) {
        handlerRef.current(e);
      }
    };

    // TODO group together in global place for single handler somehow
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return [invokerRef, elementRef];
};

export default useOuterClick;