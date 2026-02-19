import type { CaseStudyData } from "@/lib/case-studies";

interface CaseStudyProps {
  study: CaseStudyData;
}

export default function CaseStudy({ study }: CaseStudyProps) {
  return (
    <article className="case-study">
      <div className="case-study--content">
        <h3>{study.title}</h3>
        <p className="case-study--employer">{study.employer}</p>
        <p>{study.paragraph}</p>
        <ul>
          {study.bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      </div>
      <div className="case-study--media">
        {study.image ? (
          <img src={study.image} alt={study.title} />
        ) : (
          <div className="case-study--placeholder" />
        )}
      </div>
    </article>
  );
}
