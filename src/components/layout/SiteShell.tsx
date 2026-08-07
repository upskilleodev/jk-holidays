import { getAdminSession, getMemberSession } from "@/lib/auth";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const [member, admin] = await Promise.all([
    getMemberSession(),
    getAdminSession(),
  ]);

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <Navbar
        member={member ? { name: member.name } : null}
        admin={admin ? { name: admin.name } : null}
      />
      <main className="min-w-0 flex-1 overflow-x-clip pb-24 sm:pb-20">
        {children}
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
