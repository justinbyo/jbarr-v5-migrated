import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface MediaItem {
  src: string;
  type: "image" | "video";
}

export interface CaseStudyData {
  slug: string;
  title: string;
  employer: string;
  order: number;
  visible: boolean;
  media: MediaItem[];
  paragraph: string;
  bullets: string[];
}

const CASE_STUDIES_DIR = path.join(process.cwd(), "content", "case-studies");

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

function parseMedia(raw: unknown): MediaItem[] {
  // Support both a single string and an array of strings
  const sources: string[] = [];
  if (Array.isArray(raw)) {
    sources.push(...raw.filter((s): s is string => typeof s === "string" && s !== ""));
  } else if (typeof raw === "string" && raw !== "") {
    sources.push(raw);
  }

  return sources.map((src) => {
    const ext = path.extname(src).toLowerCase();
    return {
      src,
      type: VIDEO_EXTENSIONS.includes(ext) ? "video" : "image",
    };
  });
}

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

    // Support new "media" field and legacy "image" field
    const media = parseMedia(data.media ?? data.image);

    return {
      slug: filename.replace(/\.md$/, ""),
      title: data.title ?? "",
      employer: data.employer ?? "",
      order: data.order ?? 0,
      visible: data.visible ?? false,
      media,
      paragraph: paragraphLines.join(" "),
      bullets,
    };
  });

  return studies
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);
}
