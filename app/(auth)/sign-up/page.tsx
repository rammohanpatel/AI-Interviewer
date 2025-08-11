import AuthForm from '@/components/AuthForm'
import React from 'react'

const page = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <AuthForm type="sign-up" />
      </div>
    </div>
  )
}

export default page
