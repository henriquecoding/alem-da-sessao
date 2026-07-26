import "server-only";

import { createClient } from "@supabase/supabase-js";
import type {
  PublicLoadStructureInput,
  PublicLoadStructurePost,
} from "@alem-da-sessao/validation";
import { moderatePublicLoadStructure } from "@/lib/community/moderation";

type PublicationResult = {
  id: string | null;
  status: "approved" | "pending" | "rejected";
  reason: string | null;
};

type FixtureState = {
  posts: PublicLoadStructurePost[];
  actors: Array<{ actorHash: string; createdAt: string }>;
  postActors: Map<string, string>;
  supporters: Set<string>;
};

const initialPosts: PublicLoadStructurePost[] = [
  {
    id: "2b756f46-3c39-4c54-bddc-11312dc73391",
    locale: "pt-PT",
    loads: [
      {
        id: "care-family",
        label: "Cuidar de alguém que depende de mim",
        impactScale: 4,
        durationMonths: 24,
        ownership: "inherited",
        movement: "ask",
        custom: false,
      },
      {
        id: "home",
        label: "Manter a casa a funcionar",
        impactScale: 3,
        durationMonths: 12,
        ownership: "shared",
        movement: "negotiate",
        custom: false,
      },
    ],
    supportCount: 38,
    createdAt: "2026-07-25T18:30:00.000Z",
  },
  {
    id: "e4c3b24b-e7a8-453e-a3e8-47de4c47e3f8",
    locale: "pt-BR",
    loads: [
      {
        id: "work-decisions",
        label: "Decisões que só chegam até mim",
        impactScale: 4,
        durationMonths: 6,
        ownership: "mine",
        movement: "protect",
        custom: false,
      },
    ],
    supportCount: 21,
    createdAt: "2026-07-24T12:12:00.000Z",
  },
  {
    id: "a1c62cab-3a4e-4af0-a607-b0fb7247ec32",
    locale: "pt-PT",
    loads: [
      {
        id: "finances",
        label: "Garantir as despesas essenciais",
        impactScale: 5,
        durationMonths: 36,
        ownership: "inherited",
        movement: "observe",
        custom: false,
      },
    ],
    supportCount: 54,
    createdAt: "2026-07-22T09:45:00.000Z",
  },
];

const fixtureGlobal = globalThis as typeof globalThis & {
  __loadStructuresCommunity?: FixtureState;
};

function fixtureState() {
  fixtureGlobal.__loadStructuresCommunity ??= {
    posts: structuredClone(initialPosts),
    actors: [],
    postActors: new Map<string, string>(),
    supporters: new Set<string>(),
  };
  return fixtureGlobal.__loadStructuresCommunity;
}

function isSupabaseMode() {
  return process.env.NEXT_PUBLIC_DATA_MODE === "supabase";
}

function publicSupabase() {
  const url = process.env.SUPABASE_PUBLIC_URL;
  const serviceRoleKey = process.env.SUPABASE_PUBLIC_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Public Supabase is unavailable. Configure the dedicated public project before enabling supabase mode.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function listPublicLoadStructures(
  limit = 12,
): Promise<PublicLoadStructurePost[]> {
  if (!isSupabaseMode()) {
    return fixtureState().posts.slice(0, limit);
  }

  const { data, error } = await publicSupabase()
    .schema("experience_public")
    .from("load_structures_posts")
    .select("id, locale, structural_payload, support_count, created_at")
    .eq("moderation_status", "approved")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    locale: row.locale,
    loads: row.structural_payload,
    supportCount: row.support_count,
    createdAt: row.created_at,
  })) as PublicLoadStructurePost[];
}

export async function publishLoadStructure(
  input: PublicLoadStructureInput,
  actorHash: string,
): Promise<PublicationResult> {
  const decision = moderatePublicLoadStructure(input);
  if (decision.status === "rejected") {
    return { id: null, ...decision };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  if (!isSupabaseMode()) {
    const state = fixtureState();
    if (
      state.actors.filter(
        (entry) => entry.actorHash === actorHash && entry.createdAt >= since,
      ).length >= 3
    ) {
      return { id: null, status: "rejected", reason: "rate-limit" };
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    state.actors.push({ actorHash, createdAt });
    if (decision.status === "approved") {
      state.posts.unshift({
        id,
        locale: input.locale,
        loads: input.loads,
        supportCount: 0,
        createdAt,
      });
      state.postActors.set(id, actorHash);
    }
    return { id, ...decision };
  }

  const client = publicSupabase();
  const { count, error: rateError } = await client
    .schema("experience_public")
    .from("load_structures_posts")
    .select("id", { count: "exact", head: true })
    .eq("actor_hash", actorHash)
    .gte("created_at", since);

  if (rateError) throw rateError;
  if ((count ?? 0) >= 3) {
    return { id: null, status: "rejected", reason: "rate-limit" };
  }

  const { data, error } = await client
    .schema("experience_public")
    .from("load_structures_posts")
    .insert({
      locale: input.locale,
      structural_payload: input.loads,
      actor_hash: actorHash,
      moderation_status: decision.status,
      moderation_reason: decision.reason,
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id, ...decision };
}

export async function supportLoadStructure(
  postId: string,
  supporterHash: string,
): Promise<{ supportCount: number; alreadySupported: boolean }> {
  if (!isSupabaseMode()) {
    const state = fixtureState();
    const post = state.posts.find((item) => item.id === postId);
    if (!post) throw new Error("structure-not-found");
    if (state.postActors.get(postId) === supporterHash) {
      throw new Error("own-structure");
    }
    const key = `${postId}:${supporterHash}`;
    if (state.supporters.has(key)) {
      return { supportCount: post.supportCount, alreadySupported: true };
    }
    state.supporters.add(key);
    post.supportCount += 1;
    return { supportCount: post.supportCount, alreadySupported: false };
  }

  const client = publicSupabase();
  const { data: post, error: postError } = await client
    .schema("experience_public")
    .from("load_structures_posts")
    .select("actor_hash")
    .eq("id", postId)
    .eq("moderation_status", "approved")
    .single();

  if (postError?.code === "PGRST116") throw new Error("structure-not-found");
  if (postError) throw postError;
  if (post.actor_hash === supporterHash) throw new Error("own-structure");

  const { data, error } = await client
    .schema("experience_public")
    .rpc("support_load_structure", {
      target_post_id: postId,
      anonymous_supporter_hash: supporterHash,
    });

  if (error) throw error;
  const result = data as {
    supportCount: number;
    alreadySupported: boolean;
  };
  return {
    supportCount: Number(result.supportCount),
    alreadySupported: Boolean(result.alreadySupported),
  };
}
