"use client"
import React,{useState} from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import Logo from './Logo'
import Link from 'next/link'
import { Form } from "./ui/form"
import FormField from './FormField'
import {useRouter} from 'next/navigation'
import {toast} from "sonner"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import {auth} from '@/firebase/client'
import {signUp,signIn} from "@/lib/actions/auth.action"

const authFormSchema = (type:FormType) => z.object({
    name: type=== "sign-up" ? z.string().min(2).max(50) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6).max(50)
})

const AuthForm = ({ type }: { type: FormType }) => {
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const formSchema = authFormSchema(type);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email:"",
            password:""
        },
    })

    const onSubmit  = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            if(type==="sign-up"){
                const { name,email,password} = data;

                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                )

                const result = await signUp({
                    uid: userCredential.user.uid,
                    name:name!,
                    email,
                    password
                });

                if(!result?.success){
                    toast.error(result?.message);
                    return;
                }

                console.log("Sign-up : ",data);
                toast.success("Sign-up successful")
                router.push('/sign-in');
            }
            else{
                const {email,password} = data;

                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                )

                const idToken = await userCredential.user.getIdToken();

                if(!idToken){
                    toast.error("Failed to sign-in. Please try again");
                    return;
                }

                const result  = await signIn({
                    email,
                    idToken
                })

                if(!result.success){
                    toast.error(result.message);
                    return;
                }

                console.log("Sign-in : ",data);
                toast.success("Sign-in successful")
                router.push('/');
            }
        } catch (error:any) {
            console.error(error);
            if(error.code === "auth/invalid-credential"){
                toast.error("Invalid credentials. Please try again");
            }
            else if(error.code === "auth/email-already-in-use"){
                toast.error("Email already in use. Please try with another email");
            }
            else{
                toast.error("Something went wrong. Please try again");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='flex items-center justify-center p-4'>
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-md transform hover:scale-[1.02] transition-all duration-300">
                {/* Header with enhanced styling */}
                <div className="flex flex-col items-center gap-6 mb-8">
                    <div className="relative">
                        <div className="relative">
                            <Logo size="xl" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                            {type === "sign-up" ? "Create Your Account" : "Welcome Back"}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Practice your interview skills with AI-powered feedback
                        </p>
                    </div>
                </div>

                {/* Form with enhanced styling */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {type==="sign-up" && (
                            <div className="space-y-2">
                                <FormField
                                control={form.control}
                                name="name"
                                label="Full Name"
                                placeholder="Enter your full name"
                                type="text"
                              />
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <FormField
                                control={form.control}
                                name="email"
                                label="Email Address"
                                placeholder="Enter your email"
                                type="email"
                            />
                        </div>

                        <div className="space-y-2">
                            <FormField
                                control={form.control}
                                name="password"
                                label="Password"
                                placeholder="Enter your password"
                                type="password"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className='w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6'
                            disabled={isLoading}
                        >
                            { isLoading===true ?
                                ( 
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {type === "sign-up" ? "Creating Account..." : "Signing In..."}
                                    </div>
                                )
                                :
                                ( 
                                    <div className="flex items-center justify-center gap-2">
                                        {type === "sign-up" ? (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                </svg>
                                                Create Account
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                </svg>
                                                Sign In
                                            </>
                                        )}
                                    </div>
                                )}
                        </Button>
                    </form>
                </Form>

                {/* Footer with enhanced styling */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className='text-center text-gray-600 dark:text-gray-400'>
                        {type === "sign-up" ? "Already have an account? " : "Don't have an account? "}
                        <Link 
                            href={type === "sign-up" ? "/sign-in" : "/sign-up"} 
                            className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline transition-colors duration-200' 
                        >
                            {type === "sign-up" ? "Sign In" : "Sign Up"}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AuthForm
