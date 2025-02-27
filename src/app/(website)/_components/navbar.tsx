import { Menu, User } from "lucide-react";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {};

const LandingPageNavbar = () => {
  return (
    <div className="flex w-full justify-between items-center">
        <div className="text-3xl font-semibold flex items-center gap-x-3">
            <Menu className="w-6 h-6" />
            <Image src="/channel.svg" alt="Venom" width={35} height={35} />
            Venom

        </div>
        <div className="hidden gap-x-10 items-center lg:flex">
            <Link href="/" className="
            bg-[#008068] py-2 px-4 rounded-full text-white hover:bg-[#008068]/90 transition-all duration-300"
            >Home</Link>
            <Link href="/">Pricing</Link>
            <Link href="/">Contact</Link>
        </div>
        <Link href="/auth/sign-in">
            <Button className="bg-[#ffffff] text-black hover:bg-[#ffffff]/90 transition-all duration-300 flex items-center gap-x-2">
                <User fill="#000" />
                Login
            </Button>
        </Link>
        
    </div>
  )
}

export default LandingPageNavbar;
