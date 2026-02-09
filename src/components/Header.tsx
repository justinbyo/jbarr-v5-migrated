import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header>
      <section className="navigation">
        <h1>
          Product + Design <span>by Justin Barr Young</span>
        </h1>
        <ThemeToggle />
      </section>
    </header>
  );
}
