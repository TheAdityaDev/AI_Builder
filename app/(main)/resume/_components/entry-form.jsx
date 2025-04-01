"use client"
import { improveWithAi } from '@/actions/resume'
import { entrySchema } from '@/app/lib/schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import useFetch from '@/hooks/use-fetch'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, parse } from 'date-fns'
import { Loader2, PlusCircle, Sparkle, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { date } from 'zod'


const formatDisplayDate = (dateString) => {
    if (dateString) return ""
    const date = parse(dateString, "yyyy-MM", new Date())
    return format(date, "MMM yyyy")
}

const EntryForm = ({ type, entries, onChange }) => {
    const [isAdding, setIsAdding] = useState(false);
    const { register,
        handleSubmit: handleValidation,
        formState: { errors },
        reset,
        watch,
        setValue } = useForm({
            resolver: zodResolver(entrySchema),
            defaultValues: {
                title: "",
                organization: "",
                startDate: "",
                endDate: "",
                description: "",
                current: false,
            }
        })

    const current = watch("current")

    const {
        loading: isImproving,
        fn: improveWithAiFn,
        data: improvedContent,
        error: improveError
    } = useFetch(improveWithAi)

    const handleAdd = handleValidation((data) => {
        const formattedEntry = {
            ...data,
            startDate: formatDisplayDate(data.startDate),
            endDate: date.current ? "" : formatDisplayDate(date.endDate),
        }
        onChange([...entries, formattedEntry])

        reset()
        setIsAdding(false)
    })

    const handleDelete = (index) => {
        const newEntries = entries.filter((_, i) => i !== index)
        onChange(newEntries)
    }

    useEffect(() => {
        if (improvedContent && !isImproving) {
            setValue("description", improvedContent)
            toast.success("Description update successfully")
        }

        if (improveError) {
            toast.error("Failed to update description")
        }
    }, [improvedContent, improveError, isImproving])


    const handleImproveDescription = async () => {
        const description = watch("description")
        if (!description) {
            toast.error("Please enter a description first")
            return
        }
        await improveWithAiFn({
            current: description,
            type: type.toLowerCase() //'expedience' , 'education' , 'project'
        })
    }

    return (
        <div>
            <div>{entries.map((item, index) => {
                return (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>
                                {item.title} @ {item.organization}
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                onClick={() => { handleDelete(index) }}
                            >
                                <X className='h-4 w-4' />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <p>Card Content</p>
                        </CardContent>
                    </Card>

                )
            })}</div>
            {isAdding && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add {type}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Input
                                    type="text"
                                    placeholder="Title/Position"
                                    {...register("title")}
                                    error={errors.title}
                                />
                                {
                                    errors.title && (
                                        <p className='text-red-500 text-sm'>{errors.title.message}</p>
                                    )
                                }
                            </div>

                            {/* Organization */}
                            <div className='space-y-2'>
                                <Input
                                    placeholder="Organization"
                                    {...register("organization")}
                                    error={errors.organization}
                                />
                                {
                                    errors.organization && (
                                        <p className='text-red-500 text-sm'>{errors.organization.message}</p>
                                    )
                                }
                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            {/* Start Date */}
                            <div className='space-y-2'>
                                <Input
                                    type="month"
                                    placeholder="Start Date"
                                    {...register("startDate")}
                                    error={errors.startDate}
                                />
                                {
                                    errors.title && (
                                        <p className='text-red-500 text-sm'>{errors.startDate.message}</p>
                                    )
                                }
                                {/* end Date*/}
                            </div>
                            <div className='space-y-2'>
                                <Input
                                    type="month"
                                    placeholder="End Date"
                                    {...register("endDate")}
                                    disabled={current}
                                    error={errors.endDate}
                                />
                                {
                                    errors.title && (
                                        <p className='text-red-500 text-sm'>{errors.endDate.message}</p>
                                    )
                                }
                            </div>
                        </div>
                        <div>
                            <input type="checkbox" {...register("current")} id="current" onChange={(e) => {
                                setValue("current", e.target.checked)
                                if (e.target.checked) {
                                    setValue("endDate", "")
                                }
                            }} />
                            <label htmlFor="current">Current {type}</label>
                        </div>
                        <div className='space-y-2'>
                            <Textarea
                                type="month"
                                placeholder={`Description of your ${type.toLowerCase()}`}
                                className="h-32"
                                {...register("description")}
                                disabled={current}
                                error={errors.description}
                            />
                            {
                                errors.title && (
                                    <p className='text-red-500 text-sm'>{errors.description.message}</p>
                                )
                            }
                        </div>
                        <Button type="button"
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer"
                            onClick={handleImproveDescription}
                            disabled={isImproving || !watch("description")}
                        >{!isImproving ? (
                            <>
                                <Sparkle className='h-4 w-4 mr-2' />
                                Improve With AI
                            </>
                        ) : (
                            <>
                                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                Improving...
                            </>
                        )}
                        </Button>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                        <Button className="cursor-pointer" type="button" variant="outline" onClick={() => { reset(); setIsAdding(false) }}>Cancel</Button>
                        <Button className="cursor-pointer" type="button" onClick={handleAdd}> <PlusCircle className='h-4 w-4 mr-2' />Add Entry</Button>
                    </CardFooter>
                </Card>
            )
            }
            {!isAdding && (
                <Button className="w-full"
                    onClick={() => setIsAdding(true)}
                    variant="outline">
                    <PlusCircle className='h-4 w-4 mr-2' />
                    Add {type}
                </Button>
            )}


        </div>

    )
}

export default EntryForm