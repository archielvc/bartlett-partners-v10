import { getGlobalSettings, setGlobalSettings } from './database';

const METADATA_KEY = 'media_library_metadata';

interface ImageMetadata {
  alt?: string;
  caption?: string;
  uploadedAt?: string;
}

export async function getImageMetadata(url: string): Promise<ImageMetadata | null> {
  const allMetadata = await getGlobalSettings(METADATA_KEY) || {};
  return allMetadata[url] || null;
}

export async function setImageMetadata(url: string, metadata: ImageMetadata): Promise<void> {
  const allMetadata = await getGlobalSettings(METADATA_KEY) || {};
  allMetadata[url] = { ...allMetadata[url], ...metadata };
  await setGlobalSettings(METADATA_KEY, allMetadata);
}

export async function getAllImageMetadata(): Promise<Record<string, ImageMetadata>> {
  return await getGlobalSettings(METADATA_KEY) || {};
}
