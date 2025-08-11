import React from 'react'

const layout = ({children}:{children:React.ReactNode}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default layout
