export default function Footer() {
  return (
    <div className="footer-wrapper">
      <footer>
        <section className="footer" aria-label="Footer">
          <p>I live and work in sunny Los Angeles. Find me at:</p>
          <ul>
            <li>
              <span>&#8594;</span>{" "}
              <a href="mailto:justin@jbarr.co">justin@jbarr.co</a>
            </li>
            <li>
              <span>&#8594;</span>{" "}
              <a href="https://www.linkedin.com/in/justinbarryoung">LinkedIn</a>
            </li>
            <li>
              <span>&#8594;</span>{" "}
              <a href="https://github.com/justinbyo">GitHub</a>
            </li>
          </ul>
        </section>
      </footer>
    </div>
  );
}
