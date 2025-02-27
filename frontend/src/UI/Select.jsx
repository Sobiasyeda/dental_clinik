import React from "react";
function SelectPage({
  children,
  name,
  id,
  defaultValue,
  className,
  onChange,
  value,
  multiple,
  required,
}) {
  return (
    <select
      value={value}
      multiple={multiple}
      onChange={onChange}
      className={className}
      name={name}
      id={id}
      defaultValue={defaultValue}
      required={required}
    >
      {children}
    </select>
  );
}

export default SelectPage;
