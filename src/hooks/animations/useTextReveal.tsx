import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useTextReveal(delay: number = 0) {
    const ref = useRef<HTMLHeadingElement | HTMLParagraphElement | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Split text would be ideal here but requires a paid plugin or a custom splitter.
        // For now, we will fade in the whole block with a nice easing.
        // Or we can assume children are spans.

        gsap.fromTo(
            element,
            {
                opacity: 0,
                y: 20,
                clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
            },
            {
                opacity: 1,
                y: 0,
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                duration: 1.2,
                delay: delay,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                },
            }
        );
    }, [delay]);

    return ref;
}
