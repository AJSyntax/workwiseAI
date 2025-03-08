'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface SkillTest {
  id: string
  name: string
  description: string
  duration: number
  questions: number
}

const availableTests: SkillTest[] = [
  {
    id: "web-dev",
    name: "Web Development",
    description: "Test your knowledge of HTML, CSS, and JavaScript",
    duration: 30,
    questions: 20,
  },
  {
    id: "react",
    name: "React",
    description: "Assess your React and modern frontend development skills",
    duration: 45,
    questions: 25,
  },
  {
    id: "node",
    name: "Node.js",
    description: "Evaluate your Node.js and backend development expertise",
    duration: 40,
    questions: 22,
  },
]

export default function SkillsPage() {
  const [currentTest, setCurrentTest] = useState<SkillTest | null>(null)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const startTest = (test: SkillTest) => {
    setCurrentTest(test)
    setProgress(0)
    // Here you would typically fetch the actual test questions from your backend
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, (test.duration * 1000) / 100)
  }

  const submitAnswer = () => {
    if (!currentTest) return

    const newProgress = Math.min(progress + 100 / currentTest.questions, 100)
    setProgress(newProgress)

    if (newProgress === 100) {
      toast({
        title: "Test Completed",
        description: `You've completed the ${currentTest.name} skill test!`,
      })
      setCurrentTest(null)
    }
  }

  if (currentTest) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>{currentTest.name} Assessment</CardTitle>
            <CardDescription>Time remaining: {Math.ceil((currentTest.duration * (100 - progress)) / 100)} seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-4" />
            <div className="space-y-4">
              {/* Here you would render the actual test questions */}
              <p>Test questions would be displayed here...</p>
              <Button onClick={submitAnswer}>Submit Answer</Button>
            </div>
            <Button
              className="mt-4"
              variant="secondary"
              onClick={() => {
                setCurrentTest(null)
                setProgress(0)
              }}
            >
              Cancel Test
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Skill Assessments</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableTests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <CardTitle>{test.name}</CardTitle>
              <CardDescription>{test.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{test.duration} mins</Badge>
                <Badge variant="secondary">{test.questions} questions</Badge>
              </div>
              <Button onClick={() => startTest(test)}>Start Assessment</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
