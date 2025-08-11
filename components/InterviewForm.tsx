"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface InterviewFormProps {
  userId: string;
  userName: string;
}

const InterviewForm = ({ userId, userName }: InterviewFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    role: "",
    level: "Junior" as "Junior" | "Mid-Level" | "Senior",
    type: "Technical" as "Technical" | "Behavioral" | "Mixed",
    techstack: "",
    amount: 5
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role.trim()) {
      toast.error("Please enter a job role");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/vapi/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          techstack: formData.techstack.split(',').map(tech => tech.trim()).filter(Boolean),
          userid: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.interviewId) {
          toast.success("Interview created successfully!");
          router.push(`/interview/${data.interviewId}`);
        } else {
          toast.error("Failed to create interview");
        }
      } else {
        toast.error("Failed to create interview");
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your AI Interview
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Prepare for your dream job with personalized AI-powered interview practice
          </p>
        </div>

        {/* Form Card */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Job Role Field */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8a2 2 0 012-2V6" />
                  </svg>
                  Job Role *
                </Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Frontend Developer, Data Scientist, Product Manager"
                  className="h-12 text-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                  required
                />
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience Level */}
                <div className="space-y-2">
                  <Label htmlFor="level" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Experience Level
                  </Label>
                  <select
                    id="level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as typeof formData.level })}
                    className="w-full h-12 px-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-white dark:bg-gray-700 transition-all duration-200"
                  >
                    <option value="Junior">🌱 Junior (0-2 years)</option>
                    <option value="Mid-Level">🚀 Mid-Level (2-5 years)</option>
                    <option value="Senior">⭐ Senior (5+ years)</option>
                  </select>
                </div>

                {/* Interview Focus */}
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Interview Focus
                  </Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
                    className="w-full h-12 px-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-white dark:bg-gray-700 transition-all duration-200"
                  >
                    <option value="Technical">💻 Technical</option>
                    <option value="Behavioral">🧠 Behavioral</option>
                    <option value="Mixed">🔄 Mixed</option>
                  </select>
                </div>
              </div>

              {/* Tech Stack Field */}
              <div className="space-y-2">
                <Label htmlFor="techstack" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Tech Stack
                </Label>
                <Input
                  id="techstack"
                  value={formData.techstack}
                  onChange={(e) => setFormData({ ...formData, techstack: e.target.value })}
                  placeholder="React, Node.js, Python, AWS, Docker..."
                  className="h-12 text-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Enter technologies separated by commas
                </p>
              </div>

              {/* Number of Questions */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  Number of Questions
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 5 })}
                    className="h-12 text-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200 pr-20"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                    1-20
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Your Interview...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Interview
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Bottom Info */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ✨ AI-powered questions tailored to your role and experience level
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewForm;
