export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  loading = false,
  iconLeft,
  iconRight,
  block = false,
  className = "",
  children,
  ...rest
}) {
  const classes = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    block ? "btn-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...rest}>
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : iconLeft}
      <span className="btn-label">{children}</span>
      {!loading && iconRight ? iconRight : null}
    </Component>
  );
}
