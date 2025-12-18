/**
 * Global constants for consistent styling and behavior across the application
 * Following WCAG AA accessibility standards
 */

// Z-Index layers for proper stacking order
export const Z_INDEX = {
  STAG_LOGO: 10,           // Decorative stag logo - lowest, behind all interactive elements
  NAVIGATION: 40,          // Main navigation bar
  NAV_BUTTONS: 50,         // Navigation buttons and hamburger menu
  MOBILE_MENU: 100,        // Mobile menu sheet (matches Sheet component z-index)
  DIALOG: 100,             // Dialogs and modals
  TOAST: 150,              // Toast notifications
} as const;

// Scroll behavior constants
export const SCROLL = {
  HERO_FADE_DISTANCE_MULTIPLIER: 0.8,  // Hero content fades over 80% of viewport height
  PARALLAX_MULTIPLIER: 0.3,             // Parallax effect speed
  SCALE_MAX: 0.15,                      // Maximum scale increase (15%)
} as const;

// Animation easing curves for premium feel
export const EASING = {
  SMOOTH: [0.4, 0, 0.2, 1] as const,    // Smooth ease-in-out
  PREMIUM: [0.4, 0, 0.2, 1] as const,   // Premium feeling curve
  SPRING: [0.5, 1, 0.89, 1] as const,   // Spring-like bounce
} as const;

// Accessibility constants
export const A11Y = {
  MIN_TOUCH_TARGET: 44,                 // Minimum touch target size (44x44px per WCAG)
  FOCUS_VISIBLE_OUTLINE: '2px solid currentColor',
  SKIP_LINK_BG: '#1A2551',
} as const;

// Spacing constants for consistent layout
export const SPACING = {
  SECTION_PADDING_MOBILE: '3rem',       // Mobile section padding
  SECTION_PADDING_DESKTOP: '5rem',      // Desktop section padding
  CONTAINER_MAX_WIDTH: '1440px',        // Maximum container width
  GRID_GAP_MOBILE: '1rem',              // Mobile grid gap
  GRID_GAP_DESKTOP: '2rem',             // Desktop grid gap
  CONTAINER_PADDING: 'px-6 sm:px-8 md:px-10 lg:px-12', // Consistent horizontal padding for all content
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  MOBILE_NAV: 1000,                     // Custom breakpoint for mobile navigation
} as const;