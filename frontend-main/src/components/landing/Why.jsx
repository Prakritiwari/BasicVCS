import Reveal from "../ui/Reveal";
import { driftChips } from "./data";

export default function Why() {
  return (
    <section className="section why" id="why">
      <div className="container why-inner">
        <Reveal as="span" className="eyebrow">
          why
        </Reveal>

        <Reveal as="h2" className="why-statement" delay={0.06}>
          Your work shouldn&apos;t live in a folder called{" "}
          <em>final_v2_FINAL</em>. One command saves a version. One more sends it
          to S3. Everything in between stays out of your way.
        </Reveal>

        <div className="why-chips">
          {driftChips.map((chip, index) => (
            <span
              key={chip.text}
              className={`drift-chip ${chip.className}`}
              style={{ animationDelay: `${index * -1.4}s` }}
            >
              {chip.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
