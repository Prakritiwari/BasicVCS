import Chip from "../ui/Chip";
import Icon from "../ui/Icon";
import Reveal from "../ui/Reveal";

const messyFiles = [
  "final_v1.zip",
  "final_v2.zip",
  "final_v2_FINAL.zip",
  "project — copy (2)/",
  "notes_OLD.txt",
  "backup_2024/",
];

const loop = [
  { command: "add", copy: "Pick the files." },
  { command: "commit", copy: "Name the snapshot." },
  { command: "push", copy: "Send it to S3." },
];

export default function Comparison() {
  return (
    <section className="section comparison">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">the copy-paste tax</span>
            <h2 className="display">
              Stop paying it
              <br />
              every afternoon.
            </h2>
          </div>
          <p className="section-note">
            Copies are not a version history. They are a graveyard with worse
            naming. A loop is smaller and always current.
          </p>
        </div>

        <div className="compare-grid">
          <Reveal className="compare-card compare-before">
            <div className="compare-top">
              <span className="mono compare-label">before</span>
              <Chip tone="quiet">a folder</Chip>
            </div>

            <ul className="messy-list">
              {messyFiles.map((file) => (
                <li key={file}>
                  <Icon name="file" size={14} />
                  <span>{file}</span>
                  <span className="messy-x" aria-hidden="true">
                    ×
                  </span>
                </li>
              ))}
            </ul>

            <p className="compare-note">
              Six files. No dates that make sense. Zero answers.
            </p>
          </Reveal>

          <Reveal className="compare-card compare-after" delay={0.08}>
            <div className="compare-top">
              <span className="mono compare-label">after</span>
              <Chip tone="live">a loop</Chip>
            </div>

            <ol className="loop-row">
              {loop.map((step, index) => (
                <li key={step.command}>
                  <span className="loop-step mono">{String(index + 1).padStart(2, "0")}</span>
                  <strong className="mono">{step.command}</strong>
                  <span>{step.copy}</span>
                  {index < loop.length - 1 ? (
                    <Icon name="arrow" size={14} className="loop-arrow" />
                  ) : null}
                </li>
              ))}
            </ol>

            <p className="compare-note">
              One source of truth. Every version has a hash and a way back.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
