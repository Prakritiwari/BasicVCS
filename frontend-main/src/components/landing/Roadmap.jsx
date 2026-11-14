import Chip from "../ui/Chip";
import Reveal from "../ui/Reveal";
import { roadmapLoops } from "./data";

export default function Roadmap() {
  return (
    <section className="section roadmap" id="roadmap">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">roadmap</span>
            <h2 className="display">
              Up next,
              <br />
              honestly.
            </h2>
          </div>
          <p className="section-note">
            Four loops. Three of them already work. The fourth is not pretending
            otherwise.
          </p>
        </div>

        <div className="loop-grid">
          {roadmapLoops.map((loop, index) => (
            <Reveal className="loop-card" key={loop.number} delay={index * 0.06}>
              <div className="loop-card-top">
                <span className="loop-number mono">LOOP {loop.number}</span>
                <Chip tone={loop.status === "live" ? "live" : "soon"}>
                  {loop.status === "live" ? "Live" : "Up next"}
                </Chip>
              </div>
              <h3>{loop.title}</h3>
              <p>{loop.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
