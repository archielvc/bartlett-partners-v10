import { useState, useEffect } from 'react';
import { TestimonialsCarousel } from '../TestimonialsCarousel';
import { getPublishedTestimonials } from '../../utils/database';
import type { Testimonial } from '../../types/database';

/**
 * Global Client Experiences Section
 * Automatically fetches and displays testimonials
 * Can be used on any page across the site
 */
export function GlobalTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const data = await getPublishedTestimonials();
      setTestimonials(data);
    };
    fetchTestimonials();
  }, []);

  if (!testimonials.length) return null;

  return <TestimonialsCarousel testimonials={testimonials} />;
}