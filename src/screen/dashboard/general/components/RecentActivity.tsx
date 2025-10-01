export function RecentActivity() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Recent Activity
      </h3>
      <div className="text-center text-gray-500 py-8">
        <p>No recent activity to display</p>
        <p className="text-sm">
          Start by uploading files or creating datasets!
        </p>
      </div>
    </div>
  );
}
