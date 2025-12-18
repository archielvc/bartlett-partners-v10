/**
 * AI-Powered SEO Generation
 * Generates meta titles, descriptions, keywords, and alt text using AI or smart algorithms
 */

const SITE_NAME = 'Bartlett & Partners';
const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 155;

interface GeneratedSEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  slug: string;
  altText?: string;
}

/**
 * Strip HTML tags and normalize whitespace
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract key phrases from text using TF-IDF-like scoring
 */
function extractKeyPhrases(text: string, maxPhrases: number = 6): string[] {
  const cleanText = stripHtml(text).toLowerCase();
  
  // Common words to ignore
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'what', 'which', 'who',
    'whom', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then',
    'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'under', 'again', 'further', 'once', 'being', 'having', 'doing',
    'their', 'them', 'your', 'our', 'his', 'her', 'my', 'if', 'because', 'until',
    'while', 'any', 'many', 'much', 'well', 'even', 'back', 'still', 'way', 'take',
    'come', 'make', 'like', 'get', 'got', 'going', 'know', 'think', 'see', 'look',
    'want', 'give', 'use', 'find', 'tell', 'ask', 'work', 'seem', 'feel', 'try',
    'leave', 'call', 'good', 'new', 'first', 'last', 'long', 'great', 'little',
    'own', 'old', 'right', 'big', 'high', 'different', 'small', 'large', 'next',
    'early', 'young', 'important', 'public', 'bad', 'same', 'able', 'thing',
    'things', 'however', 'whether', 'something', 'nothing', 'everything', 'someone',
    'anyone', 'everyone', 'one', 'two', 'three', 'four', 'five', 'don', 've', 'll',
    're', 's', 't', 'isn', 'aren', 'wasn', 'weren', 'hasn', 'haven', 'hadn', 'doesn',
    'didn', 'won', 'wouldn', 'couldn', 'shouldn', 'mustn', 'let', 'lets', 'say',
    'says', 'said', 'really', 'already', 'always', 'often', 'around', 'simply'
  ]);

  // Property/real estate specific important terms
  const importantTerms = new Set([
    'property', 'estate', 'agent', 'agents', 'house', 'home', 'homes', 'flat',
    'apartment', 'sale', 'rent', 'rental', 'buy', 'buying', 'sell', 'selling',
    'market', 'price', 'prices', 'valuation', 'mortgage', 'investment',
    'twickenham', 'teddington', 'richmond', 'london', 'sw', 'tw',
    'bedroom', 'bathroom', 'garden', 'parking', 'garage', 'kitchen',
    'living', 'dining', 'reception', 'terrace', 'balcony', 'view', 'views',
    'guide', 'advice', 'tips', 'news', 'update', 'updates', 'insight', 'insights',
    'first-time', 'buyer', 'buyers', 'seller', 'sellers', 'owner', 'owners',
    'landlord', 'tenant', 'lease', 'freehold', 'leasehold', 'stamp', 'duty',
    'interest', 'rate', 'rates', 'bank', 'england', 'base', 'mpc',
    'family', 'families', 'school', 'schools', 'transport', 'station', 'rail',
    'tube', 'underground', 'bus', 'park', 'parks', 'river', 'thames',
    'reform', 'government', 'law', 'legal', 'conveyancing', 'solicitor'
  ]);

  // Extract words
  const words = cleanText.match(/\b[a-z]{3,}\b/g) || [];
  
  // Count word frequency
  const wordFreq: Map<string, number> = new Map();
  for (const word of words) {
    if (!stopWords.has(word)) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  }

  // Score words (frequency + importance boost)
  const scored: [string, number][] = [];
  for (const [word, freq] of wordFreq) {
    const importanceBoost = importantTerms.has(word) ? 2 : 1;
    scored.push([word, freq * importanceBoost]);
  }

  // Sort by score
  scored.sort((a, b) => b[1] - a[1]);

  // Extract bigrams (two-word phrases) for better keywords
  const bigrams: Map<string, number> = new Map();
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    if (!stopWords.has(w1) && !stopWords.has(w2) && w1.length > 2 && w2.length > 2) {
      const bigram = `${w1} ${w2}`;
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    }
  }

  // Get top bigrams that appear multiple times
  const topBigrams = Array.from(bigrams.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([phrase]) => phrase);

  // Combine top words and bigrams
  const topWords = scored.slice(0, maxPhrases - topBigrams.length).map(([word]) => word);
  
  return [...topBigrams, ...topWords].slice(0, maxPhrases);
}

/**
 * Generate a slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, '') // Remove apostrophes
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/(^-|-$)/g, '') // Remove leading/trailing hyphens
    .substring(0, 60); // Limit length
}

/**
 * Extract the first meaningful sentence or sentences for a description
 */
function extractDescription(content: string, title: string): string {
  const plainText = stripHtml(content);
  
  // Split into sentences
  const sentences = plainText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
  
  if (sentences.length === 0) {
    return `Read about ${title} from Bartlett & Partners, your local Twickenham & Teddington estate agents.`;
  }

  // Take first 1-2 sentences that fit within limit
  let description = sentences[0];
  
  if (description.length < 80 && sentences.length > 1) {
    const combined = `${sentences[0]}. ${sentences[1]}`;
    if (combined.length <= MAX_DESCRIPTION_LENGTH - 3) {
      description = combined;
    }
  }

  // Truncate if needed
  if (description.length > MAX_DESCRIPTION_LENGTH - 3) {
    description = description.substring(0, MAX_DESCRIPTION_LENGTH - 3);
    const lastSpace = description.lastIndexOf(' ');
    if (lastSpace > description.length * 0.7) {
      description = description.substring(0, lastSpace);
    }
  }

  return description + (description.endsWith('.') ? '' : '...');
}

