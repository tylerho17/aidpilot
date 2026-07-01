import type { ReactNode } from "react";
import { cardBase, layout } from "@/lib/design-tokens";
import { PrimaryButtonLink } from "@/components/ui/PrimaryButton";
import { H3, Body } from "@/components/ui/Typography";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        ...cardBase,
        padding: layout.cardPadding,
        textAlign: "center",
      }}
    >
      <H3 style={{ marginBottom: 8 }}>{title}</H3>
      <Body style={{ marginBottom: actionHref || children ? layout.stackGap : 0 }}>{description}</Body>
      {children}
      {actionHref && actionLabel ? <PrimaryButtonLink href={actionHref}>{actionLabel}</PrimaryButtonLink> : null}
    </div>
  );
}
