import { BookEvaluationDialog } from "./BookEvaluationDialog";
import { Button } from "./ui/button";
import { useNavigate, Link } from "react-router-dom";
import { TYPOGRAPHY, COLORS, SPACING } from "../utils/designTokens";

interface CTASectionProps {
  title: string;
  description?: string;
  primaryCTA?: {
    text: string;
    type: 'book-valuation' | 'properties' | 'contact';
  };
  secondaryCTA?: {
    text: string;
    type: 'properties' | 'contact' | 'insights';
  };
  variant?: 'default' | 'centered' | 'minimal';
}

export function CTASection({
  title,
  description,
  primaryCTA = { text: 'Book Free Valuation', type: 'book-valuation' },
  secondaryCTA,
  variant = 'default'
}: CTASectionProps) {
  const navigate = useNavigate();


  const isCentered = variant === 'centered';
  const isMinimal = variant === 'minimal';

  return (
    <section
      className="w-full"
      style={{
        backgroundColor: isMinimal ? 'transparent' : COLORS.neutral.background,
        padding: isMinimal ? `${SPACING.xl} 0` : `${SPACING['2xl']} 0`,
      }}
    >
      <div
        className={`max-w-[1280px] mx-auto px-6 lg:px-16 ${isCentered ? 'text-center' : ''}`}
      >
        <h2
          style={{
            fontFamily: TYPOGRAPHY.fonts.heading,
            fontSize: `clamp(${TYPOGRAPHY.scale.xl}, 4vw, ${TYPOGRAPHY.scale['3xl']})`,
            color: COLORS.primary.main,
            lineHeight: TYPOGRAPHY.lineHeight.tight,
            marginBottom: description ? SPACING.md : SPACING.lg,
          }}
        >
          {title}
        </h2>

        {description && (
          <p
            style={{
              fontFamily: TYPOGRAPHY.fonts.body,
              fontSize: TYPOGRAPHY.scale.lg,
              color: COLORS.text.secondary,
              lineHeight: TYPOGRAPHY.lineHeight.relaxed,
              marginBottom: SPACING.lg,
              maxWidth: isCentered ? '48rem' : 'none',
              marginLeft: isCentered ? 'auto' : '0',
              marginRight: isCentered ? 'auto' : '0',
            }}
          >
            {description}
          </p>
        )}

        <div className={`flex gap-4 ${isCentered ? 'justify-center' : ''} flex-wrap`}>
          {primaryCTA.type === 'book-valuation' ? (
            <BookEvaluationDialog
              trigger={
                <Button>
                  {primaryCTA.text}
                </Button>
              }
            />
          ) : (
            <Button asChild>
              <Link to={`/${primaryCTA.type}`}>
                {primaryCTA.text}
              </Link>
            </Button>
          )}

          {secondaryCTA && (
            <Button
              variant="outline"
              asChild
            >
              <Link to={`/${secondaryCTA.type}`}>
                {secondaryCTA.text}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
