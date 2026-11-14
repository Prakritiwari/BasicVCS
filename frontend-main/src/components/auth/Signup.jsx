import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import api from "../../api";
import { useAuth } from "../../authContext";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import Input from "../ui/Input";
import Logo from "../ui/Logo";
import "./auth.css";

export default function Signup() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const reducedMotion = useReducedMotion();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/signup", { username, email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      setCurrentUser(data.userId);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not create your account. Try a different username."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <main className="auth-main">
        <Link to="/" className="auth-brand" aria-label="BasicVCS home">
          <Logo />
        </Link>

        <motion.section
          className="auth-card"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">create account</span>
          <h1>Start your history.</h1>
          <p className="auth-sub">One account for repositories, issues and sync.</p>

          <form className="auth-form" onSubmit={onSubmit}>
            <Input
              label="Username"
              type="text"
              name="username"
              autoComplete="username"
              placeholder="your-name"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error ? (
              <p className="auth-error" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" block size="lg" loading={loading}>
              {loading ? "Creating account" : "Create account"}
            </Button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/auth">Sign in</Link>
            <Icon name="arrow" size={13} />
          </p>
        </motion.section>

        <p className="auth-foot mono">basicvcs / your bucket, your rules</p>
      </main>
    </div>
  );
}
