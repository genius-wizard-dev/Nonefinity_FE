import { UserProfile, useAuth } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loading } from "./components/shared";
import { Toaster } from "./components/ui/sonner";
import { LoadingProvider } from "./contexts/LoadingContext";
import { useTheme } from "./hooks/useTheme";
import ClerkProviderWithRoutes from "./screen/auth/ClerkProviderWithRoutes";
import ProtectedRoute from "./screen/auth/ProtectedRoute";
import SignInPage from "./screen/auth/SignIn";
import SignUpPage from "./screen/auth/SignUp";
import { Layout } from "./screen/dashboard/index.tsx";
import LandingPage from "./screen/home/index.tsx";
import {
  APIKeys,
  Chats,
  Credentials,
  DatasetManagement,
  Embedding,
  FileManagement,
  General,
  Integrate,
  KnowledgeStoreDetail,
  KnowledgeStores,
  MCP,
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
  // Initialize theme hook to handle favicon and theme detection
  useTheme();

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
            <Route path="/dashboard/chats" element={<Chats />} />
            <Route path="/dashboard/profile" element={<UserProfile />} />
            <Route path="/dashboard/files" element={<FileManagement />} />
            <Route path="/dashboard/datasets" element={<DatasetManagement />} />
            <Route
              path="/dashboard/knowledge-stores"
              element={<KnowledgeStores />}
            />
            <Route
              path="/dashboard/knowledge-stores/:id"
              element={<KnowledgeStoreDetail />}
            />
            <Route path="/dashboard/credentials" element={<Credentials />} />
            <Route path="/dashboard/api-keys" element={<APIKeys />} />
            <Route path="/dashboard/embeddings" element={<Embedding />} />
            <Route path="/dashboard/models" element={<Models />} />
            <Route path="/dashboard/integrate" element={<Integrate />} />
            <Route path="/dashboard/mcp" element={<MCP />} />
          </Route>
        </Routes>
        {/* Show the Toaster in the top right corner */}
        <Toaster closeButton />
      </ClerkProviderWithRoutes>
    </LoadingProvider>
  );
}

export default App;
