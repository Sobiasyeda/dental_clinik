import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { useState } from "react";
import Input from "./Input.jsx";

function InputPassword({
  type,
  id,
  name,
  onChange,
  value,
  minlength,
  required,
  className,
  autocomplete,
}) {
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);

  function handleOnClick() {
    setPasswordIsVisible((prevState) => !prevState);
  }

  return (
    <div className="passwordContainer">
      <Input
        minLength={minlength}
        onChange={onChange}
        type={
          type === "password" ? (passwordIsVisible ? "text" : "password") : type
        }
        id={id}
        name={name}
        value={value}
        className={className}
        required={required}
        autoComplete={autocomplete}
      />
      <FontAwesomeIcon
        icon={passwordIsVisible ? faEye : faEyeSlash}
        onClick={handleOnClick}
        className="eye"
      />
    </div>
  );
}

export default InputPassword;
