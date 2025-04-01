"use client"
import { format, formatDate } from 'date-fns'
import { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'


const PerformanceChart = ({ assessment }) => {
    const [charData, setCharData] = useState([])
    useEffect(() => {
        if (assessment) {
            const formattedData = assessment.map((assessment) => ({
                date: format(new Date(assessment.createdAt), "MMM dd"),
                score: assessment.quizScore
            }))
            setCharData(formattedData)
        }
    }, [assessment])

    return (
        <Card className="mt-5">
            <CardHeader>
                <CardTitle className="gradient-title text-3xl md:text-3xl">Performance Trend</CardTitle>
                <CardDescription>Your quiz score over time</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='h-[300px] mt-5'>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={charData}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip content={({ active, payload }) => {
                                if (active && payload?.length) {
                                    return (
                                        <div className="bg-background border rounded-lg p-2 shadow-md">
                                            <p className="font-medium">Score:{payload[0].value}%</p>
                                            <p className="text-sm text-gray-600">Score: {payload[0].payload.date}</p>
                                        </div>
                                    )
                                }
                            }} />
                            <Line type="monotone" dataKey="score" stroke="#fff" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>

                </div>
            </CardContent>
        </Card>

    )
}

export default PerformanceChart