import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const Development = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[10vh] px-4 text-center">
            <video className="h-[400px] w-[400px] rounded-lg mb-5" src="/under_development.mp4" autoPlay loop muted></video>
            <h1 className="text-6xl font-bold text-white mb-4">Under Development</h1>
            <h2 className="text-2xl font-semibold mb-4">Try Later....</h2>
            <p className="text-gray-600 mb-8">
                Oops! This is now under development try again sometime later.
            </p>
            <Link href="/">
                <Button className="cursor-pointer">🏠Return Home</Button>
            </Link>
        </div>
    )
}

export default Development