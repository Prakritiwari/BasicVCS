import { Link } from "react-router-dom";
import Logo from "../ui/Logo";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo size="lg" />
            <p>
              A small version control tool. Built from scratch, stored in your own
              bucket.
            </p>
          </div>

          <nav className="footer-links" aria-label="Footer">
            <div>
              <span className="mono footer-label">Explore</span>
              <a href="#why">Why</a>
              <a href="#commands">Commands</a>
              <a href="#roadmap">Roadmap</a>
              <a href="#faq">FAQ</a>
            </div>
            <div>
              <span className="mono footer-label">Account</span>
              <Link to="/auth">Sign in</Link>
              <Link to="/signup">Create account</Link>
            </div>
          </nav>
        </div>

        <div className="footer-wordmark" aria-hidden="true">
          BasicVCS
        </div>

        <div className="footer-bottom mono">
          <span>React · Express · MongoDB · S3</span>
          <span>© 2026 BasicVCS</span>
        </div>
      </div>
    </footer>
  );
}
