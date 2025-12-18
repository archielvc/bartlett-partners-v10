import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { Reveal } from "../components/animations/Reveal";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white pt-32 pb-20 flex flex-col items-center justify-center text-center px-6">
        <Reveal>
          <div className="space-y-6 max-w-lg">
            <h1 
              className="text-[#1A2551] text-8xl font-light opacity-20"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              404
            </h1>
            <h2 
              className="text-[#1A2551] text-4xl md:text-5xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Page Not Found
            </h2>
            <p className="text-gray-600 text-lg">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <div className="pt-4">
              <Button 
                onClick={() => navigate('/')}
                className="bg-[#1A2551] text-white px-8 py-6 rounded-lg text-sm uppercase tracking-widest hover:bg-[#1A2551]/90"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
