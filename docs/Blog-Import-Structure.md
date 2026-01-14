# Blog Import JSON Structure

This document outlines the JSON structure required to import blog posts into the CMS.

**Note:** You can upload multiple JSON files at once.

## JSON Structure Example

The file should contain an **array of objects**, where each object represents a single blog post.

```json
[
  {
    "title": "Living in Richmond: A Complete Guide",
    "slug": "living-in-richmond-guide",
    "excerpt": "Discover why Richmond is one of London's most desirable boroughs...",
    "content": "<h2>Introduction</h2><p>Richmond upon Thames is...</p>",
    "category": "Area Guides",
    "author": "Darren Bartlett",
    "status": "published",
    "published_at": "2024-01-15T09:00:00Z",
    "read_time": 8,
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
| `title` | `string` | **Yes** | The headline of the article. |
| `excerpt` | `string` | No | A short summary shown on cards. |
| `content` | `string` | No | The main body. HTML tags are supported. |
| `slug` | `string` | No | URL-friendly ID. Auto-generated from title if missing. |
| `category` | `string` | No | Recommended values: `Market Updates`, `Property News`, `Property Insights`, `Area Guides`, `Buying Advice`, `Selling Advice`, `News`. Defaults to `Market Updates`. |
| `author` | `string` | No | Recommended values: `Darren Bartlett`, `Luke De Quervain`, `Bartlett & Partners`. Defaults to `Darren Bartlett`. |
| `status` | `string` | No | `published` or `draft`. Defaults to `draft`. |
| `published_at` | `string` | No | ISO Date format (e.g., "2024-01-01T12:00:00Z"). Defaults to now if status is published. |
| `read_time` | `number` | No | Minutes to read. Auto-calculated from content word count if missing. |
| `meta_title` | `string` | No | SEO Title. Auto-generated from title if missing. |
| `meta_description`| `string` | No | SEO Description. Auto-generated from content if missing. |
| `keywords` | `string` | No | Comma-separated SEO keywords. |
| `noindex` | `boolean`| No | Hide from search engines? Default `false`. |
| `sitemap_enabled` | `boolean`| No | Include in sitemap? Default `true`. |

## Important Notes

1.  **Images**: `featured_image` is **NOT** imported via this JSON tool. You will need to upload images separately after importing the posts or use the "Bulk Images" tool in the CMS.
2.  **Duplicates**: If a post with the same `slug` already exists in the database, the import tool will skip that item to prevent duplicates.
3.  **HTML Support**: The `content` field supports full HTML, so you can transfer existing formatted blog posts directly.
