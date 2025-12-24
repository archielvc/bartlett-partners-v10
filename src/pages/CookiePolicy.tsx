import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { useCookie } from '../contexts/CookieContext';
import { useSiteSettings } from "../contexts/SiteContext";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";

export default function CookiePolicy() {
  const { openSettings } = useCookie();
  const { images } = useSiteSettings();

  return (
    <div className="w-full bg-white">

      <div className="w-full pt-32 md:pt-40 pb-24">
        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-6 md:px-12"
        >
          <div className="space-y-12 pt-8">

            {/* Introduction */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl text-[#1A2551] font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>
                Cookie Policy
              </h1>
              <p className="text-[#1A2551] font-medium text-lg" style={{ fontFamily: "'Figtree', sans-serif" }}>
                Effective Date: 02-Apr-2024<br />
                Last Updated: 02-Apr-2024
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-10">
              {/* Section 1 */}
              <section className="space-y-4">
                <h2 className="text-2xl text-[#1A2551] font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  What are cookies?
                </h2>
                <div className="text-gray-600 font-light leading-relaxed space-y-4" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  <p>
                    This Cookie Policy explains what cookies are and how we use them, the types of cookies we use i.e, the information we collect using cookies and how that information is used, and how to manage the cookie settings.
                  </p>
                  <p>
                    Cookies are small text files that are used to store small pieces of information. They are stored on your device when the website is loaded on your browser. These cookies help us make the website function properly, make it more secure, provide better user experience, and understand how the website performs and to analyze what works and where it needs improvement.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-4">
                <h2 className="text-2xl text-[#1A2551] font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  How do we use cookies?
                </h2>
                <div className="text-gray-600 font-light leading-relaxed space-y-4" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  <p>
                    As most of the online services, our website uses first-party and third-party cookies for several purposes. First-party cookies are mostly necessary for the website to function the right way, and they do not collect any of your personally identifiable data.
                  </p>
                  <p>
                    The third-party cookies used on our website are mainly for understanding how the website performs, how you interact with our website, keeping our services secure, providing advertisements that are relevant to you, and all in all providing you with a better and improved user experience and help speed up your future interactions with our website.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-4">
                <h2 className="text-2xl text-[#1A2551] font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  Types of Cookies we use
                </h2>
                <div className="text-gray-600 font-light leading-relaxed" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  <p className="italic text-sm text-gray-500 mb-4">
                    [Detailed cookie tables would appear here - currently configured to show only necessary functional cookies]
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section className="space-y-6" id="cookie-settings">
                <h2 className="text-2xl text-[#1A2551] font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  Manage cookie preferences
                </h2>

                <div className="my-6">
                  <Button
                    className="bg-[#1A2551] text-white border-2 border-[#1A2551] hover:bg-transparent hover:text-[#1A2551] rounded-md px-8 py-6 uppercase text-xs tracking-widest font-bold transition-all"
                    onClick={openSettings}
                  >
                    Cookie Settings
                  </Button>
                </div>

                <div className="text-gray-600 font-light leading-relaxed space-y-4" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  <p>
                    You can change your cookie preferences any time by clicking the above button. This will let you revisit the cookie consent banner and change your preferences or withdraw your consent right away.
                  </p>
                  <p>
                    In addition to this, different browsers provide different methods to block and delete cookies used by websites. You can change the settings of your browser to block/delete the cookies. Listed below are the links to the support documents on how to manage and delete cookies from the major web browsers.
                  </p>

                  <div className="space-y-2 text-sm mt-4">
                    <p>
                      <span className="font-medium">Chrome:</span> <a href="https://support.google.com/accounts/answer/32050" target="_blank" rel="noopener noreferrer" className="text-[#1A2551] underline hover:text-[#C5A059]">https://support.google.com/accounts/answer/32050</a>
                    </p>
                    <p>
                      <span className="font-medium">Safari:</span> <a href="https://support.apple.com/en-in/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#1A2551] underline hover:text-[#C5A059]">https://support.apple.com/en-in/guide/safari/sfri11471/mac</a>
                    </p>
                    <p>
                      <span className="font-medium">Firefox:</span> <a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noopener noreferrer" className="text-[#1A2551] underline hover:text-[#C5A059]">https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox</a>
                    </p>
                    <p>
                      <span className="font-medium">Internet Explorer:</span> <a href="https://support.microsoft.com/en-us/topic/how-to-delete-cookie-files-in-internet-explorer-bca9446f-d873-78de-77ba-d42645fa52fc" target="_blank" rel="noopener noreferrer" className="text-[#1A2551] underline hover:text-[#C5A059]">https://support.microsoft.com/en-us/topic/how-to-delete-cookie-files-in-internet-explorer</a>
                    </p>
                  </div>

                  <p className="mt-6">
                    If you are using any other web browser, please visit your browser's official support documents.
                  </p>
                </div>
              </section>

              <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
                <p>Cookie Policy Generated By <span className="font-medium text-[#1A2551]">CookieYes - Cookie Policy Generator</span>.</p>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}