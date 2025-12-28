import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealOptions {
    delay?: number;
    duration?: number;
    y?: number;
    stagger?: number;
    threshold?: number;
    selector?: string;
}

export function useScrollReveal({
    delay = 0,
    duration = 1,
    y = 50,
    stagger = 0,
    threshold = 0.1,
    selector,
}: ScrollRevealOptions = {}) {
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // If selector is provided, target children. Otherwise target the element itself.
        const targets = selector ? element.querySelectorAll(selector) : element;

        gsap.fromTo(
            targets,
            {
                opacity: 0,
                y: y,
            },
            {
                opacity: 1,
                y: 0,
                duration: duration,
                delay: delay,
                stagger: stagger,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start: `top ${100 - threshold * 100}%`,
                    toggleActions: 'play none none reverse',
                },
            }
        );

        return () => {
            // Cleanup provided by GSAP internally mostly, but if we wanted to be strict:
            // ScrollTrigger.getAll().forEach(t => t.kill()); 
        };
    }, [delay, duration, y, stagger, threshold, selector]);

    return ref;
}
