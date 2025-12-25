"use client";
import React, { useState } from 'react'
import Image from "next/image";
import Link from "next/link";
import {  SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from './ui/button';
import { Authenticated, Unauthenticated } from 'convex/react';
import { BarLoader } from 'react-spinners';
import { useStoreUser } from '@/hooks/use-store-user';
import { Building, Plus, Ticket } from 'lucide-react';


const Header = () => {

 const { isLoading } = useStoreUser();
 const [showUpgradeModal, setShowUpgradeModal] = useState(false);


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
          {/* search and location */}

 {/* Right Side Actions */}
     <div className='flex items-center'>
      <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUpgradeModal(true)}
              >
                Pricing
              </Button>

              <Button variant="ghost" size="sm" asChild className={"mr-2"}>
              <Link href="/explore">Explore</Link>
            </Button>

      <Authenticated>
        {/* create event */}
                  <Button size="sm" asChild className="flex gap-2 mr-4">
                <Link href="/create-event">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Event</span>
                </Link>
              </Button>


             {/* User Button */}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="My Tickets"
                    labelIcon={<Ticket size={16} />}
                    href="/my-tickets"
                  />
                  <UserButton.Link
                    label="My Events"
                    labelIcon={<Building size={16} />}
                    href="/my-events"
                  />
                  <UserButton.Action label="manageAccount" />
                </UserButton.MenuItems>
              </UserButton>
            </Authenticated>
<Unauthenticated>
              <SignInButton mode="modal">
                <Button size="sm">Sign In</Button>
              </SignInButton>
              
            </Unauthenticated>
            
     </div>

      </div>
{/* {loader} */}
           {isLoading && (
          <div className="absolute bottom-0 left-0 w-full">
            <BarLoader width={"100%"} color="#a855f7" />
          </div>
        )}
          </nav>

          {/* modals */}

    </>
  )
}

export default Header