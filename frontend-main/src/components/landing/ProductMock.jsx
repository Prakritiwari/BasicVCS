import Chip from "../ui/Chip";
import Icon from "../ui/Icon";
import Reveal from "../ui/Reveal";

const stagedFiles = ["src/index.js", "README.md", "src/commands/revert.js"];

const history = [
  {
    hash: "a3f9c21e",
    message: "feat: add revert flow",
    time: "2m ago",
    dot: "green",
    tone: "pushed",
  },
  {
    hash: "8c2d1f0a",
    message: "fix: staging path",
    time: "18m ago",
    dot: "green",
    tone: "pushed",
  },
  {
    hash: "41b7e6dd",
    message: "revert: back to 8c2d1f0a",
    time: "1h ago",
    dot: "red",
    tone: "reverted",
  },
  {
    hash: "c90a4f12",
    message: "chore: first commit",
    time: "yesterday",
    dot: "amber",
    tone: "staged",
  },
];

export default function ProductMock() {
  return (
    <section className="section product" id="how-it-works">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">how it works</span>
            <h2 className="display">
              A repo view,
              <br />
              not a dashboard.
            </h2>
          </div>
          <p className="section-note">
            Staged files, a commit message, a push to your bucket, and the history
            to undo it. This is the whole surface area.
          </p>
        </div>

        <Reveal>
          <figure className="product-mock">
            <div className="mock-chrome">
              <span className="mock-window-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="mock-path mono">basicvcs / my-project</span>
              <Chip tone="quiet">Private</Chip>
            </div>

            <div className="mock-body">
              <div className="mock-repo-head">
                <div>
                  <span className="mock-label mono">Repository</span>
                  <h3>my-project</h3>
                </div>
                <div className="mock-repo-meta">
                  <span className="mock-hash mono">a3f9c21e</span>
                  <Chip dot="green">Pushed</Chip>
                </div>
              </div>

              <div className="mock-grid">
                <div className="mock-panel">
                  <div className="mock-panel-head">
                    <span className="mock-label mono">Staged</span>
                    <Chip dot="amber" tone="quiet">
                      {stagedFiles.length} files
                    </Chip>
                  </div>

                  <ul className="mock-files">
                    {stagedFiles.map((file) => (
                      <li key={file}>
                        <span className="mock-check" aria-hidden="true">
                          <Icon name="check" size={11} strokeWidth={2.4} />
                        </span>
                        <span className="mono">{file}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mock-commit">
                    <span className="mock-label mono">Commit message</span>
                    <div className="mock-input">feat: add revert flow</div>
                    <div className="mock-commit-meta mono">
                      <span>a3f9c21e</span>
                      <span>just now</span>
                    </div>
                  </div>

                  <div className="mock-commit-actions">
                    <span className="mock-commit-btn">Commit 3 files</span>
                    <span className="mock-commit-state mono">
                      <span className="mock-dot mock-dot-amber" aria-hidden="true" />
                      ready to push
                    </span>
                  </div>
                </div>

                <div className="mock-panel">
                  <div className="mock-panel-head">
                    <span className="mock-label mono">Push</span>
                    <Chip dot="green">Synced</Chip>
                  </div>

                  <div className="mock-progress-copy mono">
                    Uploading to S3… 3/3
                  </div>
                  <div className="mock-progress" aria-hidden="true">
                    <span style={{ width: "100%" }} />
                  </div>
                  <div className="mock-push-meta mono">
                    <span>basicvcsbucket</span>
                    <span>ap-south-1</span>
                  </div>

                  <hr className="mock-rule" />

                  <div className="mock-panel-head">
                    <span className="mock-label mono">History</span>
                    <span className="mono muted">4 commits</span>
                  </div>

                  <ul className="mock-history">
                    {history.map((commit) => (
                      <li key={commit.hash}>
                        <span className={`mock-dot mock-dot-${commit.dot}`} aria-hidden="true" />
                        <div className="mock-history-body">
                          <strong>{commit.message}</strong>
                          <span className="mono">
                            {commit.hash} · {commit.time} · {commit.tone}
                          </span>
                        </div>
                        <span className="mock-pill">Revert</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <figcaption className="mock-caption mono">
              The actual repo view is functional after sign in.
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
