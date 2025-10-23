import React from 'react'
import Logo from "@/components/Logo";
import Link from "next/link";
import { isAuthenticated } from '@/lib/actions/auth.action';
import {redirect} from "next/navigation";

const layout = async ({children}:{children: React.ReactNode}) => {
    const isUserAuthenticated = await isAuthenticated();
    if(!isUserAuthenticated) redirect('/sign-in');
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900'>
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="group">
                <Logo size="md" className="group-hover:scale-105 transition-transform" />
              </Link>
            </div>
          </div>
        </nav>
        <div className="">
          {children}
        </div>
    </div>
  )
}

export default layout
