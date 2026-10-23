import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { Icon } from "./Icon";
import { Kbd } from "./Kbd";
import styles from "./Button.module.scss";

export type ButtonVariant = "default" | "primary" | "ghost" | "danger";
export type ButtonSize = "md" | "sm";

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon. */
  icon?: LucideIcon;
  /** Shortcut hint, e.g. "⌘S". */
  kbd?: string;
  /** Square button with only the icon; pass `aria-label`. */
  iconOnly?: boolean;
  children?: ReactNode;
}

function content({ icon, kbd, children }: Pick<ButtonOwnProps, "icon" | "kbd" | "children">) {
  return (
    <>
      {icon ? <Icon icon={icon} size={15} /> : null}
      {children}
      {kbd ? <Kbd>{kbd}</Kbd> : null}
    </>
  );
}

function classes({ variant = "default", size = "md", iconOnly, className }: ButtonOwnProps & { className?: string }) {
  return clsx(styles.btn, className, {
    [styles.primary]: variant === "primary",
    [styles.ghost]: variant === "ghost",
    [styles.danger]: variant === "danger",
    [styles.sm]: size === "sm",
    [styles.iconOnly]: iconOnly,
  });
}

/** 32 px (26 px small). One primary per view. */
export function Button({
  variant,
  size,
  icon,
  kbd,
  iconOnly,
  className,
  children,
  type = "button",
  ...props
}: ButtonOwnProps & ComponentProps<"button">) {
  return (
    <button type={type} className={classes({ variant, size, iconOnly, className })} {...props}>
      {content({ icon, kbd, children })}
    </button>
  );
}

/** Same look as Button, rendered as a Next.js link for navigation. */
export function ButtonLink({
  variant,
  size,
  icon,
  kbd,
  iconOnly,
  className,
  children,
  ...props
}: ButtonOwnProps & ComponentProps<typeof Link>) {
  return (
    <Link className={classes({ variant, size, iconOnly, className })} {...props}>
      {content({ icon, kbd, children })}
    </Link>
  );
}
