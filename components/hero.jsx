"use client";
import { useRef, useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { GithubIcon } from "lucide-react";

/**
 * HeroSection component renders a visually appealing section
 * with a title, description, and buttons for user interaction.
 * It also includes an image that animates when the page is scrolled.
 * The component uses React hooks to manage a reference to the image
 * element and applies a 'scrolled' class to it when the user
 * scrolls past a certain threshold.
 */

const HeroSection = () => {
  const imgRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const imageList = ["/banner.jpeg", "/banner2.jpeg", "/banner3.jpeg"];

  useEffect(() => {
    const imageElement = imgRef.current;

    const handelScrolled = () => {
      const ScrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (ScrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handelScrolled);
    return () => window.removeEventListener("scroll", handelScrolled);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageList.length);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (

    <section className="w-full pt-36 md:pt-48 pb-10 overflow-x-hidden">
      <div className="space-y-6 text-center">
        <div className="space-x-6 m-auto">
          <h1 className="gradient-title gradient text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl">
            Your AI Career Coach for
            <br />
            Professional Success
          </h1>
          <p className="mx-auto max-w-[800px] text-muted-foreground md:text-2xl">
            Advance your career with professionalized guidance,interview
            preparation, and AI-powered tools for job success.
          </p>
        </div>
        <div className="flex justify-center space-x-4 mt-4">
          <Link href="/interview_AI">
            <Button size="lg" className="px-8 cursor-pointer">
              Interview With AI
            </Button>
          </Link>
          <Link href="/git_profile">
            <Button size="lg" className="px-8 cursor-pointer" variant="outline">
              <GithubIcon className="w-6 h-6 mr-2" />
              Github Profile 
            </Button>
          </Link>
        </div>
        <div>
          <div className="hero-image-wrapper mt-5 md:mt-0">
            <div ref={imgRef} className="hero-image">
              <Image
                src={imageList[currentImageIndex]}
                width={1280}
                height={720}
                alt="Dashboard Preview"
                className="rounded-lg shadow-2xl border mx-auto transition-opacity duration-300 animate-fadeIn"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
