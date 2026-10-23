import type { ComponentProps } from "react";
import clsx from "clsx";
import styles from "./Card.module.scss";

export function Card({ className, ...props }: ComponentProps<"article">) {
  return <article className={clsx(styles.card, className)} {...props} />;
}

/** 16:9 slot for a thumbnail, plot or poster. */
export function CardMedia({ className, ...props }: ComponentProps<"div">) {
  return <div className={clsx(styles.media, className)} {...props} />;
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={clsx(styles.body, className)} {...props} />;
}

export function CardMeta({ className, ...props }: ComponentProps<"div">) {
  return <div className={clsx(styles.meta, className)} {...props} />;
}
