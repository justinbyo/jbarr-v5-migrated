import Image from "next/image";

export default function About() {
  return (
    <>
      {/* <section className="image">
        <Image
          src="/images/whiteboard.png"
          alt="Illustration of a whiteboard featuring a diagram of arrows, meant to evoke a coach's football play, along with two whiteboard pens and an eraser. By me."
          width={800}
          height={600}
          style={{ width: "100%", height: "auto" }}
        />
      </section> */}

      <section className="about">
        <p>
          I specialize in turning complex domains (like cybersecurity and web
          hosting)
          <sup>
            <a href="#footnote-1">1</a>
          </sup>{" "}
          into user-friendly, strategically-impactful, and scalable experiences
          for startups and enterprise companies alike.
          <br />
          <br />
          Currently, I&rsquo;m a Product Manager at{" "}
          <a href="https://github.com">GitHub</a>, where I lead teams
          maintaining and scaling its UI platform, including the navigation,
          <sup>
            <a href="#footnote-2">2</a>
          </sup>{" "}
          accessibility, and its design system{" "}
          <a href="https://primer.style">Primer</a>.
          <br />
          <br />
          Before that, I was a product and design leader at{" "}
          <a href="http://signalsciences.com" title="Signal Sciences homepage">
            Signal Sciences
          </a>
          , a cybersecurity startup acquired by{" "}
          <a href="https://fastly.com">Fastly</a> in 2020.
          <sup>
            <a href="#footnote-3">3</a>
          </sup>{" "}
          I led development of the UI dashboard, designed identity and access
          management features, guided privacy and data governance initiatives,
          and created a new self-service tier and sales motion.
          <br />
          <br />
          I&rsquo;ve worked across product, design, and engineering at a variety
          of companies such as <a href="https://godaddy.com">GoDaddy</a> and{" "}
          <a href="https://carbonfive.com">Carbon Five</a>. I&rsquo;ve also
          written, mentored, and presented on Agile product development, rapid
          prototyping, and growing careers in tech.
        </p>
      </section>
    </>
  );
}
