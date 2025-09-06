import {ClerkProvider} from "@clerk/clerk-react"
import {BrowserRouter} from "react-router-dom";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

interface ClerkProviderWithRoutesProps {
  children: React.ReactNode;
}

export default function ClerkProviderWithRoutes({children}: ClerkProviderWithRoutesProps) {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} appearance={{
      layout: {
        unsafe_disableDevelopmentModeWarnings: true,
      },
    }}>
      <BrowserRouter>{children}</BrowserRouter>
    </ClerkProvider>
  );
}
