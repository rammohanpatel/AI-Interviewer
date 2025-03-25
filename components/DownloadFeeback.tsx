"use client"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface CategoryScore {
  name: string
  score: number
  comment: string
}

interface FeedbackData {
  totalScore: number
  categoryScores: CategoryScore[]
  strengths: string[]
  areasForImprovement: string[]
  finalAssessment: string
  createdAt: string
}

interface DownloadFeedbackProps {
  feedback: FeedbackData
  interviewId: string
}

const DownloadFeedback = ({ feedback, interviewId }: DownloadFeedbackProps) => {
  const handleDownload = () => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.setTextColor(33, 33, 33)
    doc.text("Interview Feedback Report", 14, 22)

    // Add date
    const date = new Date(feedback.createdAt)
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${formattedDate}`, 14, 30)
    doc.text(`Interview ID: ${interviewId}`, 14, 36)

    // Add overall score
    doc.setFontSize(16)
    doc.setTextColor(33, 33, 33)
    doc.text("Overall Performance", 14, 48)

    doc.setFontSize(24)
    const scoreColor =
      feedback.totalScore >= 8 ? [46, 204, 113] : feedback.totalScore >= 6 ? [241, 196, 15] : [231, 76, 60]
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
    doc.text(`${feedback.totalScore}/10`, 14, 58)

    // Add category scores
    doc.setFontSize(16)
    doc.setTextColor(33, 33, 33)
    doc.text("Category Scores", 14, 74)

    const categoryData = feedback.categoryScores.map((category) => [
      category.name,
      `${category.score}/10`,
      category.comment,
    ])

    autoTable(doc, {
      startY: 78,
      head: [["Category", "Score", "Feedback"]],
      body: categoryData,
      headStyles: { fillColor: [75, 85, 99] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 20 },
        2: { cellWidth: "auto" },
      },
    })

    // Get the last Y position after the table
    const finalY = (doc as any).lastAutoTable.finalY + 10

    // Add strengths
    doc.setFontSize(16)
    doc.setTextColor(33, 33, 33)
    doc.text("Strengths", 14, finalY)

    let strengthsY = finalY + 8
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)

    feedback.strengths.forEach((strength, index) => {
      doc.text(`• ${strength}`, 16, strengthsY)
      strengthsY += 7
    })

    // Add areas for improvement
    doc.setFontSize(16)
    doc.setTextColor(33, 33, 33)
    doc.text("Areas for Improvement", 14, strengthsY + 8)

    let areasY = strengthsY + 16
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)

    feedback.areasForImprovement.forEach((area, index) => {
      doc.text(`• ${area}`, 16, areasY)
      areasY += 7
    })

    // Add final assessment
    doc.setFontSize(16)
    doc.setTextColor(33, 33, 33)
    doc.text("Final Assessment", 14, areasY + 8)

    const finalAssessmentLines = doc.splitTextToSize(feedback.finalAssessment, 180)
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)
    doc.text(finalAssessmentLines, 14, areasY + 16)

    // Add footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text("AI Interviewer Platform", 14, doc.internal.pageSize.height - 10)
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10)
    }

    // Save the PDF
    doc.save(`interview-feedback-${interviewId}.pdf`)
  }

  return (
    <Button
      onClick={handleDownload}
      className="bg-indigo-600 cursor-pointer hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors flex-1 flex justify-center items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Download Report
    </Button>
  )
}

export default DownloadFeedback ;

