 "use client";

import SolarSystem from "@/components/SolarSystem";
import { useRouter } from "next/navigation";
import AstraChat from "@/components/astra-chat";

export default function Home() {
  const router = useRouter();

  return (
  
    <main className="w-full h-screen overflow-hidden bg-[#000814]">
      <SolarSystem onLogin={() => router.push("/onboarding")} />
      <AstraChat position="bottom-right" />
    </main>
  );
}