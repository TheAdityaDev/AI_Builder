"use client"

import useFetch from '@/hooks/use-fetch';
import React, { useEffect, useState } from 'react'
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { BarLoader } from 'react-spinners';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import QuizResult from './quiz-result';

const Quiz = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [showExplanation, setShowExplanation] = useState(false)

    const {
        loading: generatingQuiz,
        fn: generateQuizFn,
        data: quizData,
    } = useFetch(generateQuiz);

    const {
        loading: savingResult,
        fn: saveQuizResultFn,
        data: resultData,
        setData: setResultData,
    } = useFetch(saveQuizResult)

    console.log(resultData);

    useEffect(() => {
        if (quizData) {
            setAnswers(new Array(quizData.length).fill(null))
        }
    }, [quizData])

    const handleNext = () => {
        if (currentQuestion + 1 < quizData.length) {
            setCurrentQuestion(currentQuestion + 1)
            setShowExplanation(false)
        } else {
            finishQuiz()
        }
    }


    const calculateScore = () => {
        let correct = 0
        answers.forEach((answer, index) => {
            if (answer === quizData[index].correctAnswer) {
                correct++
            }
        })
        return (correct / quizData.length) * 100
    }
    const finishQuiz = async () => {
        let score = calculateScore()
        try {
            await saveQuizResultFn(quizData, answers, score)
            toast.success("Quiz complete successfully")
        } catch (error) {
            toast.error(error.message || "Error to save quiz")
        }
    }

    const handleAnswer = (answer) => {
        const newAnswer = [...answers]
        newAnswer[currentQuestion] = answer
        setAnswers(newAnswer)
    }
    const startNewQuiz = () => {
        setCurrentQuestion(0)
        setAnswers([])
        setShowExplanation(false)
        generateQuizFn()
        setResultData(null)
    }


    if (generatingQuiz) {
        return <BarLoader size={50} color="gray" className='mt-4' width={"100%"} />
    }

    if (resultData) {
        return (
            <div>
                <QuizResult result={resultData} onStartNew={startNewQuiz} />
            </div>
        )
    }
    if (!quizData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Ready to test your knowledge?</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This quiz contains 10 questions specific to your industry and skills.Take your time and choose the best answer for each question.</p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full cursor-pointer" onClick={generateQuizFn}>Start Quiz</Button>
                </CardFooter>
            </Card>

        )
    }
    const question = quizData[currentQuestion]
    return <Card>
        <CardHeader>
            <CardTitle>Question {currentQuestion + 1} of {quizData.length}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className='text-white text-lg'>{question.question}</p>
            < RadioGroup className="space-y-2" onValueChange={handleAnswer} value={answers[currentQuestion]} >
                {
                    question.options.map((option, index) => {
                        return (
                            <div className="flex items-center space-x-2" key={index}>
                                <RadioGroupItem value={option} id={`option:${index}`} />
                                <Label htmlFor={`option:${index}`}>{option}</Label>
                            </div>
                        )
                    })
                }
            </RadioGroup >
            {showExplanation && <div className='mt-4 p-4 bg-muted rounded-lg'>
                <p className='font-medium'>Explanation:</p>
                <p className='text-muted-foreground'>{question.explanation}</p>
            </div>}
        </CardContent >
        <CardFooter>
            {!showExplanation && (
                <Button onClick={() =>
                    setShowExplanation(true)}
                    variant="outline"
                    disabled={!answers[currentQuestion]
                    }

                >Show Explanation
                </Button>
            )}

            <Button onClick={() =>
                handleNext()}
                className="ml-auto cursor-pointer"
                disabled={!answers[currentQuestion] || savingResult
                }
            >
                {savingResult &&
                    (<BarLoader size={50} color="gray" className='mt-4' width={"100%"} />)}
                {currentQuestion < quizData.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
        </CardFooter>
    </Card >

}

export default Quiz