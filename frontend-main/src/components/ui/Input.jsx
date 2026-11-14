import { useId } from "react";

export default function Input({
  label,
  hint,
  error,
  textarea = false,
  id,
  className = "",
  rows = 4,
  ...rest
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const describedBy = error || hint ? `${inputId}-note` : undefined;

  const Control = textarea ? "textarea" : "input";

  return (
    <div className={`field ${className}`.trim()}>
      {label ? (
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <Control
        id={inputId}
        className={textarea ? "input input-textarea" : "input"}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        rows={textarea ? rows : undefined}
        {...rest}
      />
      {error ? (
        <p className="field-note field-error" id={describedBy} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field-note" id={describedBy}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Textarea(props) {
  return <Input textarea {...props} />;
}
