"use client";

import Link from "next/link";
import { Card, Icon } from "@/components/ui";
import { useLanguage } from "@/lib/i18n";
import { useAidPath } from "@/hooks/useAidPath";

/**
 * First-run / demo launchpad on the dashboard: signposts the three moments that
 * show AidPilot actually working (personalize -> ask -> decode) so a new visitor
 * (or a founder clicking "See the demo") isn't left staring at a static
 * overview. Hides itself once the student has personalized their plan.
 */
export function GetStartedSpotlight() {
  const { t } = useLanguage();
  const profile = useAidPath();
  if (profile.form !== null) return null;

  const s = t({
    en: {
      eyebrow: "Start here",
      heading: "See it work in 60 seconds",
      steps: [
        { href: "/fafsa", title: "Personalize your plan", desc: "3 quick questions → your exact path" },
        { href: "/fafsa", title: "Ask AidPilot anything", desc: "Sourced answers, tailored to you" },
        { href: "/aid-money", title: "Decode an aid letter", desc: "See what an offer really means" },
      ],
    },
    es: {
      eyebrow: "Empieza aquí",
      heading: "Míralo funcionar en 60 segundos",
      steps: [
        { href: "/fafsa", title: "Personaliza tu plan", desc: "3 preguntas rápidas → tu ruta exacta" },
        { href: "/fafsa", title: "Pregúntale a AidPilot", desc: "Respuestas verificadas, para tu caso" },
        { href: "/aid-money", title: "Descifra una carta de ayuda", desc: "Entiende lo que significa una oferta" },
      ],
    },
  });

  return (
    <Card variant="clay" padding={0} style={{ overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "16px 18px 12px", background: "var(--gradient-info)" }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "var(--blue-700)" }}>
          {s.eyebrow}
        </div>
        <div className="font-display" style={{ fontSize: 19, fontWeight: 900, color: "var(--ink-900)", marginTop: 3, letterSpacing: "-.3px" }}>
          {s.heading}
        </div>
      </div>
      <div style={{ padding: "8px 10px 12px" }}>
        {s.steps.map((step, i) => (
          <Link key={i} href={step.href} style={{ textDecoration: "none" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 8px",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <span
                className="font-display"
                style={{
                  flexShrink: 0,
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "var(--blue-700)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: "var(--ink-800)" }}>{step.title}</span>
                <span style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "var(--gray-500)", marginTop: 1 }}>{step.desc}</span>
              </span>
              <Icon name="arrow-right" size={16} color="var(--gray-400)" />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
