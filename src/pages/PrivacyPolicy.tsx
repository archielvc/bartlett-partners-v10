import React from 'react';
import { motion } from 'motion/react';
import { useSiteSettings } from "../contexts/SiteContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function PrivacyPolicy() {
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
                Privacy Policy
              </h1>
              <p className="text-[#1A2551] font-medium text-lg" style={{ fontFamily: "'Figtree', sans-serif" }}>
                Last Updated On 02-Apr-2024<br />
                Effective Date 02-Apr-2024
              </p>
              <div className="space-y-4 text-gray-600 font-light leading-relaxed" style={{ fontFamily: "'Figtree', sans-serif" }}>
                <p>
                  This Privacy Policy describes the policies of Bartlett & Partners, 26 The Quadrant, Richmond, London TW9 1DL, United Kingdom of Great Britain and Northern Ireland (the), email: info@bartlettandpartners.com, phone: 020 8614 1441 on the collection, use and disclosure of your information that we collect when you use our website ( https://www.bartlettandpartners.com ). (the "Service"). By accessing or using the Service, you are consenting to the collection, use and disclosure of your information in accordance with this Privacy Policy. If you do not consent to the same, please do not access or use the Service.
                </p>
                <p>
                  We may modify this Privacy Policy at any time without any prior notice to you and will post the revised Privacy Policy on the Service. The revised Policy will be effective 180 days from when the revised Policy is posted in the Service and your continued access or use of the Service after such time will constitute your acceptance of the revised Privacy Policy. We therefore recommend that you periodically review this page.
                </p>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {/* Section 1 */}
              <section className="space-y-4">
                <h2 className="text-xl text-[#1A2551] font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  1. Information We Collect:
                </h2>
                <div className="pl-4 text-gray-600 font-light leading-relaxed space-y-2" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  <p>We will collect and process the following personal information about you:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Name</li>
                    <li>Email</li>
                    <li>Mobile</li>
                  </ul>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-4">
                <h2 className="text-xl text-[#1A2551] font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  2. How We Use Your Information:
                </h2>
                <div className="pl-4 text-gray-600 font-light leading-relaxed space-y-2" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  <p>We will use the information that we collect about you for the following purposes:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Marketing/ Promotional</li>
                  </ul>
                  <p className="mt-4">
                    If we want to use your information for any other purpose, we will ask you for consent and will use your information only on receiving your consent and then, only for the purpose(s) for which grant consent unless we are required to do otherwise by law.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-4">
                <h2 className="text-xl text-[#1A2551] font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  3. How We Share Your Information:
                </h2>
                <div className="pl-4 text-gray-600 font-light leading-relaxed space-y-2" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  <p>We will not transfer your personal information to any third party without seeking your consent, except in limited circumstances as described below:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Data collection & process</li>
                  </ul>
                  <p className="mt-4">
                    We require such third party’s to use the personal information we transfer to them only for the purpose for which it was transferred and not to retain it for longer than is required for fulfilling the said purpose.
                  </p>
                  <p>
                    We may also disclose your personal information for the following: (1) to comply with applicable law, regulation, court order or other legal process; (2) to enforce your agreements with us, including this Privacy Policy; or (3) to respond to claims that your use of the Service violates any third-party rights. If the Service or our company is merged or acquired with another company, your information will be one of the assets that is transferred to the new owner.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section className="space-y-4">
                <h2 className="text-xl text-[#1A2551] font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  4. Retention Of Your Information:
                </h2>
                <div className="pl-4 text-gray-600 font-light leading-relaxed" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  <p>
                    We will retain your personal information with us for 90 days to 2 years after user accounts remain idle or for as long as we need it to fulfill the purposes for which it was collected as detailed in this Privacy Policy. We may need to retain certain information for longer periods such as record-keeping / reporting in accordance with applicable law or for other legitimate reasons like enforcement of legal rights, fraud prevention, etc. Residual anonymous information and aggregate information, neither of which identifies you (directly or indirectly), may be stored indefinitely.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section className="space-y-4">
                <h2 className="text-xl text-[#1A2551] font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  5. Your Rights:
                </h2>
                <div className="pl-4 text-gray-600 font-light leading-relaxed" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  <p>
                    Depending on the law that applies, you may have a right to access and rectify or erase your personal data or receive a copy of your personal data, restrict or object to the active processing of your data, ask us to share (port) your personal information to another entity, withdraw any consent you provided to us to process your data, a right to lodge a complaint with a statutory authority and such other rights as may be relevant under applicable laws. To exercise these rights, you can write to us at info@bartlettandpartners.com. We will respond to your request in accordance with applicable law.
                  </p>
                  <p className="mt-4">
                    Do note that if you do not allow us to collect or process the required personal information or withdraw the consent to process the same for the required purposes, you may not be able to access or use the services for which your information was sought.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section className="space-y-4">
                <h2 className="text-xl text-[#1A2551] font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  6. Cookies Etc.
                </h2>
                <div className="pl-4 text-gray-600 font-light leading-relaxed" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  <p>
                    To learn more about how we use these and your choices in relation to these tracking technologies, please refer to our <a href="/cookie-policy" className="underline hover:text-[#C5A059] transition-colors">Cookie Policy.</a>
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section className="space-y-4">
                <h2 className="text-xl text-[#1A2551] font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  7. Security:
                </h2>
                <div className="pl-4 text-gray-600 font-light leading-relaxed" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  <p>
                    The security of your information is important to us and we will use reasonable security measures to prevent the loss, misuse or unauthorized alteration of your information under our control. However, given the inherent risks, we cannot guarantee absolute security and consequently, we cannot ensure or warrant the security of any information you transmit to us and you do so at your own risk.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section className="space-y-4">
                <h2 className="text-xl text-[#1A2551] font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  8. Third Party Links & Use Of Your Information:
                </h2>
                <div className="pl-4 text-gray-600 font-light leading-relaxed" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  <p>
                    Our Service may contain links to other websites that are not operated by us. This Privacy Policy does not address the privacy policy and other practices of any third parties, including any third party operating any website or service that may be accessible via a link on the Service. We strongly advise you to review the privacy policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section className="space-y-4">
                <h2 className="text-xl text-[#1A2551] font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  9. Grievance / Data Protection Officer:
                </h2>
                <div className="pl-4 text-gray-600 font-light leading-relaxed" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  <p>
                    If you have any queries or concerns about the processing of your information that is available with us, you may email our Grievance Officer at Bartlett & Partners, 26 The Quadrant, Richmond, email: info@bartlettandpartners.com. We will address your concerns in accordance with applicable law.
                  </p>
                </div>
              </section>

              <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
                <p>Privacy Policy generated with CookieYes.</p>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}