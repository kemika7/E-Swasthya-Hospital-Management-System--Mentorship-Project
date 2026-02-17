import React from 'react';
import logo from '../assets/images/logo.png';

const BrandingHeader = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <img src={logo} alt="E-SWASTHYA Logo" style={{ height: 40, width: 'auto' }} />
      <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--white)' }}>E-SWASTHYA</span>
    </div>
  );
};

export default React.memo(BrandingHeader);
