import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useParallax(speed: number = 0.5) {
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        gsap.to(element, {
            yPercent: 50 * speed,
            ease: 'none',
            scrollTrigger: {
                trigger: element.parentElement,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
        });

        return () => {
            // Cleanup specific triggers if needed, though global cleanup might be better handled in a context or component unmount
        };

    }, [speed]);

    return ref;
}
