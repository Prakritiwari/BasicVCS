import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import Reveal from "../ui/Reveal";

export default function FinalCta() {
  return (
    <section className="final-cta">
      <div className="container final-inner">
        <Reveal as="span" className="eyebrow">
          last loop
        </Reveal>
        <Reveal as="h2" className="final-title" delay={0.05}>
          Stop losing
          <br />
          your work.
        </Reveal>
        <Reveal as="p" className="final-copy" delay={0.1}>
          Make a repository, commit something small, push it to your bucket. That
          is the whole ritual.
        </Reveal>
        <Reveal className="final-actions" delay={0.15}>
          <Button as={Link} to="/signup" size="lg" iconRight={<Icon name="arrow" size={16} />}>
            Get started
          </Button>
          <Button as={Link} to="/auth" variant="secondary" size="lg">
            Sign in
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
