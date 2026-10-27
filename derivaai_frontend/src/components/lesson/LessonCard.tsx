import Link from "next/link";
import { Card, CardBody, CardMedia, CardMeta, LangTag, LessonStatusBadge } from "@/components/ui";
import type { Lesson } from "@/lib/mock";
import { Curve } from "./Curve";
import styles from "./Lesson.module.scss";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const noRender = lesson.language === "en" ? "no render" : "sem render";
  return (
    <Link href={`/lessons/${lesson.slug}`} className={styles.cardLink}>
      <Card className={styles.card}>
        <CardMedia>
          <Curve kind={lesson.curve} />
          {lesson.length ? <span className={styles.length}>{lesson.length}</span> : null}
        </CardMedia>
        <CardBody>
          <h3 className={styles.cardTitle}>{lesson.title}</h3>
          <CardMeta>
            <LessonStatusBadge status={lesson.status} locale={lesson.language} />
            <LangTag>{lesson.language}</LangTag>
            <span>{lesson.publishedAgo ?? (lesson.status === "failed" ? null : noRender)}</span>
          </CardMeta>
          {lesson.failure ? <span className={styles.failure}>{lesson.failure}</span> : null}
        </CardBody>
      </Card>
    </Link>
  );
}
