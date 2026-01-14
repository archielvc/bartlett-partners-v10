# Blog Import JSON Structure

This document outlines the JSON structure required to import blog posts into the "Insights" section of the CMS. This structure is designed to be provided to an LLM to generate compatible blog post data.

**Note:** You can upload one or multiple JSON files at once using the "Import JSON" button in the Insights CMS.

## JSON Structure Example

The file should contain an **array of objects**, where each object represents a single blog post.

```json
[
  {
    "title": "Living in Richmond: A Complete Guide",
    "slug": "living-in-richmond-guide",
    "category": "Area Guides",
    "author": "Darren Bartlett",
    "status": "published",
    "published_at": "2024-01-15T09:00:00Z",
    "read_time": 8,
    "excerpt": "Discover why Richmond is one of London's most desirable boroughs...",
    "tldr": "Key takeaways: 1. Unbeatable parks. 2. Great schools. 3. Fast links to London.",
    "content": "<h2>Introduction</h2><p>Richmond upon Thames is...</p>",
    "meta_title": "Living in Richmond - The Ultimate Area Guide",
    "meta_description": "Everything you need to know about moving to Richmond upon Thames.",
    "keywords": "Richmond, London, Property, Moving Guide",
    "view_count": 0,
    "noindex": false,
    "nofollow": false,
    "sitemap_enabled": true
  }
]
```

## Field Details

| Field | Type | Required | Description / Default |
| :--- | :--- | :--- | :--- |
| `title` | `string` | **Yes** | The main headline of the article. |
| `slug` | `string` | No | URL-friendly ID. Auto-generated from title if missing. |
| `category` | `string` | No | One of: `Market Updates`, `Property News`, `Property Insights`, `Area Guides`, `Buying Advice`, `Selling Advice`, `News`. Defaults to `Market Updates`. |
| `author` | `string` | No | One of: `Darren Bartlett`, `Luke De Quervain`, `Bartlett & Partners`. Defaults to `Darren Bartlett`. |
| `status` | `string` | No | `published` or `draft`. Defaults to `draft`. |
| `published_at` | `string` | No | ISO Date format. Defaults to current time if status is `published`. |
| `read_time` | `number` | No | Minutes. Auto-calculated (200 words/min) if missing. |
| `excerpt` | `string` | No | Short summary shown on archive cards. |
| `tldr` | `string` | No | Bulleted summary points shown at the top of the post. |
| `content` | `string` | **Yes** | Main article body. Supports standard HTML tags. |
| `meta_title` | `string` | No | SEO Title. Auto-generated from title if missing. |
| `meta_description`| `string` | No | SEO Description. Auto-generated from content if missing. |
| `keywords` | `string` | No | Comma-separated SEO keywords. |
| `noindex` | `boolean`| No | Prevents indexing by search engines. Default `false`. |
| `nofollow` | `boolean`| No | Prevents search engines from following links. Default `false`. |
| `sitemap_enabled` | `boolean`| No | Include in sitemap and RSS? Default `true`. |
| `view_count` | `number` | No | Initial view count. Default `0`. |

## Important Notes for LLM Generation

1.  **Images**: `featured_image` and `featured_image_alt` are **NOT** imported via JSON. You must upload images separately using the "Bulk Images" or "Image Upload" tools in the CMS after the posts are created.
2.  **HTML Support**: The `content` field should be correctly formatted with HTML (e.g., `<h2>`, `<p>`, `<ul>`) to maintain the design on the live site.
3.  **Unique Slugs**: The system will skip any item if a post with the same `slug` already exists.
4.  **Auto-SEO**: If `meta_title` or `meta_description` are omitted, the CMS will use the `title` and `excerpt` to populate them.
