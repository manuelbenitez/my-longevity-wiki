import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://longevity.mbdev.to";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const COPY = {
  en: {
    title: "About",
    meta_title: "About — Longevity Wiki",
    meta_description:
      "Manuel Benitez is an independent software engineer behind Longevity Wiki. He collates peer-reviewed longevity research from Valter Longo, Luigi Fontana, and PubMed into open, searchable ingredient articles.",
    lede:
      "Longevity Wiki is written and maintained by one person. Here is who that person is, and how the content is sourced.",
    h_who: "Who",
    who_body:
      "I am Manuel Benitez, an independent software engineer with 7+ years of experience. I am not a doctor or a registered dietitian.",
    h_why: "Why this exists",
    why_body:
      "I picked up Luigi Fontana's The Path to Longevity in a bookstore on a whim. The research was excellent but the information was locked inside a 300-page book, scattered across chapters, hard to search when you just want to know what walnuts actually do. I started indexing it for myself and it turned into this site.",
    h_how: "How the content is researched",
    how_body_1:
      "Every ingredient article starts from a peer-reviewed source. The primary books are Valter Longo's The Longevity Diet (Avery, 2018) and Luigi Fontana's The Path to Longevity (Hardie Grant, 2020). Both are listed with their extraction details on the",
    how_body_1_link_sources: "sources page",
    how_body_2:
      "Specific health claims are cross-referenced with PubMed before they go on the site. This wiki is an index of what the scientific literature says — not my personal opinions on diet or supplements. When the research is uncertain or contested, the article says so.",
    h_contact: "Contact",
    contact_body: "If something is wrong, unclear, or out of date, I want to know.",
    contact_email_label: "Email",
    contact_email: "manuel@mbdev.to",
    contact_github_label: "GitHub",
    contact_github: "github.com/manuelbenitez",
    back: "Back to wiki",
  },
  es: {
    title: "Acerca de",
    meta_title: "Acerca de — Longevity Wiki",
    meta_description:
      "Manuel Benitez es el ingeniero de software independiente detras de Longevity Wiki. Recopila investigacion cientifica sobre longevidad de Valter Longo, Luigi Fontana y PubMed en articulos abiertos y buscables.",
    lede:
      "Longevity Wiki esta escrito y mantenido por una sola persona. Aqui explico quien soy y de donde sale el contenido.",
    h_who: "Quien",
    who_body:
      "Soy Manuel Benitez, ingeniero de software independiente con mas de 7 anos de experiencia. No soy medico ni nutricionista titulado.",
    h_why: "Por que existe esto",
    why_body:
      "Encontre por casualidad el libro The Path to Longevity de Luigi Fontana en una libreria. La investigacion era excelente pero la informacion estaba atrapada dentro de 300 paginas, repartida entre capitulos, dificil de consultar cuando solo quieres saber que hacen las nueces. Empece a indexarlo para mi y termino convirtiendose en este sitio.",
    h_how: "Como se investiga el contenido",
    how_body_1:
      "Cada articulo de ingrediente parte de una fuente revisada por pares. Los libros principales son The Longevity Diet de Valter Longo (Avery, 2018) y The Path to Longevity de Luigi Fontana (Hardie Grant, 2020). Ambos figuran con sus detalles de extraccion en la",
    how_body_1_link_sources: "pagina de fuentes",
    how_body_2:
      "Las afirmaciones especificas de salud se cruzan con PubMed antes de publicarse. Este wiki es un indice de lo que dice la literatura cientifica, no mis opiniones personales sobre dieta o suplementos. Cuando la evidencia es incierta o contestada, el articulo lo dice.",
    h_contact: "Contacto",
    contact_body: "Si algo esta mal, confuso o desactualizado, quiero saberlo.",
    contact_email_label: "Email",
    contact_email: "manuel@mbdev.to",
    contact_github_label: "GitHub",
    contact_github: "github.com/manuelbenitez",
    back: "Volver al wiki",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = COPY[locale as keyof typeof COPY] ?? COPY.en;
  const path = `/${locale}/about/`;
  const languages: Record<string, string> = { "x-default": `/en/about/` };
  for (const loc of routing.locales) {
    languages[loc] = `/${loc}/about/`;
  }
  return {
    title: t.meta_title,
    description: t.meta_description,
    alternates: { canonical: path, languages },
    openGraph: { url: path, type: "profile", images: ["/og-image.png"] },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = COPY[locale as keyof typeof COPY] ?? COPY.en;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Manuel Benitez",
    url: `${SITE_URL}/${locale}/about/`,
    jobTitle: "Software Engineer",
    description: t.meta_description,
    sameAs: [
      "https://github.com/manuelbenitez",
      "mailto:manuel@mbdev.to",
    ],
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-[680px] mx-auto px-6 pt-12 pb-4">
        <Link
          href={`/${locale}/`}
          className="text-sm text-muted hover:text-accent transition-colors !no-underline !border-none"
        >
          &larr; {t.back}
        </Link>
      </div>

      <article className="max-w-[680px] mx-auto px-6 pb-24">
        <h1 className="font-display text-[42px] font-light leading-[1.1] mb-6">
          {t.title}
        </h1>

        <p className="text-muted text-lg leading-relaxed mb-12">
          {t.lede}
        </p>

        <h2 className="font-display text-2xl font-normal mb-4">
          {t.h_who}
        </h2>
        <p className="leading-relaxed mb-12">
          {t.who_body}
        </p>

        <h2 className="font-display text-2xl font-normal mb-4">
          {t.h_why}
        </h2>
        <p className="leading-relaxed mb-12">
          {t.why_body}
        </p>

        <h2 className="font-display text-2xl font-normal mb-4">
          {t.h_how}
        </h2>
        <p className="leading-relaxed mb-4">
          {t.how_body_1}{" "}
          <Link href={`/${locale}/sources/`} className="text-accent">
            {t.how_body_1_link_sources}
          </Link>
          .
        </p>
        <p className="leading-relaxed mb-12">
          {t.how_body_2}
        </p>

        <h2 className="font-display text-2xl font-normal mb-4">
          {t.h_contact}
        </h2>
        <p className="leading-relaxed mb-6">
          {t.contact_body}
        </p>
        <div className="border border-border rounded-lg p-6 bg-surface space-y-3">
          <div>
            <span className="text-xs font-semibold text-muted uppercase tracking-wide mr-3">
              {t.contact_email_label}
            </span>
            <a href={`mailto:${t.contact_email}`} className="text-accent">
              {t.contact_email}
            </a>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted uppercase tracking-wide mr-3">
              {t.contact_github_label}
            </span>
            <a
              href={`https://${t.contact_github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent"
            >
              {t.contact_github}
            </a>
          </div>
        </div>
      </article>
    </main>
  );
}