/**
 * Generate meta title from article title
 */
function generateMetaTitle(title: string, category?: string): string {
  // Calculate available space for the title
  const suffix = ` | ${SITE_NAME}`;
  const maxContentLength = MAX_TITLE_LENGTH - suffix.length;

  let metaTitle = title;

  // If title is short, add category context
  if (metaTitle.length < maxContentLength - 15 && category) {
    const categoryMap: Record<string, string> = {
      'Market Updates': 'Market Update',
      'Property News': 'Property News',
      'Property Insights': 'Property Insight',
      'Area Guides': 'Area Guide',
      'Buying Advice': 'Buying Guide',
      'Selling Advice': 'Selling Guide',
      'News': 'News'
    };
    const suffix = categoryMap[category];
    if (suffix && !metaTitle.toLowerCase().includes(suffix.toLowerCase())) {
      // Only add if it fits
      if (metaTitle.length + suffix.length + 3 <= maxContentLength) {
        metaTitle = `${metaTitle} - ${suffix}`;
      }
    }
  }

  // Truncate if needed
  if (metaTitle.length > maxContentLength) {
    metaTitle = metaTitle.substring(0, maxContentLength - 3);
    const lastSpace = metaTitle.lastIndexOf(' ');
    if (lastSpace > metaTitle.length * 0.7) {
      metaTitle = metaTitle.substring(0, lastSpace);
    }
    metaTitle += '...';
  }

  return metaTitle + suffix;
}

/**
 * Generate alt text for featured image based on article content
 */
function generateAltText(title: string, category?: string): string {
  const categoryContext: Record<string, string> = {
    'Market Updates': 'property market analysis',
    'Property News': 'property industry news',
    'Property Insights': 'property insights',
    'Area Guides': 'local area',
    'Buying Advice': 'home buying guide',
    'Selling Advice': 'home selling guide',
    'News': 'news update'
  };

  const context = category && categoryContext[category] 
    ? categoryContext[category] 
    : 'property';

  // Create descriptive alt text
  return `Featured image for ${title} - ${context} from Bartlett & Partners`;
}

/**
 * Main function: Generate all SEO fields from article content
 * Works without AI using smart text analysis
 */
export function generateSEOFromContent(
  title: string,
  content: string,
  category?: string,
  existingSlug?: string
): GeneratedSEO {
  // Generate slug (use existing if provided and valid)
  const slug = existingSlug && existingSlug.length > 5 
    ? existingSlug 
    : generateSlug(title);

  // Extract key phrases for keywords
  const keyPhrases = extractKeyPhrases(content);
  
  // Add location-specific keywords
  const locationKeywords = ['Twickenham', 'Teddington', 'estate agents'];
  const allKeywords = [...new Set([...keyPhrases, ...locationKeywords.map(k => k.toLowerCase())])];
  const keywords = allKeywords.slice(0, 8).join(', ');

  // Generate meta description
  const metaDescription = extractDescription(content, title);

  // Generate meta title
  const metaTitle = generateMetaTitle(title, category);

  // Generate alt text
  const altText = generateAltText(title, category);

  return {
    metaTitle,
    metaDescription,
    keywords,
    slug,
    altText
  };
}

/**
 * AI-Enhanced SEO Generation (requires OpenAI API key)
 * Falls back to algorithmic generation if API key not available
 */
export async function generateSEOWithAI(
  title: string,
  content: string,
  category?: string,
  apiKey?: string
): Promise<GeneratedSEO> {
  // If no API key, use algorithmic approach
  if (!apiKey) {
    console.log('No API key provided, using algorithmic SEO generation');
    return generateSEOFromContent(title, content, category);
  }

  const plainContent = stripHtml(content).substring(0, 3000); // Limit content for API

  const prompt = `You are an SEO expert for a prestigious estate agency called "Bartlett & Partners" based in Twickenham and Teddington, London.

Given this blog article, generate optimized SEO metadata:

Title: ${title}
Category: ${category || 'Property Insights'}
Content preview: ${plainContent}

Generate the following in JSON format:
{
  "metaTitle": "SEO-optimized title under 60 chars, include brand name suffix ' | Bartlett & Partners'",
  "metaDescription": "Compelling description under 155 chars that encourages clicks, include a call-to-action",
  "keywords": "6-8 relevant keywords as comma-separated string, include location terms like Twickenham, Teddington",
  "slug": "url-friendly-slug-from-title",
  "altText": "Descriptive alt text for the featured image"
}

Focus on:
- Local SEO for Twickenham, Teddington, Richmond area
- Property market relevance
- Professional estate agency tone
- Click-worthy descriptions

Return ONLY valid JSON, no explanation.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an SEO expert. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return generateSEOFromContent(title, content, category);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      return generateSEOFromContent(title, content, category);
    }

    // Parse JSON response
    const parsed = JSON.parse(generatedText);
    
    return {
      metaTitle: parsed.metaTitle || generateMetaTitle(title, category),
      metaDescription: parsed.metaDescription || extractDescription(content, title),
      keywords: parsed.keywords || extractKeyPhrases(content).join(', '),
      slug: parsed.slug || generateSlug(title),
      altText: parsed.altText || generateAltText(title, category)
    };

  } catch (error) {
    console.error('AI SEO generation failed, using fallback:', error);
    return generateSEOFromContent(title, content, category);
  }
}

