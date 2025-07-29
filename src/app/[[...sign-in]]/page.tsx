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

  const [showForgotUsername, setShowForgotUsername] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const [cnic, setCnic] = useState("")
  const [studentId, setStudentId] = useState("")
  const [recoveryLoading, setRecoveryLoading] = useState(false)

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setRedirecting(true)
      const role = user?.publicMetadata?.role
      if (role) {
        router.push(`/${role}`)
      } else {
        router.push(`/dashboard`)
      }
    }
  }, [isLoaded, isSignedIn, user, router])

  // Loading screen
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

  // Dummy submission handlers
const handleRecoverUsername = async () => {
  setRecoveryLoading(true);
  try {
    const res = await fetch("/api/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "recover-username",
        cnicNumber: cnic,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setCnic("");
      alert(`An email has been sent to your registered email address (${data.email}) with your login details. Please check your inbox.`);
    } else {
      alert(data.error || "Something went wrong");
    }
  } catch (err) {
    alert("Server error.");
  } finally {
    setRecoveryLoading(false);
    setShowForgotUsername(false);
  }
};

const handleResetPassword = async () => {
  setRecoveryLoading(true);
  try {
    const res = await fetch("/api/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "reset-password",
        rollNo: studentId,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setStudentId("");
      alert(`Your login credentials have been sent to your registered email address (${data.email}). Please check your inbox.`);
    } else {
      alert(data.error || "Something went wrong");
    }

  } catch (err) {
    alert("Server error.");
  } finally {
    setRecoveryLoading(false);
    setShowForgotPassword(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f4ea] to-[#d3f1e1] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#047857] rounded-full mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#047857] mb-2">Bright Future</h1>
          <p className="text-[#047857]/80">Educational Management System</p>
        </div>

        {/* Sign In Form */}
        {!showForgotUsername && !showForgotPassword && (
          <SignIn.Root>
            <SignIn.Step
              name="start"
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
              onSubmit={() => setSigningIn(true)}
              onError={() => setSigningIn(false)}
            >
              <div className="bg-gradient-to-r from-[#047857] to-[#059669] px-8 py-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Welcome Back</h2>
                </div>
                <p className="text-green-100 text-sm">Sign in to access your account</p>
              </div>

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
                    <div className="flex justify-end mt-2 text-sm space-x-4">
                      <button onClick={() => setShowForgotUsername(true)} className="text-[#047857] hover:underline">
                        Forgot Username?
                      </button>
                      <button onClick={() => setShowForgotPassword(true)} className="text-[#047857] hover:underline">
                        Forgot Password?
                      </button>
                    </div>
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

                <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500 flex justify-center gap-4">
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
            </SignIn.Step>
          </SignIn.Root>
        )}

        {/* Forgot Username Section */}
        {showForgotUsername && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
            <h2 className="text-xl font-semibold text-[#047857]">Recover Username</h2>
            <p className="text-sm text-gray-600">Enter your CNIC to retrieve your username.</p>
            <input
              type="text"
              value={cnic}
              onChange={(e) => setCnic(e.target.value)}
              placeholder="12345-6789012-3"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
            />
            <div className="flex justify-between">
              <button onClick={() => setShowForgotUsername(false)} className="text-sm text-gray-500 hover:underline">
                Back to Login
              </button>
              <button
                onClick={handleRecoverUsername}
                disabled={recoveryLoading}
                className="bg-[#047857] hover:bg-[#04694d] text-white px-4 py-2 rounded-lg text-sm"
              >
                {recoveryLoading ? "Sending..." : "Recover Username"}
              </button>
            </div>
          </div>
        )}

        {/* Forgot Password Section */}
        {showForgotPassword && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
          <h2 className="text-xl font-semibold text-[#047857]">Recover Password</h2>
          <p className="text-sm text-gray-600">
            Enter your <span className="font-medium text-gray-700">Roll Number</span> to recover your password.
          </p>

          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter your Roll No (e.g., UIN825666)"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
          />

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="text-sm text-gray-500 hover:underline"
            >
              Back to Login
            </button>

            <button
              onClick={handleResetPassword}
              disabled={recoveryLoading}
              className="bg-[#047857] hover:bg-[#04694d] text-white px-4 py-2 rounded-lg text-sm transition duration-200"
            >
              {recoveryLoading ? "Sending..." : "Recover Password"}
            </button>
          </div>
        </div>

        )}

        {/* Footer */}
        {!showForgotUsername && !showForgotPassword && (
          <>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-700">
                Don’t have an account?{" "}
                <a href="/registration-form" className="text-[#047857] font-medium underline hover:opacity-90">
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
          </>
        )}
      </div>
    </div>
  )
}
