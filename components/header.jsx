"use client";
import React from 'react'
import Image from "next/image";
import Link from "next/link";
import {  SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from './ui/button';
import { Authenticated, Unauthenticated } from 'convex/react';


const header = () => {
  return (
    <>
    <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-xl z-20 border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}

          <Link href="/" className="flex items-center">
            <Image
              src="/spott.png"
              alt="Spott logo"
              width={500}
              height={500}
              className="w-full h-11"
              priority
            />
            {/* <span className="text-purple-500 text-2xl font-bold">spott*</span> */}
            {/* {hasPro && (
              <Badge className="bg-linear-to-r from-pink-500 to-orange-500 gap-1 text-white ml-3">
                <Crown className="w-3 h-3" />
                Pro
              </Badge>
            )} */}
          </Link>

 {/* Right Side Actions */}
     <div className='flex items-center'>

      <Authenticated>
        {/* create event */}
              <UserButton />
            </Authenticated>
<Unauthenticated>
              <SignInButton mode="modal">
                <Button size="sm">Sign In</Button>
              </SignInButton>
              
            </Unauthenticated>
            
     </div>

          </div>
          </nav>

    </>
  )
}

export default header