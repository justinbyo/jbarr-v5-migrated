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
          I specialize in turning complex domains (like cybersecurity, dev tools, and web
          hosting) into user-friendly, strategically-impactful, and scalable experiences
          for startups and enterprise companies alike.
          <br />
          <br />
          Currently, I&rsquo;m a Product Manager at{" "}
          <a href="https://github.com">GitHub</a>, where I lead UI platform
          initiatives (like design systems and performance) and improve agentic developer
          workflows in the core product for 150 million users.
          <br />
          <br />
          Before that, I was an early product and design leader at{" "}
          <a href="http://signalsciences.com" title="Signal Sciences homepage">
            Signal Sciences
          </a>
          , a cybersecurity startup acquired by{" "}
          <a href="https://fastly.com">Fastly</a> in 2020 for $825 million. I led development of the UI dashboard, designed identity and access
          management features, guided privacy and data governance initiatives,
          and created a new self-service tier and sales motion as we scaled our enterprise customer base from dozens to hundreds.
          <br />
          <br />
          I&rsquo;ve worked across product, design, and engineering at a variety
          of companies such as <a href="https://godaddy.com">GoDaddy</a> and{" "}
          <a href="https://carbonfive.com">Carbon Five</a>. I&rsquo;ve also
          written, mentored, and presented on product design, rapid
          prototyping, and growing careers in tech.
        </p>
      </section>
    </>
  );
}
