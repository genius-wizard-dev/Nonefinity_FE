import { QuickAccessGrid, RecentActivity, UserInfoCard } from "./components";

export default function General() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <UserInfoCard />
        <QuickAccessGrid />
        <RecentActivity />
      </div>
    </div>
  );
}
