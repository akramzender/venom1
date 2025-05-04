'use client';

import React from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import LandingPageNavbar from "@/app/(website)/_components/navbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SignUpPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-gray-100">
      {/* Sign In Section */}
      <div className="flex flex-col items-center gap-6 bg-[#1e1e1e] p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-100"> <img
          src="/logo3.svg" // Replace with the actual path to your logo
          alt="Logo"
          width={64} // Width in pixels
          height={64} // Height in pixels
          className="mr-2"
        /></h2>

        {/* Clerk SignIn Component */}
        <div>
          <SignUp signInUrl="/auth/sign-in" afterSignUpUrl="/dashboard" />
        </div>

        {/* Sign In Button */}
        
      </div>
    </div>
  );
};

export default SignUpPage;