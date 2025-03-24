import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

export default async function Page() {
    const user = await getCurrentUser();

    return (
        <>
          <h3> Interview generation</h3>
          <Agent 
            user = {user?.name}
            userId = {user?.id}
            // profileImage = {user?.profileURL}
            type="generate"
           />
        </>
    )
}