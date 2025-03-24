import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import Image from "next/image";
import Link from "next/link";

export default async function Page() {
    const user = await getCurrentUser();

    return (
        <div className="root-layout">
          <nav>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
            <h2 className="text-primary-100">AI Interviewer</h2>
          </Link>
        </nav>
          <h3> Interview generation</h3>
          <Agent 
            userName = {user?.name || ''}
            userId = {user?.id}
            // profileImage = {user?.profileURL}
            type="generate"
           />
        </div>
    )
}