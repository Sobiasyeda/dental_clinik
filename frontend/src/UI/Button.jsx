import React from "react";
function Button({ children, className, onClick, type }) {
  return (
    <button type={type} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export default Button;
