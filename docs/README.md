# Documentation

This directory contains documentation for the Bartlett & Partners real estate website.

## Quick Start

- **[AI_CONTEXT.md](./AI_CONTEXT.md)** - Comprehensive guide for AI models working with this codebase

## Directory Structure

```
docs/
├── AI_CONTEXT.md          # AI-optimized codebase overview
├── README.md              # This file
├── architecture/          # System architecture docs
├── components/            # Component documentation
├── performance/           # Performance optimization docs
└── database/              # Database schema and patterns
```

## Key Resources

### For AI Assistants
Start with [AI_CONTEXT.md](./AI_CONTEXT.md) for a complete overview of:
- Architecture and data flow
- Key patterns (images, database, animations)
- Critical files and their purposes
- Common tasks and how to accomplish them

### For Developers
- Check `src/database/MIGRATION_GUIDE.md` for database changes
- See `src/PRODUCTION_READY_CHECKLIST.md` for deployment checklist
- Review `vite.config.ts` for build configuration

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Homepage Load | <300ms | ~250ms |
| Property List | <350ms | ~300ms |
| Property Detail | <200ms | ~180ms |
| Bundle Size | <300KB | ~280KB |
| Lighthouse Score | >95 | 95+ |
