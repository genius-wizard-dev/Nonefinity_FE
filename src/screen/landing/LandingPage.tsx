import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-50 p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-extrabold text-gray-900">Welcome to Nonefinity</h1>
        <p className="text-gray-600">
          Build, explore, and manage your workspace. Sign in to access your dashboard, or create an account to get started.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/sign-in"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Sign In
          </Link>
          <Link
            to="/sign-up"
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-black"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}


