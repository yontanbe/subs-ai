"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { I18nProvider, useTranslation } from "@/lib/i18n";

function LocaleSync({ children }: { children: React.ReactNode }) {
  const { locale } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
  }, [locale]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>
        <LocaleSync>{children}</LocaleSync>
      </I18nProvider>
    </SessionProvider>
  );
}
