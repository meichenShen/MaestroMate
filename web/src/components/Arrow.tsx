import { ArrowRight, ArrowUpRight } from "lucide-react";
export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  const Icon = diagonal ? ArrowUpRight : ArrowRight;
  return <Icon size={24} aria-hidden="true" strokeWidth={1.5} />;
}
