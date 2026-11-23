import { forwardRef } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, MapPin, Store } from "lucide-react";
import type { ClubOffer } from "@/lib/associate.functions";
import { OfferVisual } from "./OfferVisual";
import { Button } from "@/components/ui/button";
import { actionHref, actionLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export const OfferCard = forwardRef<
  HTMLElement,
  { offer: ClubOffer; categoryName?: string; categoryIcon?: string; highlighted?: boolean }
>(function OfferCard({ offer, categoryName, categoryIcon, highlighted }, ref) {
  const href = actionHref(offer);
  const ActionIcon = offer.action_type === "endereco" ? MapPin : offer.action_type === "loja" ? Store : ExternalLink;
  return (
    <article
      ref={ref}
      className={cn(
        "flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-colors",
        highlighted && "animate-highlight border-primary-glow",
      )}
    >
      <div className="relative h-36">
        <OfferVisual cover={offer.cover_url} logo={offer.store_logo} icon={categoryIcon} alt={offer.store_name} />
        {offer.discount_label && (
          <span className="absolute left-3 top-3 rounded-full bg-gradient-primary px-3 py-1 font-friendly text-sm font-semibold text-primary-foreground shadow-glow">
            {offer.discount_label}
          </span>
        )}
        {categoryName && (
          <span className="absolute right-3 top-3 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur">
            {categoryName}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          {offer.store_logo && offer.cover_url && (
            <img src={offer.store_logo} alt="" className="h-6 w-6 rounded-full object-cover" loading="lazy" />
          )}
          <p className="text-xs font-semibold text-muted-foreground">{offer.store_name}</p>
        </div>
        <h3 className="mt-1 font-semibold leading-snug">{offer.title}</h3>
        {offer.description && <p className="mt-1 text-sm text-muted-foreground">{offer.description}</p>}
        {offer.action_type === "endereco" && offer.address && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-glow" /> {offer.address}
          </p>
        )}
        <div className="mt-auto space-y-2 pt-4">
          {offer.coupon_code ? (
            <div className="flex items-center gap-2 rounded-2xl border border-dashed border-primary-glow/50 bg-primary/10 p-1.5 pl-4">
              <span className="min-w-0 flex-1 truncate font-friendly text-base font-semibold tracking-wider text-primary-glow">
                {offer.coupon_code}
              </span>
              <Button
                size="sm"
                variant="hero"
                onClick={async () => {
                  const ok = await copyText(offer.coupon_code ?? "");
                  if (ok) toast.success(`Cupom ${offer.coupon_code} copiado!`, { description: "Cole no carrinho da loja para aplicar o desconto." });
                  else toast.error("Não foi possível copiar. Selecione o código e copie manualmente.");
                }}
              >
                <Copy /> Copiar Cupom
              </Button>
            </div>
          ) : (
            <p className="rounded-2xl bg-background/50 px-4 py-2.5 text-xs text-muted-foreground">
              Sem cupom: apresente sua carteirinha para usar este benefício.
            </p>
          )}
          {href && (
            <Button asChild variant="outline" className="w-full">
              <a href={href} target="_blank" rel="noopener noreferrer">
                <ActionIcon /> {actionLabel(offer.action_type)}
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
});
