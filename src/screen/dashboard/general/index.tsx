import { QuickAccessGrid, RecentActivity, UserInfoCard } from "./components";

export default function General() {
  return (
    <div className="space-y-6">
      <UserInfoCard />
      <QuickAccessGrid />
      <RecentActivity />
    </div>
  );
}
