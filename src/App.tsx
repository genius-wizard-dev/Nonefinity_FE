import { UserProfile, useAuth } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loading } from "./components/shared";
import { LoadingProvider } from "./contexts/LoadingContext";
import { Layout } from "./screen/dashboard/Layout.tsx";
import ClerkProviderWithRoutes from "./screen/auth/ClerkProviderWithRoutes";
import ProtectedRoute from "./screen/auth/ProtectedRoute";
import SignInPage from "./screen/auth/SignIn";
import SignUpPage from "./screen/auth/SignUp";
import LandingPage from "./screen/home/index.tsx";
import { DatasetManagement, FileManagement, General } from "./screen/index.ts";

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
          </Route>
        </Routes>
      </ClerkProviderWithRoutes>
    </LoadingProvider>
  );
}

export default App;
