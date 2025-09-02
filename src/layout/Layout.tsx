import "react"
import {SignedIn, SignedOut, UserButton, useAuth} from "@clerk/clerk-react"
import {Outlet, Link, Navigate} from "react-router-dom"

export function Layout() {
    const { signOut } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        
                        <nav className="flex items-center space-x-4">
                            <SignedIn>
                                <Link 
                                    to="/dashboard" 
                                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Dashboard
                                </Link>
                                
                                <Link 
                                    to="/dashboard/profile" 
                                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Profile
                                </Link>
                                
                                <button
                                    onClick={() => signOut()}
                                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Sign Out
                                </button>
                                
                                <UserButton 
                                    appearance={{
                                        elements: {
                                            userButtonAvatarBox: "w-8 h-8"
                                        }
                                    }}
                                />
                            </SignedIn>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <SignedOut>
                    <Navigate to="/sign-in" replace/>
                </SignedOut>
                <SignedIn>
                    <Outlet />
                </SignedIn>
            </main>
        </div>
    )
}