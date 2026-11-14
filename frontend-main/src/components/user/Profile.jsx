import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import AppShell from "../layout/AppShell";
import RepoCard from "../repo/RepoCard";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import Icon from "../ui/Icon";
import { SkeletonCard } from "../ui/Skeleton";
import initialsOf from "../../utils/initials";
import HeatMapProfile from "./HeatMap";
import "./profile.css";

export default function Profile() {
  const userId = localStorage.getItem("userId");
  const [user, setUser] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const [profile, repos] = await Promise.allSettled([
      api.get(`/userProfile/${userId}`),
      api.get(`/repo/user/${userId}`),
    ]);

    if (profile.status === "fulfilled") {
      setUser(profile.value.data);
    } else {
      setError("Could not load your profile. Check the backend and try again.");
    }

    if (repos.status === "fulfilled") {
      setRepositories(repos.value.data?.repositories ?? []);
    } else if (repos.reason?.response?.status === 404) {
      setRepositories([]);
    } else {
      setRepositories([]);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const username = user?.username || (loading ? "Loading…" : "you");
  const initials = initialsOf(user?.username || "U");
  const starred = user?.starRepos?.length ?? 0;
  const following = user?.followedUsers?.length ?? 0;

  return (
    <AppShell title="Profile">
      {error ? (
        <div className="dash-alert" role="alert">
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={load}>
            Retry
          </Button>
        </div>
      ) : null}

      <section className="profile-head">
        <div className="profile-avatar" aria-hidden="true">
          {initials}
        </div>

        <div className="profile-identity">
          <span className="eyebrow">profile</span>
          <h1>{username}</h1>
          <p className="profile-email">
            <Icon name="user" size={14} />
            {user?.email || "No email on file"}
          </p>
        </div>

        <div className="profile-head-actions">
          <Button as={Link} to="/" variant="secondary" size="sm">
            All repositories
          </Button>
        </div>
      </section>

      <div className="profile-layout">
        <aside className="profile-side">
          <section className="profile-stat-card">
            <h2 className="mono">At a glance</h2>
            <dl className="profile-stats">
              <div>
                <dt>Repositories</dt>
                <dd>{loading ? "—" : repositories.length}</dd>
              </div>
              <div>
                <dt>Starred</dt>
                <dd>{loading ? "—" : starred}</dd>
              </div>
              <div>
                <dt>Following</dt>
                <dd>{loading ? "—" : following}</dd>
              </div>
            </dl>
          </section>

          <section className="profile-side-card">
            <h2 className="mono">Account</h2>
            <dl className="profile-facts">
              <div>
                <dt>Username</dt>
                <dd>{user?.username || "—"}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user?.email || "—"}</dd>
              </div>
              <div>
                <dt>User ID</dt>
                <dd className="mono">{userId}</dd>
              </div>
            </dl>
            <p className="profile-note">
              Your data lives in your MongoDB and your S3 bucket. Nothing is shared
              unless a repository is public.
            </p>
          </section>
        </aside>

        <div className="profile-main">
          <section className="profile-panel">
            <div className="profile-panel-head">
              <div>
                <h2>Contribution activity</h2>
                <p>Commits and edits over the last year.</p>
              </div>
              <span className="badge-mono mono">last 12 months</span>
            </div>
            <HeatMapProfile />
            <p className="profile-heat-note mono">
              Illustrative — the commit-activity endpoint is not wired up yet.
            </p>
          </section>

          <section className="profile-panel">
            <div className="profile-panel-head">
              <div>
                <h2>Repositories</h2>
                <p>Projects connected to this account.</p>
              </div>
              <span className="badge-mono mono">
                {loading ? "—" : repositories.length}
              </span>
            </div>

            {loading ? (
              <div className="repo-grid" aria-hidden="true">
                {[0, 1].map((key) => (
                  <SkeletonCard key={key} />
                ))}
              </div>
            ) : repositories.length ? (
              <div className="repo-grid">
                {repositories.map((repo, index) => (
                  <RepoCard key={repo._id} repo={repo} index={index} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="repos"
                title="No repositories yet"
                description="Make your first repository and push a commit to see it here."
                action={
                  <Button as={Link} to="/" size="sm">
                    Go to repositories
                  </Button>
                }
              />
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
