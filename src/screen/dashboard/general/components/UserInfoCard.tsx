import { useUser } from "@clerk/clerk-react";

export function UserInfoCard() {
  const { user } = useUser();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Welcome to Your Dashboard
      </h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            User Information
          </h3>
          <div className="mt-2 space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Name:</span>{" "}
              {user?.fullName || "Not provided"}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span>{" "}
              {user?.primaryEmailAddress?.emailAddress || "Not provided"}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Member since:</span>{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "Not available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
