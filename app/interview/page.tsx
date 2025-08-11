import InterviewForm from "@/components/InterviewForm";
import { getCurrentUser } from "@/lib/actions/auth.action";

export default async function Page() {
    const user = await getCurrentUser();

    return (
        <InterviewForm 
          userId={user?.id || ''} 
          userName={user?.name || ''} 
        />
    );
}