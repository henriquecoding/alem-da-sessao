import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function requireClinicalEnvironment() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_CLINICAL_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_CLINICAL_ANON_KEY;

  if (
    process.env.NEXT_PUBLIC_DATA_MODE !== "supabase" ||
    !url ||
    !anonKey
  ) {
    throw new Error(
      "Clinical Supabase is unavailable. Keep NEXT_PUBLIC_DATA_MODE=fixture until an isolated project is configured.",
    );
  }

  return { url, anonKey };
}

export async function createClinicalSupabaseClient() {
  const { url, anonKey } = requireClinicalEnvironment();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot always write cookies. Session refresh is
          // delegated to the request boundary once authentication is enabled.
        }
      },
    },
  });
}
