import { useRouter } from "next/navigation";

export interface RedirectProps {
  to: string;
}

export function Redirect({ to }: RedirectProps) {
  const router = useRouter();

  router.push(to);
  return undefined;
}
