import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../authContext";
import initialsOf from "../../utils/initials";
import Icon from "../ui/Icon";
import Logo from "../ui/Logo";
import "./app-shell.css";

export default function AppShell({
  title = "Repositories",
  search,
  onSearchChange,
  searchPlaceholder = "Search repositories…",
  children,
}) {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return undefined;

    let alive = true;
    api
      .get(`/userProfile/${userId}`)
      .then(({ data }) => {
        if (alive) setUser(data);
      })
      .catch(() => {
        /* the rail falls back to a neutral avatar */
      });

    return () => {
      alive = false;
    };
  }, [userId]);

  const username = user?.username || "you";
  const initials = initialsOf(user?.username || "U");

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    navigate("/auth", { replace: true });
  }

  return (
    <div className="app">
      <a className="skip-link" href="#app-content">
        Skip to content
      </a>

      <aside className="rail">
        <Link to="/" className="rail-brand" aria-label="BasicVCS repositories">
          <Logo compact />
        </Link>

        <nav className="rail-nav" aria-label="Workspace">
          <NavLink
            to="/"
            end
            title="Repositories"
            className={({ isActive }) => `rail-link${isActive ? " is-active" : ""}`}
          >
            <Icon name="repos" size={19} />
            <span>Repos</span>
          </NavLink>

          <NavLink
            to="/profile"
            title="Profile"
            className={({ isActive }) => `rail-link${isActive ? " is-active" : ""}`}
          >
            <Icon name="user" size={19} />
            <span>Profile</span>
          </NavLink>
        </nav>

        <div className="rail-foot">
          <Link to="/profile" className="rail-user" title={username} aria-label={`Signed in as ${username}`}>
            <span className="avatar avatar-sm">{initials}</span>
          </Link>

          <button type="button" className="rail-link rail-logout" onClick={logout} title="Log out">
            <Icon name="logout" size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <span className="app-title mono">{title}</span>

          {onSearchChange ? (
            <div className="app-search">
              <Icon name="search" size={16} />
              <input
                type="search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label="Search repositories"
              />
            </div>
          ) : (
            <span className="app-search-spacer" />
          )}

          <Link to="/profile" className="app-user">
            <span className="avatar avatar-sm">{initials}</span>
            <span className="app-username">{username}</span>
          </Link>
        </header>

        <main className="app-content" id="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}
