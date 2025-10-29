import { Header } from "@/components/Header";
import { CycleProgressCard } from "@/components/CycleProgressCard";
import { RecentSymptoms } from "@/components/RecentSymptoms";
import { TipsGrid } from "@/components/TipsGrid";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const Index = () => {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display" style={{ paddingBottom: "96px" }}>
      <Header />

      <main className="flex-grow flex flex-col gap-6">
        <CycleProgressCard />
        <RecentSymptoms />
        <TipsGrid />
      </main>

      <FloatingActionButton />
      <BottomNavigation />
    </div>
  );
};

export default Index;
