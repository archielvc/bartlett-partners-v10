import { Property, Enquiry, User, BlogPost, SEOSetting } from '../types/mockDatabase';

// Initial Mock Data
const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Riverside Gardens',
    slug: 'riverside-gardens',
    price: 1250000,
    location: 'Twickenham',
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2100,
    description: 'An exquisite riverside property offering stunning views of the Thames. This four-bedroom family home combines period features with modern luxury living.',
    main_image: 'https://images.unsplash.com/photo-1600596542815-225ef65aa418?ixlib=rb-4.1.0&auto=format&fit=crop&w=1600&q=80',
    images: [
      'https://images.unsplash.com/photo-1600596542815-225ef65aa418?ixlib=rb-4.1.0&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.1.0&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.1.0&auto=format&fit=crop&w=1600&q=80'
    ],
    status: 'available',
    is_hero: true,
    features: ['River Views', 'Private Moorings', 'Double Garage', 'South Facing Garden'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'The Old Rectory',
    slug: 'the-old-rectory',
    price: 2850000,
    location: 'Teddington',
    bedrooms: 6,
    bathrooms: 4,
    sqft: 4500,
    description: 'A magnificent Grade II listed Georgian rectory set in 0.5 acres of walled gardens. Beautifully preserved original features throughout.',
    main_image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.1.0&auto=format&fit=crop&w=1600&q=80',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.1.0&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?ixlib=rb-4.1.0&auto=format&fit=crop&w=1600&q=80'
    ],
    status: 'available',
    is_hero: false,
    features: ['Grade II Listed', 'Walled Garden', 'Wine Cellar', 'Coach House'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Richmond Hill Penthouse',
    slug: 'richmond-hill-penthouse',
    price: 3500000,
    location: 'Richmond',
    bedrooms: 3,
    bathrooms: 3,
    sqft: 1800,
    description: 'A spectacular penthouse apartment with panoramic views over Richmond Park and the Thames Valley. Direct lift access and wrap-around terrace.',
    main_image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.1.0&auto=format&fit=crop&w=1600&q=80',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.1.0&auto=format&fit=crop&w=1600&q=80'
    ],
    status: 'private',
    is_hero: false,
    features: ['Panoramic Views', 'Roof Terrace', 'Concierge', 'Underground Parking'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const MOCK_ENQUIRIES: Enquiry[] = [
  {
    id: '1',
    name: 'James Peterson',
    email: 'james.p@example.com',
    phone: '07700 900123',
    message: 'I am interested in viewing The Old Rectory. Is it available this weekend?',
    property_id: '2',
    status: 'new',
    created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: '2',
    name: 'Sarah Jenkins',
    email: 's.jenkins@example.com',
    phone: '07700 900456',
    message: 'Please send me more details about your private collection properties.',
    status: 'read',
    created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  }
];

const MOCK_SEO_SETTINGS: SEOSetting[] = [
  {
    page_route: '/',
    title: 'Luxury Estate Agents Twickenham | Bartlett & Partners',
    description: 'Bartlett & Partners are the leading luxury estate agents in Twickenham and Teddington, specialising in exceptional period homes and riverside properties.',
    keywords: ['estate agents twickenham', 'luxury homes', 'period properties']
  },
  {
    page_route: '/about',
    title: 'About Us | Bartlett & Partners',
    description: 'Discover our unique approach to selling luxury homes in South West London.',
    keywords: ['about us', 'real estate team', 'property experts']
  }
];

// Local Storage Keys
const STORAGE_KEYS = {
  PROPERTIES: 'bp_mock_properties',
  ENQUIRIES: 'bp_mock_enquiries',
  SEO: 'bp_mock_seo'
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockDBService {
  private properties: Property[];
  private enquiries: Enquiry[];
  private seo: SEOSetting[];

  constructor() {
    // Load from localStorage or fall back to initial data
    const storedProps = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    this.properties = storedProps ? JSON.parse(storedProps) : MOCK_PROPERTIES;

    const storedEnquiries = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
    this.enquiries = storedEnquiries ? JSON.parse(storedEnquiries) : MOCK_ENQUIRIES;

    const storedSeo = localStorage.getItem(STORAGE_KEYS.SEO);
    this.seo = storedSeo ? JSON.parse(storedSeo) : MOCK_SEO_SETTINGS;
  }

  private save() {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(this.properties));
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(this.enquiries));
    localStorage.setItem(STORAGE_KEYS.SEO, JSON.stringify(this.seo));
  }

  // --- Properties ---
  async getProperties(): Promise<Property[]> {
    await delay(300);
    return [...this.properties];
  }

  async getProperty(id: string): Promise<Property | undefined> {
    await delay(200);
    return this.properties.find(p => p.id === id);
  }

  async createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
    await delay(500);
    const newProp: Property = {
      ...property,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (newProp.is_hero) {
      this.properties.forEach(p => p.is_hero = false);
    }
    
    this.properties.unshift(newProp);
    this.save();
    return newProp;
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    await delay(400);
    const index = this.properties.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Property not found');

    if (updates.is_hero) {
      this.properties.forEach(p => p.is_hero = false);
    }

    this.properties[index] = { ...this.properties[index], ...updates, updated_at: new Date().toISOString() };
    this.save();
    return this.properties[index];
  }

  async deleteProperty(id: string): Promise<void> {
    await delay(300);
    this.properties = this.properties.filter(p => p.id !== id);
    this.save();
  }

  // --- Enquiries ---
  async getEnquiries(): Promise<Enquiry[]> {
    await delay(300);
    return [...this.enquiries];
  }

  async updateEnquiryStatus(id: string, status: Enquiry['status']): Promise<Enquiry> {
    await delay(200);
    const index = this.enquiries.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Enquiry not found');
    
    this.enquiries[index] = { ...this.enquiries[index], status };
    this.save();
    return this.enquiries[index];
  }

  // --- SEO ---
  async getSEOSettings(): Promise<SEOSetting[]> {
    await delay(200);
    return [...this.seo];
  }

  async updateSEOSetting(route: string, settings: Partial<SEOSetting>): Promise<SEOSetting> {
    await delay(300);
    const index = this.seo.findIndex(s => s.page_route === route);
    if (index !== -1) {
      this.seo[index] = { ...this.seo[index], ...settings };
    } else {
      // Create new if not exists
      this.seo.push({ 
        page_route: route, 
        title: settings.title || '', 
        description: settings.description || '', 
        keywords: settings.keywords || [] 
      });
    }
    this.save();
    return this.seo[index !== -1 ? index : this.seo.length - 1];
  }
}

export const mockDB = new MockDBService();
