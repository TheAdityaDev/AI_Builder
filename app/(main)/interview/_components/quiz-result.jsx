import { Button } from '@/components/ui/button'
import { CardContent, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Trophy, XCircle } from 'lucide-react'
import React from 'react'

const QuizResult = ({ result, hideStartNew = false, onStartNew }) => {

    if (!result) return null
    return (
        <div className='mx-auto'>
            <h1 className='flex items-center gap-2 text-3xl gradient-title'>
                <Trophy className='h-7 w-7 text-yellow-500' />
                Quiz Result
            </h1>
            {/* Score Overview */}
            <CardContent>
                <div className='text-center space-y-2'>
                    <h3>Your Score:{result.quizScore.toFixed(1)}% </h3>
                    <Progress value={result.quizScore} className="w-full" />
                </div>

                {/* Improvement Tips */}
                {result.improvementTip && (
                    <div className='bg-muted p-4 rounded-lg mt-4'>
                        <p className='font-medium'>Improvement Tips:</p>
                        <p className='text-muted-foreground '>{result.improvementTip}</p>
                    </div>
                )}

                <div className='space-y-4'>
                    <h3 className='font-medium mt-4'>Questions Review.</h3>
                    {result.questions.map((q, index) => (
                        <div className='border rounded-lg p-4 space-y-2 mt-4' key={index}>
                            <div className='flex items-center justify-between gap-3'>
                                <p className='font-medium'>{q.questions}</p>
                                {q.isCorrect ? (
                                    <CheckCircle2 className='h-5 w-5 text-green-500' />
                                ) : (
                                    <XCircle className='h-5 w-5 text-red-500' />
                                )}
                            </div>
                            <div>
                                <p>Your Answer:{q.userAnswer}</p>
                                {!q.isCorrect && <p>Correct Anser:{q.answer}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>

            {!hideStartNew && (
                <CardFooter >
                    <Button onClick={onStartNew} className="w-full  mt-4 cursor-pointer">
                        Start New Quiz
                    </Button>
                </CardFooter>
            )}
        </div>

    )
}

export default QuizResult