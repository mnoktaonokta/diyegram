"use client";

import { Toaster } from "sonner";

export function ClientToaster() {
  return (
    <Toaster
      position="bottom-right"
      offset={{ bottom: "7.5rem", right: "1rem" }}
      mobileOffset={{ bottom: "7.5rem", right: "1rem" }}
      visibleToasts={3}
      toastOptions={{
        unstyled: true,
        duration: 3200,
      }}
    />
  );
}
