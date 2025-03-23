"use server"
import {auth,db} from "@/firebase/admin"
import {cookies} from "next/headers"

const SESSION_DURATION = 60*60*24*7; // One week

export async function setSessionCookie(idToken:string){
    const cookieStore = await cookies();
    const sessionCookie = await auth.createSessionCookie(idToken,{
        expiresIn : SESSION_DURATION*1000,
    })

    cookieStore.set("session",sessionCookie,{
        maxAge:SESSION_DURATION,
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        path:'/',
        sameSite:"lax"
    });
}

export async function signUp(params:SignUpParams){
    const {uid, name, email} = params;

    try {
        const userRecord = await db.collection("users").doc(uid).get();
        if(userRecord.exists){
            return {
                success:false,
                message:"User already exists."
            }
        };

        await db.collection("users").doc(uid).set({
            name,
            email
        })

        return {
            success:true,
            message: 'Account created successfully'
        };

    } catch (error:any) {
        console.error("Error creating user : ",error);

        if(error.code==="auth/email-already-exists"){
            return {
                success:false,
                message:"Email already exists"
            }
        }

        return {
            success:false,
            message:"Failed to create account. Please Try again"
        }
    }
}

export async function signIn(params:SignInParams){
    const {email,idToken} = params;

    try {
        const userRecord = await auth.getUserByEmail(email);
        if(!userRecord){
            return {
                success:false,
                message:"User doesn't exist. Please sign-up"
            }
        }

        await setSessionCookie(idToken);

        return {
            success: true,
            message:'Signed in successfully'
        }


    } catch (error:any) {
        console.error("Error in sign-in :",error);

        return {
            success:false,
            message: "Failed to sign-in. Please try again"
        }
    }
}

export async function signOut(){
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

export async function getCurrentUser():Promise<User | null>{
    const cookieStore = await cookies();

    const sessionCookie = cookieStore.get("session")?.value;

    if(!sessionCookie) return null;

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie,true);

        const userRecord = await db.collection("users").doc(decodedClaims.uid).get();
        if(!userRecord) return null;

        return {
            ...userRecord.data(),
            id:userRecord.id,
        } as User
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function isAuthenticated(){
    const user = await getCurrentUser();
    return !!user; // Trick to return boolean based on string
                   // e.g. user = "ram" -> !user = F -> !!user = T
}