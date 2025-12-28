import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealOptions {
    delay?: number;
    duration?: number;
    y?: number;
    x?: number;
    stagger?: number;
    threshold?: number;
    selector?: string;
}

export function useScrollReveal({
    delay = 0,
    duration = 0.8,
    y = 30,
    x = 0,
    stagger = 0.1,
    threshold = 0.1,
    selector,
    dependencies = [],
}: ScrollRevealOptions & { dependencies?: any[] } = {}) {
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // If selector is provided, target children. Otherwise target the element itself.
        const targets = selector ? element.querySelectorAll(selector) : element;

        // Skip if targeting children but none found yet (async data)
        const hasChildren = selector ? (targets as NodeListOf<Element>).length > 0 : true;
        if (!hasChildren) return;

        // Set initial state immediately
        const ctx = gsap.context(() => {
            gsap.set(targets, {
                opacity: 0,
                y: y,
                x: x
            });

            gsap.to(targets, {
                opacity: 1,
                y: 0,
                x: 0,
                duration: duration,
                delay: delay,
                stagger: stagger,
                ease: 'power2.out',
                willChange: 'transform, opacity',
                scrollTrigger: {
                    trigger: element,
                    start: `top ${100 - threshold * 100}%`,
                    toggleActions: 'play none none none',
                },
            });
        }, element); // Scope to element

        return () => {
            ctx.revert(); // Clean up only this context's animations/triggers
        };
    }, [delay, duration, y, x, stagger, threshold, selector, ...dependencies]);

    return ref;
}
