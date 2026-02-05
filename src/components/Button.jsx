import React from 'react';

const variantClass = {
  primary: 'btn btn-primary',
  outline: 'btn btn-outline',
};

export const Button = ({ children, variant = 'primary', icon: Icon, ...rest }) => {
  return (
    <button className={variantClass[variant]} {...rest}>
      {Icon && <Icon size={16} />}
      <span>{children}</span>
    </button>
  );
};

export default Button;

