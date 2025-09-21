import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const { user } = useUser();

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome to Your Dashboard
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    {user?.primaryEmailAddress?.emailAddress ||
                                        "Not provided"}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">
                                        Member since:
                                    </span>{" "}
                                    {user?.createdAt
                                        ? new Date(
                                              user.createdAt
                                          ).toLocaleDateString()
                                        : "Not available"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                    to="/dashboard/profile"
                    className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                    <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg
                                className="w-6 h-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                            User Profile
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage your account settings
                        </p>
                    </div>
                </Link>

                {/* Files Management Shortcut */}
                <Link
                    to="/dashboard/files"
                    className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                    <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg
                                className="w-6 h-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 7h18M3 12h18M3 17h18"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                            File Management
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Upload, search, and manage files
                        </p>
                    </div>
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Recent Activity
                </h3>
                <div className="text-center text-gray-500 py-8">
                    <p>No recent activity to display</p>
                    <p className="text-sm">
                        Start by generating your first code challenge!
                    </p>
                </div>
            </div>
        </div>
    );
}
