import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface CaseStudyData {
  slug: string;
  title: string;
  employer: string;
  order: number;
  visible: boolean;
  image: string;
  paragraph: string;
  bullets: string[];
}

const CASE_STUDIES_DIR = path.join(process.cwd(), "content", "case-studies");

export function getCaseStudies(): CaseStudyData[] {
  const files = fs.readdirSync(CASE_STUDIES_DIR).filter((f) => f.endsWith(".md"));

  const studies = files.map((filename) => {
    const filePath = path.join(CASE_STUDIES_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    // Split body into paragraph and bullet list
    const lines = content.trim().split("\n");
    const paragraphLines: string[] = [];
    const bullets: string[] = [];

    for (const line of lines) {
      if (line.startsWith("- ")) {
        bullets.push(line.replace(/^- /, ""));
      } else if (bullets.length === 0) {
        // Still in the paragraph section
        if (line.trim() !== "") {
          paragraphLines.push(line.trim());
        }
      }
    }

    return {
      slug: filename.replace(/\.md$/, ""),
      title: data.title ?? "",
      employer: data.employer ?? "",
      order: data.order ?? 0,
      visible: data.visible ?? false,
      image: data.image ?? "",
      paragraph: paragraphLines.join(" "),
      bullets,
    };
  });

  return studies
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);
}
