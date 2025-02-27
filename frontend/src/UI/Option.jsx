import React from "react";
function OptionPage({
  children,
  selected,
  value,
  disabled,
  customerKey,
  className,
  style,
}) {
  return (
    <option
      className={className}
      key={customerKey}
      selected={selected}
      value={value}
      disabled={disabled}
      style={style}
    >
      {children}
    </option>
  );
}

export default OptionPage;
