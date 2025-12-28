import type { Property as DBProperty } from '../types/database';
import type { Property as UIProperty } from '../types/property';

/**
 * Transform database Property (snake_case) to UI Property format (camelCase)
 */
export function transformPropertyToUI(dbProperty: DBProperty): UIProperty {
    // Handle price - extract numeric value and format
    const priceStr = dbProperty.price || '0';
    const priceValue = parseFloat(String(priceStr).replace(/[^0-9.]/g, '')) || 0;

    // Format price with pound sign and commas
    const formattedPrice = `£${priceValue.toLocaleString()}`;

    return {
        id: dbProperty.id,
        title: dbProperty.title,
        description: dbProperty.description || '',
        image: dbProperty.hero_image || dbProperty.thumbnail_image || '',
        location: dbProperty.location || '',
        price: formattedPrice,
        priceValue: priceValue,
        beds: dbProperty.beds || 0,
        baths: dbProperty.baths || 0,
        sqft: dbProperty.sqft?.toString() || '0',
        type: dbProperty.property_type || 'Property',
        status: dbProperty.status,
        slug: dbProperty.slug,
        address: dbProperty.full_address || dbProperty.location || '',
        floorPlanUrl: dbProperty.floor_plan_image || '',
        vimeoUrl: dbProperty.video_url || undefined
    };
}
