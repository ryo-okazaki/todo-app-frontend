import { ReactNode } from "react";

export default function InitialLayout({ children }: {children: ReactNode}) {
  return (
    <div className="min-h-screen flex-col items-center justify-start">
      {children}
    </div>
  );
}
