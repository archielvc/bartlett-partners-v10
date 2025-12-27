import { get, set } from './kvStore';

export async function cleanupSiteImages() {
    const KV_KEY = 'site_images';

    try {
        const data = await get<any>(KV_KEY);

        if (!data) return;

        let hasChanges = false;
        const newData = { ...data };

        // 1. Clean up locations (remove St Margarets)
        if (newData.locations) {
            const originalLength = newData.locations.length;
            newData.locations = newData.locations.filter((item: any) =>
                ['l_twickenham', 'l_teddington', 'l_kew', 'l_ham'].includes(item.id)
            );

            if (newData.locations.length !== originalLength) {
                console.log('cleanupSiteImages: Removed obsolete locations');
                hasChanges = true;
            }
        }

        // 2. Clean up contact hero
        if (newData.contact) {
            const originalLength = newData.contact.length;
            newData.contact = newData.contact.filter((item: any) => item.id !== 'c_hero_bg');

            if (newData.contact.length !== originalLength) {
                console.log('cleanupSiteImages: Removed contact hero');
                hasChanges = true;
            }
        }

        if (hasChanges) {
            await set(KV_KEY, newData);
            console.log('Site images cleanup complete');
        } else {
            console.log('Site images cleanup: No changes needed');
        }

    } catch (error) {
        console.error('Error executing site images cleanup:', error);
    }
}
