import Hero from "./Hero";
import Why from "./Why";
import ProductMock from "./ProductMock";
import Comparison from "./Comparison";
import CommandsPinned from "./CommandsPinned";
import Included from "./Included";
import Roadmap from "./Roadmap";
import Faq from "./Faq";
import FinalCta from "./FinalCta";
import Footer from "./Footer";
import Loader from "./Loader";
import Navbar from "./Navbar";
import "./landing.css";

export default function Landing() {
  return (
    <div className="landing page-shell">
      <Loader />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />

      <main id="main" className="page-main">
        <Hero />
        <Why />
        <ProductMock />
        <Comparison />
        <CommandsPinned />
        <Included />
        <Roadmap />
        <Faq />
        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}
