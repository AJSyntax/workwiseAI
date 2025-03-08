"use client"

import { useState } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Star } from "lucide-react"

interface RatingReviewProps {
  projectId: string
  recipientId: string
  userRole: string
}

export function RatingReview({ projectId, recipientId, userRole }: RatingReviewProps) {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const { data, error } = await supabase.from("reviews").insert({
        project_id: projectId,
        reviewer_id: user?.id,
        recipient_id: recipientId,
        rating,
        review,
        reviewer_role: userRole,
      })

      if (error) throw error

      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully.",
      })

      // Update the project status to completed if both parties have reviewed
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("project_id", projectId)

      if (reviewsError) throw reviewsError

      if (reviewsData.length >= 2) {
        const { error: projectError } = await supabase
          .from("projects")
          .update({ status: "completed" })
          .eq("id", projectId)

        if (projectError) throw projectError
      }

      setRating(0)
      setReview("")
    } catch (error: any) {
      toast({
        title: "Error submitting review",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Rate and Review</h3>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `${rating} out of 5 stars` : "Select a rating"}
        </span>
      </div>
      <Textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder={`Write a review for the ${userRole === "employer" ? "freelancer" : "client"}`}
        className="h-24"
      />
      <Button onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  )
}

