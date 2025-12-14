 "use client";

import SolarSystem from "@/components/SolarSystem";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
  
    <main className="w-full h-screen overflow-hidden bg-[#000814]">
      <SolarSystem onLogin={() => router.push("/onboarding")} />
    </main>
  );
}