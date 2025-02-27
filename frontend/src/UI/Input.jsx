import React from "react";
function Input({
  type,
  id,
  name,
  onChange,
  value,
  onBlur,
  required,
  placeholder,
  readonly,
  checked,
  autocomplete,
  className,
  hidden,
  autocapitalize,
  maxLength,
  minLength,
  pattern,
}) {
  return (
    <>
      <input
        autoComplete={autocomplete}
        minLength={minLength}
        maxLength={maxLength}
        onChange={onChange}
        onBlur={onBlur}
        type={type}
        id={id}
        name={name}
        value={value}
        className={className}
        required={required}
        placeholder={placeholder}
        readOnly={readonly}
        checked={checked}
        hidden={hidden}
        autoCapitalize={autocapitalize}
        pattern={pattern}
      />
    </>
  );
}

export default Input;
