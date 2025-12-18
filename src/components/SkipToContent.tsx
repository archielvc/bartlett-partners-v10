import { A11Y } from '../utils/constants';

/**
 * Skip to Content link for keyboard navigation accessibility
 * Allows users to bypass navigation and jump directly to main content
 * Following WCAG 2.1 Level A success criterion 2.4.1
 */
export function SkipToContent() {
  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleSkip}
      className="skip-to-content"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '0',
        zIndex: 9999,
        padding: '1rem 1.5rem',
        backgroundColor: A11Y.SKIP_LINK_BG,
        color: 'white',
        textDecoration: 'none',
        borderRadius: '0 0 0.25rem 0.25rem',
        fontFamily: "'Figtree', sans-serif",
        fontSize: '0.875rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = '1rem';
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = '-9999px';
      }}
    >
      Skip to Content
    </a>
  );
}
