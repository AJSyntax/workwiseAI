"use client"

import type React from "react"

import { useState } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X, FileText } from "lucide-react"

interface FileUploadProps {
  projectId: string
  onUploadComplete?: (fileUrl: string, fileName: string) => void
}

export function FileUpload({ projectId, onUploadComplete }: FileUploadProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string }[]>([])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    const fileExt = file.name.split(".").pop()
    const fileName = `${projectId}/${Math.random().toString(36).substring(2)}.${fileExt}`

    setUploading(true)

    try {
      const { data, error } = await supabase.storage.from("project-files").upload(fileName, file)

      if (error) {
        throw error
      }

      const { data: urlData } = supabase.storage.from("project-files").getPublicUrl(fileName)

      const fileUrl = urlData.publicUrl

      setUploadedFiles([...uploadedFiles, { url: fileUrl, name: file.name }])

      if (onUploadComplete) {
        onUploadComplete(fileUrl, file.name)
      }

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Reset the input
      e.target.value = ""
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles]
    newFiles.splice(index, 1)
    setUploadedFiles(newFiles)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById("file-upload")?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload File"}
          <Upload className="ml-2 h-4 w-4" />
        </Button>
        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded Files:</p>
          <ul className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between rounded-md border p-2">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {file.name}
                  </a>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

