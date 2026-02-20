import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface MediaItem {
  src: string;
  type: "image" | "video";
  display?: "scroll";
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
  const items: Array<{ src: string; display?: string }> = [];

  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (typeof entry === "string" && entry !== "") {
        items.push({ src: entry });
      } else if (
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as Record<string, unknown>).src === "string" &&
        (entry as Record<string, unknown>).src !== ""
      ) {
        const obj = entry as Record<string, unknown>;
        items.push({ src: obj.src as string, display: obj.display as string | undefined });
      }
    }
  } else if (typeof raw === "string" && raw !== "") {
    items.push({ src: raw });
  }

  return items.map(({ src, display }) => {
    const ext = path.extname(src).toLowerCase();
    return {
      src,
      type: VIDEO_EXTENSIONS.includes(ext) ? "video" : "image",
      ...(display === "scroll" ? { display: "scroll" as const } : {}),
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
