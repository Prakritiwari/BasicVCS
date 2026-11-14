import Chip from "../ui/Chip";
import Reveal from "../ui/Reveal";
import { includedGroups } from "./data";

export default function Included() {
  return (
    <section className="section included" id="included">
      <div className="container included-layout">
        <div className="included-intro">
          <span className="eyebrow">what&apos;s included</span>
          <h2 className="display">
            Everything you need.
            <br />
            Nothing you don&apos;t.
          </h2>
          <p className="section-note">
            Live means it works today. Up next means exactly that — no fake launch
            dates, no half-built buttons.
          </p>
        </div>

        <div className="included-groups">
          {includedGroups.map((group, index) => (
            <Reveal className="included-group" key={group.label} delay={index * 0.04}>
              <h3 className="mono">{group.label}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item.name}>
                    <span>{item.name}</span>
                    <Chip tone={item.status === "live" ? "live" : "soon"}>
                      {item.status === "live" ? "Live" : "Up next"}
                    </Chip>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
