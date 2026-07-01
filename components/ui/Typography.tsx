import type { CSSProperties, ReactNode } from "react";

type TextProps = {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
};

export function H1({ children, style, className }: TextProps) {
  return (
    <h1 className={className ? `text-h1 ${className}` : "text-h1"} style={style}>
      {children}
    </h1>
  );
}

export function H2({ children, style, className }: TextProps) {
  return (
    <h2 className={className ? `text-h2 ${className}` : "text-h2"} style={style}>
      {children}
    </h2>
  );
}

export function H3({ children, style, className }: TextProps) {
  return (
    <h3 className={className ? `text-h3 ${className}` : "text-h3"} style={style}>
      {children}
    </h3>
  );
}

export function Body({ children, style, className }: TextProps) {
  return (
    <p className={className ? `text-body ${className}` : "text-body"} style={style}>
      {children}
    </p>
  );
}

export function BodyMuted({ children, style, className }: TextProps) {
  return (
    <p className={className ? `text-body-muted ${className}` : "text-body-muted"} style={style}>
      {children}
    </p>
  );
}

export function BodyStrong({ children, style, className }: TextProps) {
  return (
    <p className={className ? `text-body-strong ${className}` : "text-body-strong"} style={style}>
      {children}
    </p>
  );
}

export function Label({ children, style, className }: TextProps) {
  return (
    <span className={className ? `text-label ${className}` : "text-label"} style={style}>
      {children}
    </span>
  );
}

export function MetricValue({ children, style, color, className }: TextProps & { color?: string }) {
  return (
    <span
      className={className ? `text-metric ${className}` : "text-metric"}
      style={{ color, ...style }}
    >
      {children}
    </span>
  );
}
