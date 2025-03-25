"use client"
import React,{useState} from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import Image from 'next/image'
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
        <div className='card-border lg:min-w-[566px]'>
            <div className="flex flex-col gap-6 card py-14 px-10">
                <div className='flex flex-row gap-2 justify-center'>
                    <Image src="/logo.svg" width={100} height={100} alt="logo" />
                    <h2 className='text-primary-100'>AI Interviewer</h2>
                </div>
                <h3>
                    Practice your interview skills with AI Interviewer
                </h3>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
                        {type==="sign-up" && (
                            <FormField
                            control={form.control}
                            name="name"
                            label="Name"
                            placeholder="Your Name"
                            type="text"
                          />
                        )}
                        <FormField
                            control={form.control}
                            name="email"
                            label="Email"
                            placeholder="Enter Email"
                            type="email"
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            label="Password"
                            placeholder="Enter Password"
                            type="password"
                        />

                        <Button type="submit" className='btn'>
                            { isLoading===true ?
                                ( <span className="animate-spin rounded-full h-8 w-8  border-t-2 border-b-2 border-blue-900 " />)
                                :
                                ( type === "sign-up" ? "Sign Up" : "Sign In"
                            )}
                        </Button>
                    </form>
                </Form>
                <p className='text-center'>
                    {type === "sign-up" ? "Already have an account? " : "Don't have an account? "}
                    <Link href={type === "sign-up" ? "/sign-in" : "/sign-up"} className='text-blue-500' >{type === "sign-up" ? "Sign In" : "Sign Up"}</Link>
                </p>
            </div>
        </div>
    )
}

export default AuthForm
