import React from "react";
export default function Label({ label, className, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} className={className}>
        {label}
      </label>
    </div>
  );
}
