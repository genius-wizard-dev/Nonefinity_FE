import { UserProfile, useAuth } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loading } from "./components/shared";
import { Toaster } from "./components/ui/sonner";
import { LoadingProvider } from "./contexts/LoadingContext";
import ClerkProviderWithRoutes from "./screen/auth/ClerkProviderWithRoutes";
import ProtectedRoute from "./screen/auth/ProtectedRoute";
import SignInPage from "./screen/auth/SignIn";
import SignUpPage from "./screen/auth/SignUp";
import { Layout } from "./screen/dashboard/index.tsx";
import LandingPage from "./screen/home/index.tsx";
import {
  Credentials,
  DatasetManagement,
  Embedding,
  FileManagement,
  General,
  Models,
} from "./screen/index.ts";

// Component để redirect nếu đã login
function HomePageGuard() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <Loading />;
  }

  if (isSignedIn) {
    return <Navigate to="/dashboard/general" replace />;
  }

  return <LandingPage />;
}

function App() {
  return (
    <LoadingProvider>
      <ClerkProviderWithRoutes>
        <Routes>
          <Route path="/" element={<HomePageGuard />} />
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/dashboard"
              element={<Navigate to="/dashboard/general" replace />}
            />
            <Route path="/dashboard/general" element={<General />} />
            <Route path="/dashboard/profile" element={<UserProfile />} />
            <Route path="/dashboard/files" element={<FileManagement />} />
            <Route path="/dashboard/datasets" element={<DatasetManagement />} />
            <Route path="/dashboard/credentials" element={<Credentials />} />
            <Route path="/dashboard/models" element={<Models />} />
            <Route path="/dashboard/embedding" element={<Embedding />} />
          </Route>
        </Routes>
        {/* Show the Toaster in the top right corner */}
        <Toaster closeButton />
      </ClerkProviderWithRoutes>
    </LoadingProvider>
  );
}

export default App;
