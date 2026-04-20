import type { ReactNode } from "react";

// Root passthrough. Locale-specific <html>/<body>/fonts/metadata live in
// [locale]/layout.tsx so that <html lang> reflects the active locale in
// static export (output: "export" disallows dynamic APIs like getLocale()
// in the root layout).
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
