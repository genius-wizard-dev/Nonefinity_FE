import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <SignIn 
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        redirectUrl="/dashboard"
      />
    </div>
  );
}
