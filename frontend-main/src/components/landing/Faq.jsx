import Accordion from "../ui/Accordion";
import { faqItems } from "./data";

export default function Faq() {
  return (
    <section className="section faq" id="faq">
      <div className="container faq-layout">
        <div className="faq-intro">
          <span className="eyebrow">FAQ</span>
          <h2 className="display">
            Questions,
            <br />
            answered.
          </h2>
          <p className="section-note">
            Short answers. If something is still unclear, the commands above are
            the whole manual.
          </p>
        </div>

        <Accordion items={faqItems} />
      </div>
    </section>
  );
}
