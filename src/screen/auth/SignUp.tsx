import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <SignUp 
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        redirectUrl="/dashboard"
      />
    </div>
  );
}
