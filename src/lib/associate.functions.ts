import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { getMainSupabase } from "./main-supabase";
import { ensureAssociate, verifyMainToken } from "./associate.server";

const DANTE_TOKEN_HEADER = "x-dante-token";

/** Sends the associate's main-site session token and verifies it on the server. */
const associateAuth = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { data } = await getMainSupabase().auth.getSession();
    const token = data.session?.access_token;
    return next({ headers: token ? { [DANTE_TOKEN_HEADER]: token } : {} });
  })
  .server(async ({ next }) => {
    const token = getRequestHeader(DANTE_TOKEN_HEADER) ?? "";
    const mainUser = await verifyMainToken(token);
    if (!mainUser) throw new Error("Unauthorized: sessão de associado inválida");
    return next({ context: { mainUser } });
  });

export type ClubOffer = {
  id: string;
  title: string;
  description: string;
  discount_label: string;
  coupon_code: string | null;
  action_type: string;
  action_url: string | null;
  address: string | null;
  cover_url: string | null;
  featured: boolean;
  category_id: string | null;
  store_name: string;
  store_logo: string | null;
};

export const getClubData = createServerFn({ method: "POST" })
  .middleware([associateAuth])
  .handler(async ({ context }) => {
    const associate = await ensureAssociate(context.mainUser);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cats = await supabaseAdmin
      .from("categories")
      .select("id, name, icon, sort_order")
      .order("sort_order")
      .order("name");
    let offers: ClubOffer[] = [];
    if (associate.status === "ativo") {
      const res = await supabaseAdmin
        .from("offers")
        .select(
          "id, title, description, discount_label, coupon_code, action_type, action_url, address, cover_url, featured, category_id, created_at, stores(name, logo_url)",
        )
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (res.error) throw new Error(res.error.message);
      offers = (res.data ?? []).map((o) => {
        const store = o.stores as { name: string; logo_url: string | null } | null;
        return {
          id: o.id,
          title: o.title,
          description: o.description,
          discount_label: o.discount_label,
          coupon_code: o.coupon_code,
          action_type: o.action_type,
          action_url: o.action_url,
          address: o.address,
          cover_url: o.cover_url,
          featured: o.featured,
          category_id: o.category_id,
          store_name: store?.name ?? "",
          store_logo: store?.logo_url ?? null,
        };
      });
    }
    return { associate, categories: cats.data ?? [], offers };
  });

export type ClubData = Awaited<ReturnType<typeof getClubData>>;
