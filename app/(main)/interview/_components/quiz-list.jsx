"use client"

import { useRouter } from 'next/navigation'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"


import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Brain } from 'lucide-react'
import { format } from 'date-fns'
import { AlertDialog } from '@radix-ui/react-alert-dialog'
import QuizResult from './quiz-result'

const QuizList = ({ assessment }) => {
    const router = useRouter()
    const [selectedQuiz, setSelectedQuiz] = useState(null)
    return (
        <>
            <Card className="mt-3">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="gradient-title text-3xl md:text-4xl">Recent Quiz</CardTitle>
                        <CardDescription>Review your past quiz performance.</CardDescription>
                    </div>
                    <Button onClick={() => router.push("/interview/mock")} className="cursor-pointer">New Quiz <Brain className='h-4 w-4 text-muted-foreground ' color='black' /> </Button>
                </CardHeader>
                <CardContent>
                    <div>
                        {assessment.map((assessment, i) => {
                            return (
                                <Card key={assessment.id} className="mt-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedQuiz(assessment)}>
                                    <CardHeader>
                                        <CardTitle>Quiz {i + 1}</CardTitle>
                                        <CardDescription className="flex items-center justify-between">
                                            <div>Score : {assessment.quizScore.toFixed(1)}%</div>
                                            <div>{format(new Date(assessment.createdAt), "MMMM dd, yyyy HH:mm")}</div>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className='text-muted-foreground text-sm'>{assessment.improvementTip}</p>
                                    </CardContent>
                                </Card>

                            )
                        })}
                    </div>
                </CardContent>
            </Card >

            {/* Dialog box */}
            <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)} >
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                    </DialogHeader>
                    <QuizResult result={selectedQuiz} onStartNew={() => { router.push("/interview/mock") }} hideStartNew />
                </DialogContent>
            </Dialog>

        </>
    )
}

export default QuizList