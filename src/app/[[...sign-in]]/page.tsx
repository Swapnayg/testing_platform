// "use client";

// import * as Clerk from "@clerk/elements/common";
// import * as SignIn from "@clerk/elements/sign-in";
// import { useUser } from "@clerk/nextjs";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// const LoginPage = () => {
//   const { isLoaded, isSignedIn, user } = useUser();

//   const router = useRouter();

//   useEffect(() => {
//     const role = user?.publicMetadata.role;
//     //console.log("User role:", role);
//     if (role) {
//       router.push(`/${role}`);
//     }
//   }, [user, router]);

//   return (
//     <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
//       <SignIn.Root>
//         <SignIn.Step
//           name="start"
//           className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-2"
//         >
//           <h1 className="text-xl font-bold flex items-center gap-2">
//             <Image src="/logo.png" alt="" width={24} height={24} />
//             SchooLama
//           </h1>
//           <h2 className="text-gray-400">Sign in to your account</h2>
//           <Clerk.GlobalError className="text-sm text-red-400" />
//           <Clerk.Field name="identifier" className="flex flex-col gap-2">
//             <Clerk.Label className="text-xs text-gray-500">
//               Username
//             </Clerk.Label>
//             <Clerk.Input
//               type="text"
//               required
//               className="p-2 rounded-md ring-1 ring-gray-300"
//             />
//             <Clerk.FieldError className="text-xs text-red-400" />
//           </Clerk.Field>
//           <Clerk.Field name="password" className="flex flex-col gap-2">
//             <Clerk.Label className="text-xs text-gray-500">
//               Password
//             </Clerk.Label>
//             <Clerk.Input
//               type="password"
//               required
//               className="p-2 rounded-md ring-1 ring-gray-300"
//             />
//             <Clerk.FieldError className="text-xs text-red-400" />
//           </Clerk.Field>
//           <SignIn.Action
//             submit
//             className="bg-blue-500 text-white my-1 rounded-md text-sm p-[10px]"
//           >
//             Sign In
//           </SignIn.Action>
//         </SignIn.Step>
//       </SignIn.Root>
//     </div>
//   );
// };

// export default LoginPage;




"use client"

import * as Clerk from "@clerk/elements/common"
import * as SignIn from "@clerk/elements/sign-in"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { GraduationCap, Shield, Users } from "lucide-react"

export default function LoginPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [signingIn, setSigningIn] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setRedirecting(true) // Show full-screen spinner instead of login UI
      const role = user?.publicMetadata?.role
      if (role) {
        router.push(`/${role}`)
      } else {
        router.push(`/dashboard`)
      }
    }
  }, [isLoaded, isSignedIn, user, router])

  // Loading from Clerk
  if (!isLoaded || redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#047857] to-[#059669] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  // If not signed in, show the login UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f4ea] to-[#d3f1e1] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#047857] rounded-full mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#047857] mb-2">Bright Future</h1>
          <p className="text-[#047857]/80">Educational Management System</p>
        </div>

        {/* Sign In Form */}
        <SignIn.Root>
          <SignIn.Step
            name="start"
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            onSubmit={() => setSigningIn(true)}
            onError={() => setSigningIn(false)}
          >
            {/* Form Header */}
            <div className="bg-gradient-to-r from-[#047857] to-[#059669] px-8 py-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Welcome Back</h2>
              </div>
              <p className="text-green-100 text-sm">Sign in to access your account</p>
            </div>

            {/* Form Body */}
            <div className="px-8 py-8">
              <Clerk.GlobalError className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600" />

              <div className="space-y-6">
                <Clerk.Field name="identifier" className="space-y-2">
                  <Clerk.Label className="block text-sm font-medium text-gray-700">Roll No or Student ID</Clerk.Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Clerk.Input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669] transition duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your roll number or student ID"
                    />
                  </div>
                  <Clerk.FieldError className="text-xs text-red-500 mt-1" />
                </Clerk.Field>

                <Clerk.Field name="password" className="space-y-2">
                  <Clerk.Label className="block text-sm font-medium text-gray-700">CNIC</Clerk.Label>
                  <p className="text-xs text-gray-500 mb-2">Enter CNIC with dashes (e.g., 12345-6789012-3)</p>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Clerk.Input
                      type="password"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669] transition duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="12345-6789012-3"
                    />
                  </div>
                  <Clerk.FieldError className="text-xs text-red-500 mt-1" />
                </Clerk.Field>

                <SignIn.Action
                  submit
                  className="w-full bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#04694d] hover:to-[#048657] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:ring-offset-2 shadow-lg flex items-center justify-center gap-2"
                >
                  {signingIn && (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {signingIn ? "Signing In..." : "Sign In to Dashboard"}
                </SignIn.Action>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Secure Login
                  </span>
                  <span>•</span>
                  <span>Educational Platform</span>
                  <span>•</span>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </SignIn.Step>
        </SignIn.Root>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-700">
            Don’t have an account?{" "}
            <a
              href="/registration-form"
              className="text-[#047857] font-medium underline hover:opacity-90"
            >
              Apply Now
            </a>
          </p>
        </div>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-700 flex items-center justify-center gap-2">
            Having trouble signing in?
            <button className="text-[#047857] font-medium underline hover:opacity-90 inline-flex items-center gap-2">
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
