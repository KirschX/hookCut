import { Suspense } from "react";
import { HydrateClient } from "@/components/wizard/HydrateClient";
import { QueryProvider } from "@/components/query/provider";

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="app">
        <Suspense fallback={null}>
          <HydrateClient />
        </Suspense>
        {children}
      </div>
    </QueryProvider>
  );
}
