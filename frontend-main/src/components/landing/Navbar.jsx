import { Link } from "react-router-dom";
import Logo from "../ui/Logo";

const links = [
  { href: "#why", label: "Why" },
  { href: "#commands", label: "Commands" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  return (
    <header className="site-nav">
      <div className="site-nav-inner container">
        <Link to="/" className="site-nav-brand" aria-label="BasicVCS home">
          <Logo />
        </Link>

        <nav className="site-nav-links" aria-label="Landing sections">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="site-nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-nav-actions">
          <Link to="/auth" className="site-nav-signin">
            Sign in
          </Link>
          <Link to="/signup" className="btn btn-primary btn-sm">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
