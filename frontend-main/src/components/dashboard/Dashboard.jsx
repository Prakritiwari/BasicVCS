import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import AppShell from "../layout/AppShell";
import CreateRepoModal from "../repo/CreateRepoModal";
import RepoCard from "../repo/RepoCard";
import CopyButton from "../ui/CopyButton";
import EmptyState from "../ui/EmptyState";
import Icon from "../ui/Icon";
import Button from "../ui/Button";
import { SkeletonCard } from "../ui/Skeleton";
import { commands } from "../landing/data";
import { formatShortDate, pluralize, repoDate } from "../../utils/format";
import "./dashboard.css";

export default function Dashboard() {
  const [repositories, setRepositories] = useState([]);
  const [allRepositories, setAllRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const userId = localStorage.getItem("userId");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const [mine, all] = await Promise.allSettled([
      api.get(`/repo/user/${userId}`),
      api.get("/repo/all"),
    ]);

    if (mine.status === "fulfilled") {
      setRepositories(mine.value.data?.repositories ?? []);
    } else if (mine.reason?.response?.status === 404) {
      setRepositories([]);
    } else {
      setError("Could not load your repositories. Check the backend and try again.");
    }

    if (all.status === "fulfilled") {
      setAllRepositories(Array.isArray(all.value.data) ? all.value.data : []);
    } else {
      setAllRepositories([]);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return repositories;

    return repositories.filter((repo) => {
      return (
        repo.name?.toLowerCase().includes(needle) ||
        repo.description?.toLowerCase().includes(needle)
      );
    });
  }, [repositories, query]);

  const explore = useMemo(() => {
    return allRepositories
      .filter((repo) => {
        const ownerId = repo.owner?._id ?? repo.owner;
        return String(ownerId) !== String(userId) && Boolean(repo.visibility);
      })
      .sort((a, b) => (repoDate(b)?.getTime() || 0) - (repoDate(a)?.getTime() || 0))
      .slice(0, 6);
  }, [allRepositories, userId]);

  return (
    <AppShell
      title="Repositories"
      search={query}
      onSearchChange={setQuery}
      searchPlaceholder="Search your repositories…"
    >
      <section className="dash-head">
        <div>
          <span className="eyebrow">workspace</span>
          <h1>Your repositories.</h1>
          <p>
            {loading
              ? "Loading your workspace…"
              : `${pluralize(repositories.length, "repository", "repositories")} in this account.`}
          </p>
        </div>

        <Button onClick={() => setModalOpen(true)} iconLeft={<Icon name="plus" size={15} />}>
          New repository
        </Button>
      </section>

      {error ? (
        <div className="dash-alert" role="alert">
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={load}>
            Retry
          </Button>
        </div>
      ) : null}

      <div className="dash-layout">
        <section className="dash-main" aria-label="Your repositories">
          <div className="dash-section-head">
            <h2>All repositories</h2>
            <span className="mono">{loading ? "—" : filtered.length}</span>
          </div>

          {loading ? (
            <div className="repo-grid" aria-hidden="true">
              {[0, 1, 2, 3].map((key) => (
                <SkeletonCard key={key} />
              ))}
            </div>
          ) : filtered.length ? (
            <div className="repo-grid">
              {filtered.map((repo, index) => (
                <RepoCard key={repo._id} repo={repo} index={index} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={query ? "search" : "repos"}
              title={query ? "Nothing matches that search." : "No repositories yet."}
              description={
                query
                  ? "Try a different name, or clear the search field in the top bar."
                  : "Create your first repository, then run init → add → commit in the terminal."
              }
              action={
                query ? null : (
                  <Button onClick={() => setModalOpen(true)} iconLeft={<Icon name="plus" size={15} />}>
                    New repository
                  </Button>
                )
              }
            />
          )}
        </section>

        <aside className="dash-side">
          <section className="side-panel" aria-label="Explore public repositories">
            <div className="side-head">
              <h2>Explore</h2>
              <span className="mono">{loading ? "—" : explore.length}</span>
            </div>

            {loading ? (
              <div className="side-skeletons" aria-hidden="true">
                <span className="skeleton side-skeleton" />
                <span className="skeleton side-skeleton" />
                <span className="skeleton side-skeleton" />
              </div>
            ) : explore.length ? (
              <ul className="explore-list">
                {explore.map((repo) => (
                  <li key={repo._id}>
                    <Link to={`/repo/${repo._id}`} className="explore-item">
                      <span className="explore-glyph" aria-hidden="true">
                        <Icon name="repos" size={16} />
                      </span>
                      <span className="explore-body">
                        <strong>{repo.name}</strong>
                        <span className="mono">
                          @{repo.owner?.username || "unknown"} ·{" "}
                          {repoDate(repo) ? formatShortDate(repoDate(repo)) : "no date"}
                        </span>
                      </span>
                      <Icon name="arrow" size={13} className="explore-arrow" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="side-empty">
                No public repositories from other accounts yet. Yours can be the
                first.
              </p>
            )}
          </section>

          <section className="side-panel quickstart" aria-label="Quick start commands">
            <div className="side-head">
              <h2>Quick start</h2>
              <span className="mono">CLI</span>
            </div>
            <p className="side-copy">Six commands, run in your project folder.</p>

            <ul className="quickstart-list">
              {commands.map((command) => (
                <li key={command.id}>
                  <span className="mono quickstart-number">{command.number}</span>
                  <code className="mono">{command.command}</code>
                  <CopyButton text={command.command} compact />
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <CreateRepoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={load}
      />
    </AppShell>
  );
}
