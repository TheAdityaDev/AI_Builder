import { Button } from '@/components/ui/button'
import { ArrowLeft, Link } from 'lucide-react'
import React from 'react'
import CoverLetterPreview from '../_components/cover-letter-preview'

const CoverLetter = ({ params }) => {
    const id = params.id
    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-col space-y-2">
                <Link href="cover-letter">
                    <Button variant="link" className="gap-2 pl-0">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Cover Letters
                    </Button>
                </Link>

                <h1 className="text-6xl font-bold gradient-title mb-6">
                    {CoverLetter?.jobTitle} at {CoverLetter?.companyName}
                </h1>
            </div>

            <CoverLetterPreview content={CoverLetter?.content} />
        </div>
    )
}

export default CoverLetter