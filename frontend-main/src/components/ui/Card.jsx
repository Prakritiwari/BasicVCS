export default function Card({ as: Component = "div", interactive = false, className = "", children, ...rest }) {
  return (
    <Component className={`card${interactive ? " card-interactive" : ""} ${className}`.trim()} {...rest}>
      {children}
    </Component>
  );
}
