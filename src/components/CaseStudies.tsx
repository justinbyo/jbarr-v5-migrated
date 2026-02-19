import { getCaseStudies } from "@/lib/case-studies";
import CaseStudy from "@/components/CaseStudy";

export default function CaseStudies() {
  const studies = getCaseStudies();

  if (studies.length === 0) return null;

  return (
    <section className="case-studies">
      {studies.map((study) => (
        <CaseStudy key={study.slug} study={study} />
      ))}
    </section>
  );
}
