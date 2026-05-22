import { useSession as useBetterAuthSession } from "@/lib/auth-client";

export function useSession() {
  return useBetterAuthSession();
}
