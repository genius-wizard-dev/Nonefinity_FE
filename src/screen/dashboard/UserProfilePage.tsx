import { UserProfile } from "@clerk/clerk-react";

export default function UserProfilePage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User Profile</h2>
        <p className="text-gray-600 mb-6">
          Manage your account settings, personal information, and preferences.
        </p>
        
        <div className="flex justify-center">
          <UserProfile 
            appearance={{
              elements: {
                card: "shadow-none",
                navbar: "hidden",
                pageScrollBox: "p-0",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200",
                formFieldInput: "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                formFieldLabel: "text-gray-700 font-medium",
                headerTitle: "text-xl font-bold text-gray-900",
                headerSubtitle: "text-gray-600"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
