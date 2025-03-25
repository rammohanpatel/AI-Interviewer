import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import Image from "next/image";
import Link from "next/link";

export default async function Page() {
    const user = await getCurrentUser();

    return (
        <>
          <h3> Interview generation</h3>
          <Agent 
            userName = {user?.name || ''}
            userId = {user?.id}
            // profileImage = {user?.profileURL}
            type="generate"
           />
        </>
    )
}