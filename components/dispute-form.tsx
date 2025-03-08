"use client"

import { useState } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { FileUpload } from "@/components/file-upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DisputeFormProps {
  projectId: string
}

export function DisputeForm({ projectId }: DisputeFormProps) {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [reason, setReason] = useState("")
  const [evidence, setEvidence] = useState("")
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason || !evidence) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const { data, error } = await supabase.from("disputes").insert({
        project_id: projectId,
        initiator_id: user?.id,
        reason,
        evidence,
        evidence_files: evidenceFiles,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Dispute submitted",
        description: "Your dispute has been submitted and will be reviewed by an admin.",
      })

      setReason("")
      setEvidence("")
      setEvidenceFiles([])
    } catch (error: any) {
      toast({
        title: "Error submitting dispute",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileUpload = (fileUrl: string) => {
    setEvidenceFiles([...evidenceFiles, fileUrl])
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Raise Dispute</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Raise a Dispute</DialogTitle>
          <DialogDescription>Provide details about the issue you're experiencing with this project.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason for Dispute
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe the issue"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="evidence" className="text-sm font-medium">
              Evidence
            </label>
            <Textarea
              id="evidence"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Provide detailed information to support your case"
              className="h-24"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Supporting Files</label>
            <FileUpload projectId={projectId} onUploadComplete={(fileUrl) => handleFileUpload(fileUrl)} />
          </div>
          <Button onClick={handleSubmit} className="w-full" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Dispute"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

