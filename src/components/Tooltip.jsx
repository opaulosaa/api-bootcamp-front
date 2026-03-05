import { useEffect, useRef } from 'react';

function Tooltip({ children, text, placement = 'top' }) {
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (tooltipRef.current && window.bootstrap) {
      const tooltip = new window.bootstrap.Tooltip(tooltipRef.current, {
        placement,
        trigger: 'hover focus'
      });

      return () => {
        tooltip.dispose();
      };
    }
  }, [placement]);

  return (
    <span
      ref={tooltipRef}
      data-bs-toggle="tooltip"
      data-bs-placement={placement}
      title={text}
      style={{ cursor: 'help' }}
    >
      {children}
    </span>
  );
}

export default Tooltip;
