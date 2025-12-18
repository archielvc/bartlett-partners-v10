import type { Testimonial } from '../types/database';

export const testimonials: Testimonial[] = [
  {
    id: '1',
    content: "Estate made our property search effortless. Their local knowledge and attention to detail helped us find the perfect family home in Richmond. The team was professional, responsive, and truly understood our needs.",
    author: "Marcus & Jennifer Thompson",
    role: "Homeowners",
    rating: 5,
    avatar_url: null,
    published: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    content: "Selling through Estate was a smooth experience from start to finish. They achieved a price above our expectations within just three weeks. I highly recommend their services.",
    author: "David Richardson",
    role: "Property Seller",
    rating: 5,
    avatar_url: null,
    published: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    content: "Professional, responsive, and incredibly knowledgeable. I wouldn't trust anyone else with my property investments in Southwest London. Estate has been an invaluable partner.",
    author: "Sarah Chen",
    role: "Property Investor",
    rating: 5,
    avatar_url: null,
    published: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    content: "Bartlett & Partners transformed our property search with their deep local knowledge and personalised approach.",
    author: "Emma Richardson",
    role: "First-time Buyer",
    rating: 5,
    avatar_url: null,
    published: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    content: "Professional, efficient and always supportive throughout our entire selling process.",
    author: "Michael Thompson",
    role: "Seller, Richmond",
    rating: 5,
    avatar_url: null,
    published: true,
    display_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    content: "Exceptional service that goes beyond just selling a property. Truly understand the local market.",
    author: "Sarah Williams",
    role: "Landlord, Twickenham",
    rating: 5,
    avatar_url: null,
    published: true,
    display_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];