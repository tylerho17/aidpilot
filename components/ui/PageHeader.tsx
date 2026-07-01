import type { ReactNode } from "react";
import { buttons, layout } from "@/lib/design-tokens";
import { PrimaryButtonLink } from "@/components/ui/PrimaryButton";
import { SecondaryButtonLink } from "@/components/ui/SecondaryButton";
import { TabButtonLink } from "@/components/ui/SecondaryButton";
import { H1, BodyMuted, Label } from "@/components/ui/Typography";

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  primaryAction,
  secondaryAction,
  children,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  primaryAction?: { href: string; label: string };
  secondaryAction?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <header style={{ marginBottom: layout.sectionGap }}>
      {eyebrow ? (
        <Label style={{ display: "block", marginBottom: 8, letterSpacing: "0.04em" }}>{eyebrow}</Label>
      ) : null}
      <H1 style={{ marginBottom: subtitle ? 8 : primaryAction || secondaryAction || children ? 16 : 0 }}>
        {title}
      </H1>
      {subtitle ? (
        <BodyMuted
          style={{
            marginBottom: primaryAction || secondaryAction ? 16 : children ? 12 : 0,
            maxWidth: 640,
          }}
        >
          {subtitle}
        </BodyMuted>
      ) : null}
      {primaryAction || secondaryAction ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: buttons.gap,
            alignItems: "center",
            marginBottom: children ? 12 : 0,
          }}
        >
          {primaryAction ? <PrimaryButtonLink href={primaryAction.href}>{primaryAction.label}</PrimaryButtonLink> : null}
          {secondaryAction ? (
            <SecondaryButtonLink href={secondaryAction.href}>{secondaryAction.label}</SecondaryButtonLink>
          ) : null}
        </div>
      ) : null}
      {children}
    </header>
  );
}

export function ProductFlowNav({ links }: { links: { href: string; label: string }[] }) {
  return (
    <nav
      aria-label="Product flow"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: layout.stackGapXs,
        marginBottom: layout.stackGap,
      }}
    >
      {links.map((link) => (
        <TabButtonLink key={link.href} href={link.href}>
          {link.label}
        </TabButtonLink>
      ))}
    </nav>
  );
}
