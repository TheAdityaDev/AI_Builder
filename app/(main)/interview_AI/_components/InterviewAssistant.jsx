'use client';

import { useState, useRef } from 'react';
import { Download, Volume2, Pause, Mic } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

export default function InterviewAssistant() {
    const [interviewType, setInterviewType] = useState('technical');
    const [isLoading, setIsLoading] = useState(false);
    const [interviewState, setInterviewState] = useState(null);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const audioRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    const startInterview = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/interview_AI/pages/api/interview/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: 'current-user-id', // Replace with actual user ID
                    interviewType
                })
            });

            const data = await response.json();
            setInterviewState(data);

            // Play the audio question
            if (audioRef.current) {
                audioRef.current.src = data.audioUrl;
                audioRef.current.play();
            }
        } catch (error) {
            console.error('Error starting interview:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const submitAnswer = async () => {
        if (!interviewState || !currentAnswer) return;

        setIsLoading(true);
        try {
            // Save answer to database
            await fetch('pages/api/interview/answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    questionId: interviewState.currentQuestionId,
                    answer: currentAnswer
                })
            });

            // Get feedback on answer
            const feedbackResponse = await fetch('pages/api/interview/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: interviewState.currentQuestion,
                    answer: currentAnswer
                })
            });

            const feedbackData = await feedbackResponse.json();
            setFeedback(feedbackData);

            // Move to next question if available
            if (interviewState.remainingQuestions.length > 0) {
                const nextQuestion = interviewState.remainingQuestions[0];
                const newRemaining = interviewState.remainingQuestions.slice(1);

                // Generate audio for next question
                const audioResponse = await fetch('/api/interview/generate-speech', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: nextQuestion
                    })
                });

                const audioData = await audioResponse.json();

                setInterviewState(prev => ({
                    ...prev,
                    currentQuestion: nextQuestion,
                    currentQuestionId: audioData.questionId,
                    remainingQuestions: newRemaining,
                    audioUrl: audioData.audioUrl
                }));

                setCurrentAnswer('');
                setFeedback(null);

                // Play next question
                if (audioRef.current) {
                    audioRef.current.src = audioData.audioUrl;
                    audioRef.current.play();
                }
            } else {
                // Interview completed
                const completionResponse = await fetch('/api/interview/complete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        interviewId: interviewState.interviewId
                    })
                });

                const completionData = await completionResponse.json();
                setFeedback(completionData.overallFeedback);
                setInterviewState(prev => ({ ...prev, isCompleted: true }));
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                setIsRecording(true);
                mediaRecorderRef.current = new MediaRecorder(stream);
                mediaRecorderRef.current.start();

                const audioChunks = [];
                mediaRecorderRef.current.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                mediaRecorderRef.current.addEventListener("stop", () => {
                    const audioBlob = new Blob(audioChunks);
                    const audioUrl = URL.createObjectURL(audioBlob);
                    // Here you would send this audio to your backend for processing
                    console.log('Audio recorded:', audioUrl);
                });
            });
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const downloadTranscript = async (format) => {
        if (!interviewState) return;

        try {
            const response = await fetch('/api/interview/transcript', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    interviewId: interviewState.interviewId,
                    format
                })
            });

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `interview-transcript.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading transcript:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <audio ref={audioRef} />

            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Interview Preparation Assistant</CardTitle>
                    <CardDescription>
                        Practice your interview skills with AI-powered feedback
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {!interviewState ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Interview Type</label>
                                <select
                                    value={interviewType}
                                    onChange={(e) => setInterviewType(e.target.value)}
                                    className="w-full p-2 border rounded py-2 px-4 + text-black bg-white"
                                >
                                    <option value="technical">Technical</option>
                                    <option value="behavioral">Behavioral</option>
                                    <option value="system-design">System Design</option>
                                    <option value="product-management">Product Management</option>
                                </select>
                            </div>

                            <Button onClick={startInterview} disabled={isLoading}>
                                {isLoading ? 'Starting...' : 'Start Interview'}
                            </Button>
                        </div>
                    ) : (
                        <>
                            {interviewState.isCompleted ? (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">Interview Completed!</h3>
                                    {feedback && (
                                        <div className="bg-gray-50 p-4 rounded">
                                            <h4 className="font-medium mb-2">Overall Feedback:</h4>
                                            <p>{feedback}</p>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Button onClick={() => downloadTranscript('pdf')}>
                                            <Download className="mr-2 h-4 w-4" /> Download PDF
                                        </Button>
                                        <Button variant="outline" onClick={() => downloadTranscript('docx')}>
                                            <Download className="mr-2 h-4 w-4" /> Download DOCX
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <h3 className="font-medium">Question:</h3>
                                        <p className="text-lg">{interviewState.currentQuestion}</p>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => audioRef.current.play()}>
                                                <Volume2 className="mr-2 h-4 w-4" /> Replay Question
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="font-medium">Your Answer:</label>
                                        <Textarea
                                            value={currentAnswer}
                                            onChange={(e) => setCurrentAnswer(e.target.value)}
                                            placeholder="Type your answer here..."
                                            rows={5}
                                        />
                                        <div className="flex gap-2">
                                            {isRecording ? (
                                                <Button variant="outline" onClick={stopRecording}>
                                                    <Pause className="mr-2 h-4 w-4" /> Stop Recording
                                                </Button>
                                            ) : (
                                                <Button variant="outline" onClick={startRecording}>
                                                    <Mic className="mr-2 h-4 w-4" /> Record Answer
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {feedback && (
                                        <div className="bg-blue-50 p-4 rounded">
                                            <h4 className="font-medium mb-2">Feedback:</h4>
                                            <p>{feedback}</p>
                                        </div>
                                    )}

                                    <Progress
                                        value={
                                            ((interviewState.remainingQuestions.length + 1) /
                                                (interviewState.remainingQuestions.length + 1 + interviewState.questionsAnswered)) * 100
                                        }
                                    />
                                    <div className="text-sm text-gray-500">
                                        Question {interviewState.questionsAnswered + 1} of{' '}
                                        {interviewState.questionsAnswered + interviewState.remainingQuestions.length + 1}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </CardContent>

                {interviewState && !interviewState.isCompleted && (
                    <CardFooter className="flex justify-end">
                        <Button onClick={submitAnswer} disabled={isLoading || !currentAnswer}>
                            {isLoading ? 'Processing...' : 'Submit Answer'}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}