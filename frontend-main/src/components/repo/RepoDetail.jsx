import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import AppShell from "../layout/AppShell";
import Button from "../ui/Button";
import Chip, { StatusChip } from "../ui/Chip";
import CopyButton from "../ui/CopyButton";
import EmptyState from "../ui/EmptyState";
import Icon from "../ui/Icon";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { Skeleton } from "../ui/Skeleton";
import Tabs from "../ui/Tabs";
import TerminalMock from "../ui/TerminalMock";
import { useToast } from "../ui/Toast";
import { commands } from "../landing/data";
import { formatDate, pluralize, repoDate, shortHash } from "../../utils/format";
import "./repo.css";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "history", label: "History" },
  { id: "issues", label: "Issues" },
  { id: "commands", label: "Commands" },
];

export default function RepoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");

  const [commits, setCommits] = useState([]);
  const [commitsLoading, setCommitsLoading] = useState(true);
  const [commitsError, setCommitsError] = useState("");

  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [issuesError, setIssuesError] = useState("");
  const [issueFilter, setIssueFilter] = useState("all");

  const [toggling, setToggling] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [issueModal, setIssueModal] = useState({ open: false, issue: null });
  const [issueForm, setIssueForm] = useState({
    title: "",
    description: "",
    status: "open",
  });
  const [issueFormError, setIssueFormError] = useState("");
  const [savingIssue, setSavingIssue] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);

  const loadRepo = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(`/repo/${id}`);
      const found = Array.isArray(data) ? data[0] : data;
      if (!found) {
        setError("This repository does not exist, or it was deleted.");
        setRepo(null);
      } else {
        setRepo(found);
        setEditDescription(found.description || "");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Could not load this repository. Try again."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadCommits = useCallback(async () => {
    setCommitsLoading(true);
    setCommitsError("");

    try {
      const { data } = await api.get(`/repo/${id}/commits`);
      setCommits(Array.isArray(data?.commits) ? data.commits : []);
    } catch (err) {
      setCommitsError(
        err.response?.data?.error || "Could not read commits from S3."
      );
      setCommits([]);
    } finally {
      setCommitsLoading(false);
    }
  }, [id]);

  const loadIssues = useCallback(async () => {
    setIssuesLoading(true);
    setIssuesError("");

    try {
      const { data } = await api.get(`/issue/all?repository=${id}`);
      const list = Array.isArray(data) ? data : [];
      const forRepo = list.filter((issue) => {
        const repositoryId = issue.repository?._id ?? issue.repository;
        return String(repositoryId) === String(id);
      });
      setIssues(forRepo);
    } catch (err) {
      setIssuesError(
        err.response?.data?.error || "Could not load issues for this repository."
      );
      setIssues([]);
    } finally {
      setIssuesLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRepo();
    loadCommits();
    loadIssues();
  }, [loadRepo, loadCommits, loadIssues]);

  useEffect(() => {
    if (!repo) return;
    document.title = `${repo.name} — BasicVCS`;
    return () => {
      document.title = "BasicVCS — version control, built from scratch";
    };
  }, [repo]);

  const filteredIssues = useMemo(() => {
    const sorted = [...issues].sort((a, b) => String(b._id).localeCompare(String(a._id)));
    if (issueFilter === "all") return sorted;
    return sorted.filter((issue) => (issue.status || "open") === issueFilter);
  }, [issues, issueFilter]);

  const openCount = issues.filter((issue) => (issue.status || "open") === "open").length;
  const closedCount = issues.filter((issue) => issue.status === "closed").length;

  async function toggleVisibility() {
    if (!repo || toggling) return;
    setToggling(true);

    try {
      const { data } = await api.patch(`/repo/toggle/${repo._id}`);
      const next = data?.repository?.visibility ?? !repo.visibility;
      setRepo((current) => ({ ...current, visibility: next }));
      toast({
        title: next ? "Repository is public" : "Repository is private",
        tone: "success",
      });
    } catch (err) {
      toast({
        title: "Could not change visibility",
        description: err.response?.data?.error || "Try again.",
        tone: "error",
      });
    } finally {
      setToggling(false);
    }
  }

  async function saveDescription(event) {
    event.preventDefault();
    if (!repo) return;

    setEditError("");
    setSavingEdit(true);

    try {
      const { data } = await api.put(`/repo/update/${repo._id}`, {
        description: editDescription.trim(),
      });
      const updated = data?.repository;
      setRepo((current) => ({
        ...current,
        description: updated?.description ?? editDescription.trim(),
      }));
      setEditOpen(false);
      toast({ title: "Repository updated", tone: "success" });
    } catch (err) {
      setEditError(
        err.response?.data?.error || "Could not update the repository. Try again."
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteRepository() {
    if (!repo) return;
    setDeleting(true);

    try {
      await api.delete(`/repo/delete/${repo._id}`);
      toast({ title: "Repository deleted", description: repo.name, tone: "success" });
      navigate("/", { replace: true });
    } catch (err) {
      toast({
        title: "Could not delete the repository",
        description: err.response?.data?.error || "Try again.",
        tone: "error",
      });
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  function openCreateIssue() {
    setIssueForm({ title: "", description: "", status: "open" });
    setIssueFormError("");
    setIssueModal({ open: true, issue: null });
  }

  function openEditIssue(issue) {
    setIssueForm({
      title: issue.title || "",
      description: issue.description || "",
      status: issue.status || "open",
    });
    setIssueFormError("");
    setIssueModal({ open: true, issue });
  }

  async function saveIssue(event) {
    event.preventDefault();

    const title = issueForm.title.trim();
    if (!title) {
      setIssueFormError("An issue needs a title.");
      return;
    }

    setIssueFormError("");
    setSavingIssue(true);

    try {
      if (issueModal.issue) {
        await api.put(`/issue/update/${issueModal.issue._id}`, {
          title,
          description: issueForm.description.trim(),
          status: issueForm.status,
        });
        toast({ title: "Issue updated", tone: "success" });
      } else {
        await api.post("/issue/create", {
          title,
          description: issueForm.description.trim(),
          repository: id,
        });
        toast({ title: "Issue created", tone: "success" });
      }

      setIssueModal({ open: false, issue: null });
      loadIssues();
    } catch (err) {
      setIssueFormError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "The backend could not save this issue. Try again."
      );
    } finally {
      setSavingIssue(false);
    }
  }

  async function deleteIssue() {
    if (!issueToDelete) return;

    try {
      await api.delete(`/issue/delete/${issueToDelete._id}`);
      toast({ title: "Issue deleted", tone: "success" });
      setIssueToDelete(null);
      loadIssues();
    } catch (err) {
      toast({
        title: "Could not delete the issue",
        description: err.response?.data?.error || "Try again.",
        tone: "error",
      });
    }
  }

  if (loading) {
    return (
      <AppShell title="Repository">
        <div className="repo-loading">
          <Skeleton width="180px" height={12} />
          <Skeleton width="52%" height={44} />
          <Skeleton width="36%" height={14} />
          <Skeleton width="100%" height={320} radius={20} />
        </div>
      </AppShell>
    );
  }

  if (error || !repo) {
    return (
      <AppShell title="Repository">
        <EmptyState
          icon="alert"
          title="Repository unavailable"
          description={error || "This repository could not be found."}
          action={
            <div className="row">
              <Button variant="secondary" as={Link} to="/">
                Back to repositories
              </Button>
              <Button onClick={loadRepo}>Retry</Button>
            </div>
          }
        />
      </AppShell>
    );
  }

  const isPublic = Boolean(repo.visibility);
  const updated = repoDate(repo);
  const mongoContent = Array.isArray(repo.content) ? repo.content.filter(Boolean) : [];
  const latestCommit = commits[0] || null;
  const latestFiles = Array.isArray(latestCommit?.files) ? latestCommit.files : [];
  const content = latestFiles.length ? latestFiles : mongoContent;
  const repoUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/repo/${repo._id}`
      : repo._id;
  const linkCommand = `basicvcs link ${repoUrl}`;

  return (
    <AppShell title="Repository">
      <Link to="/" className="back-link mono">
        <Icon name="arrowLeft" size={14} /> All repositories
      </Link>

      <header className="repo-head">
        <div className="repo-head-main">
          <div className="repo-badges">
            <Chip dot={isPublic ? "green" : "amber"} tone={isPublic ? "sage" : "butter"}>
              {isPublic ? "Public" : "Private"}
            </Chip>
            <span className="mono repo-hash">#{shortHash(repo._id, 7)}</span>
          </div>

          <h1>{repo.name}</h1>
          <p className="repo-description">
            {repo.description || "No description yet. Use Edit to add one."}
          </p>

          <div className="repo-meta-row mono">
            <span>
              <Icon name="user" size={13} /> @{repo.owner?.username || "unknown"}
            </span>
            <span>
              <Icon name="clock" size={13} /> {updated ? formatDate(updated) : "No date"}
            </span>
          </div>
        </div>

        <div className="repo-actions">
          <button
            type="button"
            className="visibility-toggle"
            onClick={toggleVisibility}
            disabled={toggling}
            aria-pressed={isPublic}
            aria-label={isPublic ? "Make repository private" : "Make repository public"}
          >
            <span className={`visibility-switch${isPublic ? " is-on" : ""}`} aria-hidden="true">
              <span />
            </span>
            <span className="mono">{isPublic ? "Public" : "Private"}</span>
          </button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditOpen(true)}
            iconLeft={<Icon name="edit" size={14} />}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            iconLeft={<Icon name="trash" size={14} />}
          >
            Delete
          </Button>
        </div>
      </header>

      <div className="repo-tabs">
        <Tabs
          tabs={tabs.map((item) => {
            if (item.id === "issues") return { ...item, count: issues.length };
            if (item.id === "history") return { ...item, count: commits.length };
            return item;
          })}
          active={tab}
          onChange={setTab}
        />
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="repo-panel"
      >
        {tab === "overview" ? (
          <div className="overview-grid">
            <section className="detail-card">
              <div className="detail-head">
                <h2>About</h2>
              </div>
              <p className="detail-copy">{repo.description || "No description yet."}</p>
              <dl className="detail-facts">
                <div>
                  <dt className="mono">Repository ID</dt>
                  <dd className="mono">{repo._id}</dd>
                </div>
                <div>
                  <dt className="mono">Visibility</dt>
                  <dd>{isPublic ? "Public" : "Private"}</dd>
                </div>
                <div>
                  <dt className="mono">Owner</dt>
                  <dd>@{repo.owner?.username || "unknown"}</dd>
                </div>
              </dl>
            </section>

            <section className="detail-card">
              <div className="detail-head">
                <h2>{latestFiles.length ? "Latest commit files" : "Files"}</h2>
                <span className="mono detail-count">{content.length}</span>
              </div>

              {content.length ? (
                <ul className="file-list">
                  {content.map((file, index) => (
                    <li key={`${file}-${index}`}>
                      <Icon name="file" size={15} />
                      <span className="mono">{file}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon="file"
                  title="No files yet"
                  description="Link this folder, then add, commit and push. Files appear here from the latest commit."
                />
              )}
            </section>

            <section className="detail-card cli-setup">
              <div className="detail-head">
                <h2>Connect the CLI</h2>
                <CopyButton text={linkCommand} label="Copy command" />
              </div>
              <p className="detail-copy">
                Install once with <code>npm i -g basicvcs-cli</code>, sign in with{" "}
                <code>basicvcs login</code>, then run this in your project folder.
              </p>
              <code className="cli-command mono">{linkCommand}</code>
              <div className="cli-steps mono">
                <span>add</span>
                <Icon name="arrow" size={12} />
                <span>commit</span>
                <Icon name="arrow" size={12} />
                <span>push</span>
                <span className="cli-steps-note">→ refresh this page</span>
              </div>
            </section>
          </div>
        ) : null}

        {tab === "history" ? (
          <div className="history-wrap">
            <div className="history-toolbar">
              <p className="history-note">
                Read live from <code>repos/{repo._id}/commits/</code> in your S3
                bucket.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={loadCommits}
                loading={commitsLoading}
              >
                Refresh
              </Button>
            </div>

            {commitsError ? (
              <div className="dash-alert" role="alert">
                <span>{commitsError}</span>
                <Button variant="secondary" size="sm" onClick={loadCommits}>
                  Retry
                </Button>
              </div>
            ) : null}

            {commitsLoading ? (
              <div className="commit-list" aria-hidden="true">
                {[0, 1, 2].map((key) => (
                  <div className="commit-card" key={key}>
                    <Skeleton width="42px" height="42px" radius={12} />
                    <div className="commit-body">
                      <Skeleton width="58%" height={16} />
                      <Skeleton width="34%" height={11} />
                    </div>
                  </div>
                ))}
              </div>
            ) : commits.length ? (
              <div className="commit-list">
                {commits.map((commit) => (
                  <article className="commit-card" key={commit.id}>
                    <span className="commit-marker" aria-hidden="true">
                      <Icon name="branch" size={15} />
                    </span>

                    <div className="commit-body">
                      <div className="commit-title-row">
                        <h3>{commit.message}</h3>
                        <span className="mono commit-hash">
                          {shortHash(commit.id, 8)}
                        </span>
                      </div>

                      <div className="commit-meta mono">
                        <span>
                          <Icon name="clock" size={12} />
                          {commit.date ? formatDate(commit.date) : "No date"}
                        </span>
                        <span>{pluralize(commit.files.length, "file")}</span>
                      </div>

                      {commit.files.length ? (
                        <ul className="commit-files">
                          {commit.files.map((file) => (
                            <li key={`${commit.id}-${file}`}>
                              <Icon name="file" size={12} />
                              <span className="mono">{file}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    <CopyButton
                      className="commit-copy"
                      text={`basicvcs revert ${commit.id}`}
                      label="Copy revert"
                    />
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="branch"
                title="No commits in S3 yet"
                description="Link this folder to the repository, then run add, commit and push. The commits will appear here without a redeploy."
                action={<CopyButton text={linkCommand} label="Copy link command" />}
              />
            )}
          </div>
        ) : null}

        {tab === "issues" ? (
          <div className="issues-wrap">
            <div className="issues-toolbar">
              <div className="issue-filters" role="group" aria-label="Filter issues">
                {[
                  { id: "all", label: "All", count: issues.length },
                  { id: "open", label: "Open", count: openCount },
                  { id: "closed", label: "Closed", count: closedCount },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    className={`filter-chip${issueFilter === filter.id ? " is-active" : ""}`}
                    onClick={() => setIssueFilter(filter.id)}
                    aria-pressed={issueFilter === filter.id}
                  >
                    {filter.label}
                    <span className="mono">{filter.count}</span>
                  </button>
                ))}
              </div>

              <Button size="sm" onClick={openCreateIssue} iconLeft={<Icon name="plus" size={14} />}>
                New issue
              </Button>
            </div>

            {issuesError ? (
              <p className="dash-alert" role="alert">
                {issuesError}
              </p>
            ) : null}

            {issuesLoading ? (
              <div className="issue-list" aria-hidden="true">
                {[0, 1, 2].map((key) => (
                  <div className="issue-card" key={key}>
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="90%" height={12} />
                  </div>
                ))}
              </div>
            ) : filteredIssues.length ? (
              <div className="issue-list">
                {filteredIssues.map((issue) => (
                  <article className="issue-card" key={issue._id}>
                    <div className="issue-main">
                      <div className="issue-title-row">
                        <span
                          className={`issue-dot issue-dot-${issue.status === "closed" ? "closed" : "open"}`}
                          aria-hidden="true"
                        />
                        <h3>{issue.title}</h3>
                        <StatusChip status={issue.status} />
                      </div>
                      <p>{issue.description || "No description."}</p>
                      <span className="mono issue-id">#{shortHash(issue._id, 7)}</span>
                    </div>

                    <div className="issue-actions">
                      <button
                        type="button"
                        className="icon-btn icon-btn-bordered"
                        aria-label={`Edit ${issue.title}`}
                        onClick={() => openEditIssue(issue)}
                      >
                        <Icon name="edit" size={15} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-bordered"
                        aria-label={`Delete ${issue.title}`}
                        onClick={() => setIssueToDelete(issue)}
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="issue"
                title={issueFilter === "all" ? "No issues yet" : `No ${issueFilter} issues`}
                description={
                  issueFilter === "all"
                    ? "Track the small things that need doing. Open the first issue."
                    : "Try another filter, or open a new issue."
                }
                action={
                  <Button size="sm" onClick={openCreateIssue}>
                    New issue
                  </Button>
                }
              />
            )}
          </div>
        ) : null}

        {tab === "commands" ? (
          <div className="repo-commands">
            <p className="repo-commands-note">
              These run in your project folder with the installed CLI. They are
              documentation — nothing on this page executes them.
            </p>

            <div className="repo-command-grid">
              {commands.map((command) => (
                <article className="repo-command" key={command.id}>
                  <div className="repo-command-head">
                    <span className="mono">{command.number}</span>
                    <h3>{command.title}</h3>
                    <p>{command.description}</p>
                  </div>
                  <TerminalMock
                    command={command.command}
                    output={command.output}
                    label={`basicvcs — ${command.id}`}
                  />
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit repository"
        description="The API updates the description and appends content entries."
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={savingEdit}>
              Cancel
            </Button>
            <Button type="submit" form="edit-repo-form" loading={savingEdit}>
              Save changes
            </Button>
          </>
        }
      >
        <form id="edit-repo-form" className="stack" onSubmit={saveDescription}>
          <Input
            textarea
            label="Description"
            value={editDescription}
            onChange={(event) => setEditDescription(event.target.value)}
            placeholder="What is this project about?"
            rows={4}
          />
          {editError ? (
            <p className="auth-error" role="alert">
              {editError}
            </p>
          ) : null}
        </form>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete repository?"
        description={`${repo.name} will be removed from the dashboard. This cannot be undone.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Keep it
            </Button>
            <Button onClick={deleteRepository} loading={deleting}>
              Delete repository
            </Button>
          </>
        }
      >
        <p className="modal-text">
          Files in S3 and local commits are not deleted by this action. Only the
          repository record and its issues are affected.
        </p>
      </Modal>

      <Modal
        open={issueModal.open}
        onClose={() => setIssueModal({ open: false, issue: null })}
        title={issueModal.issue ? "Edit issue" : "New issue"}
        description={
          issueModal.issue
            ? "Update the title, description or status."
            : "Describe the small thing that needs doing."
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIssueModal({ open: false, issue: null })}
              disabled={savingIssue}
            >
              Cancel
            </Button>
            <Button type="submit" form="issue-form" loading={savingIssue}>
              {issueModal.issue ? "Save issue" : "Create issue"}
            </Button>
          </>
        }
      >
        <form id="issue-form" className="stack" onSubmit={saveIssue}>
          <Input
            label="Title"
            value={issueForm.title}
            onChange={(event) =>
              setIssueForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Staging path skips nested files"
            required
          />

          <Input
            textarea
            label="Description"
            value={issueForm.description}
            onChange={(event) =>
              setIssueForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="What happened, and what should happen instead?"
            rows={4}
          />

          {issueModal.issue ? (
            <label className="field">
              <span className="field-label">Status</span>
              <select
                className="input"
                value={issueForm.status}
                onChange={(event) =>
                  setIssueForm((current) => ({ ...current, status: event.target.value }))
                }
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </label>
          ) : null}

          {issueFormError ? (
            <p className="auth-error" role="alert">
              {issueFormError}
            </p>
          ) : null}
        </form>
      </Modal>

      <Modal
        open={Boolean(issueToDelete)}
        onClose={() => setIssueToDelete(null)}
        title="Delete issue?"
        description={issueToDelete?.title}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIssueToDelete(null)}>
              Keep it
            </Button>
            <Button onClick={deleteIssue}>Delete issue</Button>
          </>
        }
      >
        <p className="modal-text">This removes the issue permanently.</p>
      </Modal>
    </AppShell>
  );
}
