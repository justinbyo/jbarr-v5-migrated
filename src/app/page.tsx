import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import CTA from "@/components/CTA";
import CaseStudies from "@/components/CaseStudies";
import Footnotes from "@/components/Footnotes";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <CTA />
      </main>
      <CaseStudies />
      {/* <Footer /> */}
      <Footnotes />
    </>
  );
}
