import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Handshake, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DanteAvatar } from "@/components/club/DanteAvatar";
import { UniversoLogo } from "@/components/club/UniversoLogo";
import { InstitutionalFooter } from "@/components/club/InstitutionalFooter";
import { useUniversoUrl } from "@/lib/settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dante Clube — Participe, é grátis!" },
      {
        name: "description",
        content:
          "Bem-vindo ao Dante Clube, o clube de benefícios do Universo Querido Dante. Cupons, carteirinha digital e missões. Participe, é grátis!",
      },
      { property: "og:title", content: "Dante Clube — Participe, é grátis!" },
      {
        property: "og:description",
        content: "O clube de benefícios oficial e gratuito do Universo Querido Dante.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const universoUrl = useUniversoUrl();
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pt-10 md:max-w-lg md:pt-16">
      <header className="flex justify-center">
        <UniversoLogo className="h-7 md:h-8" />
      </header>

      <main className="flex flex-1 flex-col items-center pt-10 text-center md:pt-14">
        <div className="relative animate-float-soft">
          <div className="absolute inset-0 -z-10 scale-125 rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
          <DanteAvatar className="h-36 w-36 md:h-44 md:w-44" />
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-success px-4 py-1.5 font-friendly text-sm font-semibold text-success-foreground shadow-lg">
            100% Gratuito
          </span>
        </div>

        <h1 className="mt-10 font-display text-5xl font-semibold tracking-tight md:text-6xl">
          Dante <span className="bg-gradient-primary bg-clip-text text-transparent">Clube</span>
        </h1>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground md:text-lg">
          Bem-vindo ao Dante Clube, o clube de benefícios do Universo Querido Dante. Participe, é grátis!
        </p>

        <div className="mt-10 flex w-full flex-col gap-3">
          <Button asChild variant="hero" size="xl" className="w-full">
            <Link to="/entrar">
              <UserRound />
              Entrar como Associado
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl" className="w-full">
            <Link to="/auth">
              <Handshake />
              Acesso Parceiro & Gestão
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full text-primary-glow hover:text-primary-glow">
            <a href={universoUrl} target="_blank" rel="noopener noreferrer">
              Visitar Universo Dante
              <ArrowUpRight />
            </a>
          </Button>
        </div>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
