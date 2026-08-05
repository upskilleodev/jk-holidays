import { getSession } from "@/lib/auth";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar
        user={
          session
            ? { name: session.name, role: session.role }
            : null
        }
      />
      <main className="flex-1 pb-24 sm:pb-20">{children}</main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
