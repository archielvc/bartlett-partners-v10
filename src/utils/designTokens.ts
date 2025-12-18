// Design Tokens - Single Source of Truth
// Based on Major Third (1.25) type scale

export const TYPOGRAPHY = {
  // Type Scale (Major Third: 1.25 ratio)
  scale: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.25rem',      // 20px
    xl: '1.5625rem',    // 25px
    '2xl': '1.953rem',  // 31.25px
    '3xl': '2.441rem',  // 39px
    '4xl': '3.052rem',  // 49px
  },
  
  // Font Families
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Figtree', sans-serif",
  },
  
  // Line Heights
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.6',
    loose: '1.7',
  },
  
  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0',
    wide: '0.05em',
    wider: '0.1em',
    widest: '0.15em',
  },
};

export const COLORS = {
  // Primary
  primary: {
    main: '#1A2551',
    light: 'rgba(26, 37, 81, 0.7)',
    lighter: 'rgba(26, 37, 81, 0.4)',
    lightest: 'rgba(26, 37, 81, 0.1)',
  },
  
  // Neutrals (opacity-based system)
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    charcoal: '#3A3A3A',
    gray: 'rgba(26, 37, 81, 0.6)',
    lightGray: 'rgba(26, 37, 81, 0.2)',
    background: '#F7F7F7',
  },
  
  // Accent
  accent: {
    clay: '#8E8567',
    red: '#DC2626',
  },
  
  // Semantic
  text: {
    primary: '#1A2551',
    secondary: '#3A3A3A',
    muted: 'rgba(26, 37, 81, 0.6)',
  },
};

export const SPACING = {
  // 8-point system (multiples of 8px / 0.5rem)
  scale: {
    xs: '0.5rem',    // 8px
    sm: '1rem',      // 16px
    md: '1.5rem',    // 24px
    lg: '2rem',      // 32px
    xl: '3rem',      // 48px
    '2xl': '4rem',   // 64px
    '3xl': '6rem',   // 96px
    '4xl': '8rem',   // 128px
  },
  
  // Section padding
  section: {
    mobile: '4rem',  // 64px
    desktop: '6rem', // 96px
  },
};

export const Z_INDEX = {
  base: 1,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  navigation: 50,
  toast: 100,
};

export const LOGO = {
  height: {
    mobile: '3.5rem',  // 56px (divisible by 8)
    desktop: '5rem',   // 80px (divisible by 8) - FIXED from 5.06rem
  },
};

export const ANIMATIONS = {
  // Premium easing curves
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    entrance: 'cubic-bezier(0, 0, 0.2, 1)',
    exit: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  
  // Duration
  duration: {
    fast: '0.15s',
    normal: '0.25s',
    slow: '0.4s',
    slower: '0.6s',
  },
};
