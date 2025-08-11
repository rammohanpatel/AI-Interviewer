import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { db } from "@/firebase/admin";
import { getInterviewCover } from "@/lib/utils";

const InterviewDetailsSchema = z.object({
  role: z.string(),
  level: z.enum(["Junior", "Mid-Level", "Senior"]),
  type: z.enum(["Technical", "Behavioral", "Mixed"]),
  techstack: z.array(z.string()),
  amount: z.number().min(1).max(20)
});

export async function POST(request: Request) {
  try {
    const { conversation, userId } = await request.json();

    if (!conversation || !userId) {
      return Response.json(
        { success: false, error: "Missing conversation or userId" },
        { status: 400 }
      );
    }

    // Extract structured interview details from the conversation
    const { object: interviewDetails } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: InterviewDetailsSchema,
      prompt: `Analyze this conversation between an AI interviewer and a user to extract interview details.
        Extract the following information:
        - role: The job role/position the user wants to interview for
        - level: Experience level (Junior, Mid-Level, or Senior)
        - type: Interview focus (Technical, Behavioral, or Mixed)
        - techstack: Array of technologies/skills mentioned
        - amount: Number of questions requested (default to 5 if not specified)

        Conversation:
        ${conversation}

        Return the extracted details in the specified format. If any information is not clearly stated, make reasonable assumptions based on the context.`
    });

    // Create the interview in the database
    const interview = {
      role: interviewDetails.role,
      type: interviewDetails.type,
      level: interviewDetails.level,
      techstack: interviewDetails.techstack,
      questions: [], // Will be populated when generating questions
      userId: userId,
      finalized: false, // Not finalized until questions are generated
      coverImage: getInterviewCover(),
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection("interviews").add(interview);

    // Now generate the questions
    const { object: questionObject } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: z.object({
        questions: z.array(z.string())
      }),
      prompt: `Generate exactly ${interviewDetails.amount} interview questions for a ${interviewDetails.level} ${interviewDetails.role} position.
        Focus: ${interviewDetails.type}
        Tech stack: ${interviewDetails.techstack.join(", ")}
        
        Return questions that are:
        - Appropriate for the experience level
        - Relevant to the tech stack
        - Balanced between technical and behavioral based on the type
        - Clear and concise for voice-based interviews
        - Free of special characters that might break voice assistants`
    });

    // Update the interview with questions and mark as finalized
    await db.collection("interviews").doc(docRef.id).update({
      questions: questionObject.questions,
      finalized: true
    });

    return Response.json({
      success: true,
      interviewId: docRef.id,
      details: interviewDetails
    });

  } catch (error) {
    console.error("Error extracting interview details:", error);
    return Response.json(
      { success: false, error: "Failed to extract interview details" },
      { status: 500 }
    );
  }
}
