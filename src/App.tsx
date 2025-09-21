import { Routes, Route } from "react-router-dom";
import ClerkProviderWithRoutes from "./screen/auth/ClerkProviderWithRoutes";
import SignInPage from "./screen/auth/SignIn";
import SignUpPage from "./screen/auth/SignUp";
import ProtectedRoute from "./screen/auth/ProtectedRoute";
import Dashboard from "./screen/dashboard/Dashboard.tsx";
import { Layout } from "./layout/Layout";
import { UserProfile } from "@clerk/clerk-react";
import LandingPage from "./screen/landing/LandingPage.tsx";
import { FileManagementPage } from "./components/file-management/FileManagementPage";

function App() {
    return (
        <ClerkProviderWithRoutes>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/sign-in/*" element={<SignInPage />} />
                <Route path="/sign-up/*" element={<SignUpPage />} />
                <Route
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route
                        path="/dashboard/profile"
                        element={<UserProfile />}
                    />
                    <Route
                        path="/dashboard/files"
                        element={<FileManagementPage />}
                    />
                </Route>
            </Routes>
        </ClerkProviderWithRoutes>
    );
}

export default App;
