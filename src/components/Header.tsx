import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header>
      <section className="navigation">
        <h1>
          Product + Design <span>by Justin Barr Young</span>
        </h1>
        <div className="nav-buttons">
          <ThemeToggle />
          <a
            className="nav-button resume-link"
            href="https://docs.google.com/document/d/1GYAtmDI-ciMgXkVksxFhqL3De6NcDGubUkDek7IPXjY/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
          >
            Resume <span className="resume-arrow">&rarr;</span>
          </a>
        </div>
      </section>
    </header>
  );
}
