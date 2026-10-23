import type { LucideIcon, LucideProps } from "lucide-react";

interface IconProps extends Omit<LucideProps, "ref"> {
  icon: LucideIcon;
}

/** Lucide at the design's defaults: 16 px, 1.75 stroke, decorative unless labelled. */
export function Icon({ icon: Glyph, size = 16, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <Glyph
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden={props["aria-label"] ? undefined : true}
      focusable="false"
      {...props}
    />
  );
}
