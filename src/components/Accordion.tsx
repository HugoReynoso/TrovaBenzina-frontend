import type { ReactNode } from "react";

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  return (
    <details className="rounded-md border border-ink/10 bg-white p-4 shadow-sm" open={defaultOpen}>
      <summary className="cursor-pointer text-base font-black text-ink">{title}</summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}
