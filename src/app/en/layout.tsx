import type { ReactNode } from "react";
import { HtmlLang } from "@/components/HtmlLang";

export default function LocaleLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HtmlLang lang="en" />
      {children}
    </>
  );
}
