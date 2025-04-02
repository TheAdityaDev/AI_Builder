"use client"
import { Button } from '@/components/ui/button'
import { AlertTriangle, Download, Edit, Loader2, Monitor, Save } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resumeSchema } from '@/app/lib/schema'
import useFetch from '@/hooks/use-fetch'
import { saveResume } from '@/actions/resume'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import EntryForm from './entry-form'
import { entriesToMarkdown } from '@/app/lib/helper'
import MDEditor from '@uiw/react-md-editor'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import html2pdf from "html2pdf.js/dist/html2pdf.min.js";

const ResumeBuilder = ({ initialContent }) => {
    const [activeTab, setActiveTab] = useState("edit");
    const [resumeMode, setResumeMode] = useState("preview")
    const [previewContent, setPreviewContent] = useState(initialContent)
    const [isGenerating, setIsGenerating] = useState(false)

    const { user } = useUser()



    const { control, register, handleSubmit, watch, formState: { errors } } =
        useForm({
            resolver: zodResolver(resumeSchema),
            defaultValues: {
                contactInfo: {},
                summary: "",
                skills: "",
                experience: [],
                education: [],
                projects: [],
            }
        })

    const { loading: isSaving, fn: saveResumeFn, data: saveResult, errors: saveError } = useFetch(saveResume)

    const getContactMarkdown = () => {
        const { contactInfo } = formValues
        const parts = []
        if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`)
        if (contactInfo.mobile) parts.push(`📞 ${contactInfo.mobile}`)
        if (contactInfo.linkedin) parts.push(`🔗 [Linkedin] (${contactInfo.linkedin})`)
        if (contactInfo.twitter) parts.push(`𝕏 [X]( ${contactInfo.twitter})`)

        return parts.length > 0
            ? `##  <div align="center">${user.fullName}</div>
            \n\n <div align="center">\n\n${parts.join(" | ")}\n\n</div>` : ""

    }
    const getCombinedContent = () => {

        const { summary, skills, education, experience, projects } = formValues

        return [
            getContactMarkdown(),
            summary && `## Professional Summary\n\n${summary}`,
            skills && `## Skills \n\n${skills}`,
            entriesToMarkdown(experience, "Work Experience"),
            entriesToMarkdown(education, "Education"),
            entriesToMarkdown(projects, "Projects"),
        ].filter(Boolean).join("\n\n")
    }



    const generatePDF = async () => {
        setIsGenerating(true)
        try {
            const element = document.getElementById('resume-pdf')
            const opt = {
                margin: [15, 15],
                filename: `${user.firstName}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
            }
            await html2pdf().set(opt).from(element).save()
        } catch (error) {
            console.error("Error" + error);

            toast.error("something went wrong")
        } finally {
            setIsGenerating(false)
        }
    }
    useEffect(() => {
        if (saveResult && !isSaving) {
            toast.success("Resume add successfully!")
        }
        if (saveError) {
            toast.error(saveError.message || "Something went wrong")

        }
    }, [saveResult, saveError, isSaving])

    const onSubmit = async (data) => {
        try {
            await saveResumeFn(previewContent)
        } catch (error) {
            console.error("Error to save");

        }
    }
    const formValues = watch()

    useEffect(() => {
        if (initialContent) setActiveTab("preview")
    }, [initialContent]);

    useEffect(() => {
        if (activeTab === "edit") {
            const newContent = getCombinedContent()
            setPreviewContent(newContent ? newContent : initialContent)
        }
    }, [formValues, activeTab]);
    return (
        <div className='space-y-4'>
            <div className='flex flex-col md:flex-row items-center justify-between gap-2'>
                <h1 className='font-bold gradient-title text-5xl md:text-6xl'>Resume Builder</h1>
                <div className='space-x-4'>
                    <Button className="cursor-pointer" onClick={onSubmit} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className='h-4 w-4 animate-spin' />
                                Saving PDF...
                            </>

                        ) : (
                            <>
                                <Save className='h-4 w-4' />
                                Save
                            </>
                        )}
                    </Button>
                    <Button className="cursor-pointer" variant="destructive"
                        onClick={generatePDF} disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className='h-4 w-4 animate-spin' />
                                Generating PDF...
                            </>

                        ) : (
                            <>
                                <Download className='h-4 w-4' />
                                Download PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} >
                <TabsList>
                    <TabsTrigger className="cursor-pointer" value="edit">Form</TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value="preview">Mark Down</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                    <form className='space-y-8'>
                        <div className='space-y-4'>
                            <h3 className='text-lg font-medium'>Contact Information</h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50'>
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium'>Email</label>
                                    <Input {...register("contactInfo.email")}
                                        type="email"
                                        placeholder="example@gmail.com"
                                        error={errors.contactInfo?.email}
                                    />

                                    {errors.contactInfo?.email && (
                                        <p className='text-sm text-red-500'>
                                            {errors.contactInfo?.email.message}
                                        </p>
                                    )}
                                </div>
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium'>Mobile Number</label>
                                    <Input {...register("contactInfo.mobile")}
                                        type="tel"
                                        placeholder="000 000 000"
                                        error={errors.contactInfo?.mobile}
                                    />

                                    {errors.contactInfo?.mobile && (
                                        <p className='text-sm text-red-500'>
                                            {errors.contactInfo?.mobile.message}
                                        </p>
                                    )}
                                </div>
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium'>Linkedin Profile</label>
                                    <Input {...register("contactInfo.linkedin")}
                                        type="url"
                                        placeholder="https://www.linkdin.com/in/username"
                                        error={errors.contactInfo?.linkedin}
                                    />

                                    {errors.contactInfo?.linkedin && (
                                        <p className='text-sm text-red-500'>
                                            {errors.contactInfo?.linkedin.message}
                                        </p>
                                    )}
                                </div>
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium'>X Profile</label>
                                    <Input {...register("contactInfo.twitter")}
                                        type="url"
                                        placeholder="https://www.X.com/"
                                        error={errors.contactInfo?.twitter}
                                    />

                                    {errors.contactInfo?.twitter && (
                                        <p className='text-sm text-red-500'>
                                            {errors.contactInfo?.twitter.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Summary */}
                        <div className='space-y-2'>
                            <h3 className='text-lg font-medium'>Professional Summary</h3>
                            <Controller name='summary' control={control} render={({ field }) => (
                                <Textarea {...field}
                                    className="h-32"
                                    placeholder="Write a compelling professional summary."
                                    error={errors.summary}
                                />
                            )} />

                            {errors.summary && (
                                <p className='text-sm text-red-500'>
                                    {errors.summary.message}
                                </p>
                            )}
                        </div>
                        {/* Skills */}
                        <div className='space-y-2'>
                            <h3 className='text-lg font-medium'>Skills</h3>
                            <Controller name='skills' control={control} render={({ field }) => (
                                <Textarea {...field}
                                    className="h-32"
                                    placeholder="List your skills.."
                                    error={errors.skills}
                                />
                            )} />

                            {errors.skills && (
                                <p className='text-sm text-red-500'>
                                    {errors.skills.message}
                                </p>
                            )}
                        </div>
                        {/* Work Experience */}

                        <div className='space-y-2'>
                            <h3 className='text-lg font-medium'>Work Experience</h3>
                            <Controller name='experience' control={control} render={({ field }) => (
                                <EntryForm
                                    type="Experience"
                                    entries={field.value}
                                    onChange={field.onChange}
                                />
                            )} />

                            {errors.experience && (
                                <p className='text-sm text-red-500'>
                                    {errors.experience.message}
                                </p>
                            )}
                        </div>
                        {/* Education */}

                        <div className='space-y-2'>
                            <h3 className='text-lg font-medium'>Education</h3>
                            <Controller name='education' control={control} render={({ field }) => (
                                <EntryForm
                                    type="Education"
                                    entries={field.value}
                                    onChange={field.onChange}
                                />
                            )} />

                            {errors.education && (
                                <p className='text-sm text-red-500'>
                                    {errors.education.message}
                                </p>
                            )}
                        </div>

                        {/* Projects */}
                        <div className='space-y-2'>
                            <h3 className='text-lg font-medium'>Projects</h3>
                            <Controller name='projects' control={control} render={({ field }) => (
                                <EntryForm
                                    type="projects"
                                    entries={field.value}
                                    onChange={field.onChange}
                                />
                            )} />

                            {errors.projects && (
                                <p className='text-sm text-red-500'>
                                    {errors.projects.message}
                                </p>
                            )}
                        </div>
                    </form>
                </TabsContent>
                <TabsContent value="preview">
                    <Button variant="link" type="button" className="mb-2 cursor-pointer"
                        onClick={() => {
                            setResumeMode(resumeMode === "preview" ? "edit" : "preview")
                        }}
                    >
                        {resumeMode === "preview" ? (
                            <>
                                <Edit className='h-4 w-4' />
                                Edit Resume
                            </>

                        ) : (
                            <>
                                <Monitor className='h-4 w-4' />
                                Show Preview
                            </>
                        )}
                    </Button>
                    {resumeMode !== "preview" && (
                        <div className="flex p-3 gap-2 items-center border-2 border-yellow-500 text-yellow-200 rounded mb-2">
                            <AlertTriangle className='h-4 w-4 mr-3' />
                            <span>
                                You will lose edited markdown if you update the form data.
                            </span>
                        </div>
                    )}
                    <div className='border-2 rounded-lg'>
                        <MDEditor value={previewContent} onChange={setPreviewContent} height={800} preview={resumeMode} />
                    </div>
                    <div className='hidden'>
                        <div id='resume-pdf'>
                            <MDEditor.Markdown source={previewContent} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

        </div >
    )
}

export default ResumeBuilder