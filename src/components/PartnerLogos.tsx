import zooplaLogo from 'figma:asset/599b02647465336e4f2b1c1445e1b239d3eed18a.png';
import rightmoveLogo from 'figma:asset/bc1f3ddd6eab3ebc4b8b1ee320abe524c1baebbb.png';
import fiaLogo from 'figma:asset/5b62f8c03e2b13d2ace0a1eb4d56e1cdcc75416b.png';

// Logo components for partner platforms
function RightmoveLogo() {
  return (
    <img src={rightmoveLogo} alt="Rightmove" className="h-12 sm:h-10 w-auto" />
  );
}

function ZooplaLogo() {
  return (
    <img src={zooplaLogo} alt="Zoopla" className="h-12 sm:h-10 w-auto" />
  );
}

function FIALogo() {
  return (
    <img src={fiaLogo} alt="Federation of Independent Agents" className="h-12 sm:h-14 w-auto" />
  );
}

export function PartnerLogos() {
  const partners = [
    { name: "Rightmove", component: RightmoveLogo },
    { name: "Zoopla", component: ZooplaLogo },
    { name: "FIA", component: FIALogo }
  ];

  return (
    <section className="w-full bg-white px-6 sm:px-8 md:px-10 lg:px-12 py-8 sm:py-10 lg:py-12 border-t border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 lg:gap-16">
          {partners.map((partner, index) => {
            const LogoComponent = partner.component;
            return (
              <div key={index} className="flex items-center">
                <LogoComponent />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}