import React from 'react';

export const Card = ({ title, action, children, footer }) => {
  return (
    <div className="card">
      {(title || action) && (
        <div className="card-header">
          {title && <div className="card-title">{title}</div>}
          {action}
        </div>
      )}
      <div>{children}</div>
      {footer && <div style={{ marginTop: '0.75rem' }}>{footer}</div>}
    </div>
  );
};

export default Card;

