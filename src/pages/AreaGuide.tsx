import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { StickyScroll } from '../components/ui/StickyScroll';
import { ArrowDown, MapPin, Home, School, TreePine, Train, Coffee, Trophy, UtensilsCrossed, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyInquiryDialog } from '../components/PropertyInquiryDialog';
import { useEffect, useState } from 'react';
import { updateSEO, injectSchema } from '../utils/seo';

import { Button } from "../components/ui/button";
import { useSiteSettings } from "../contexts/SiteContext";
import { trackEvent, trackCTAClick } from '../utils/analytics';
import { getPublishedProperties } from '../utils/database';
import { Property } from '../types/property';

// Types for Area Data
interface AreaStats {
  avgPrice: string;
  growth: string;
  schools: string;
  transport: string;
}

interface AreaDetailSection {
  title: string;
  content: string;
  icon: any;
}

interface AreaData {
  name: string;
  heroImage: string;
  description: string;
  longDescription: string;
  detailedSections: AreaDetailSection[];
  stats: AreaStats;
  highlights: { title: string; desc: string; icon: any }[];
  quote: string;
  quoteAuthor: string;
}

const AREA_DATA: Record<string, AreaData> = {
  'twickenham': {
    name: 'Twickenham',
    heroImage: 'https://images.unsplash.com/photo-1566362776462-208c3430844c?auto=format&fit=crop&w=2000&q=80',
    description: 'Home to English rugby and exceptional value for families seeking southwest London living.',
    longDescription: 'Home to English rugby and a thriving community of families and young professionals, Twickenham offers exceptional value compared to neighbouring Richmond while delivering the same quality of life. Twickenham\'s property market is diverse, from Victorian terraces in St Margarets to substantial Edwardian family homes around Strawberry Hill. The riverside areas—particularly between Twickenham and Teddington—offer some of the most desirable addresses in southwest London. Entry-level family homes start around £650,000, with larger detached properties reaching £2-3 million. The sweet spot for most families is the £1-1.5 million bracket, which buys a spacious period home with garden.',
    detailedSections: [
      {
        title: "Property in Twickenham",
        content: "Twickenham's property market is diverse, from Victorian terraces to substantial Edwardian family homes around Strawberry Hill. The riverside areas offer some of the most desirable addresses in southwest London. Entry-level family homes start around £650,000, with larger detached properties reaching £2-3 million.",
        icon: Home
      },
      {
        title: "Living in Twickenham",
        content: "Beyond the rugby stadium, Twickenham offers excellent schools including St Mary's and Orleans Park, Marble Hill Park and the riverside towpath, York Street's independent shops and cafes, trains to Waterloo (25 minutes), and easy access to Heathrow and the M3/M4.",
        icon: Coffee
      },
      {
        title: "Transport & Connectivity",
        content: "Twickenham Station offers fast connections to London Waterloo in just 25 minutes. The area is well-served by bus routes connecting to Richmond, Kingston, and Heathrow Airport. Road routes via the A316 and M3 make travel beyond London straightforward.",
        icon: Train
      }
    ],
    stats: {
      avgPrice: '£1.1M',
      growth: '+4.2%',
      schools: '12 Outstanding',
      transport: '25min to Waterloo'
    },
    highlights: [
      { title: 'Riverside Living', desc: 'Miles of scenic towpaths and river clubs.', icon: TreePine },
      { title: 'Top Schools', desc: 'Strong mix of state and private schools.', icon: School },
      { title: 'Great Value', desc: 'Better value than Richmond, same quality of life.', icon: Home },
    ],
    quote: "Twickenham attracts buyers priced out of Richmond who want the same lifestyle at better value. It also draws rugby enthusiasts, families seeking school catchments, and professionals wanting green space without sacrificing the commute.",
    quoteAuthor: "Bartlett & Partners"
  },
  'teddington': {
    name: 'Teddington',
    heroImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2000&q=80',
    description: 'Regularly voted one of London\'s best places to live—a genuine village atmosphere within the city.',
    longDescription: 'Regularly voted one of London\'s best places to live, Teddington combines a genuine village atmosphere with excellent schools, independent shops, and easy access to central London. Teddington\'s housing stock ranges from Victorian cottages to substantial Edwardian villas. The area around the High Street and Waldegrave Road offers classic family homes, while the riverside properties near Teddington Lock are among the most prestigious in the borough. Flats and smaller homes start around £450,000, with typical family houses in the £900,000-£1.5 million range. Premium riverside and period properties can exceed £3 million.',
    detailedSections: [
      {
        title: "Property in Teddington",
        content: "Teddington's housing stock ranges from Victorian cottages to substantial Edwardian villas. The area around the High Street and Waldegrave Road offers classic family homes, while riverside properties near Teddington Lock are among the most prestigious in the borough. Flats start around £450,000, with family houses typically £900,000-£1.5 million.",
        icon: Home
      },
      {
        title: "Living in Teddington",
        content: "Teddington's appeal lies in its sense of community: The High Street's independent shops, cafes, and restaurants, Bushy Park on your doorstep, outstanding schools at all levels, Teddington Lock and the riverside, trains to Waterloo (30 minutes), and The Landmark Arts Centre and thriving local theatre scene.",
        icon: Coffee
      },
      {
        title: "Transport Links",
        content: "Teddington offers a reliable commute with trains to London Waterloo taking approximately 30 minutes. The area is well-connected by bus routes to Richmond, Kingston, and beyond. The proximity to both the M3 and M25 makes weekend travel effortless.",
        icon: Train
      }
    ],
    stats: {
      avgPrice: '£950k',
      growth: '+3.8%',
      schools: '8 Outstanding',
      transport: '30min to Waterloo'
    },
    highlights: [
      { title: 'Bushy Park', desc: '1,000 acres of royal parkland on your doorstep.', icon: TreePine },
      { title: 'Village Life', desc: 'Genuine village atmosphere within London.', icon: MapPin },
      { title: 'River & Lock', desc: 'The largest lock on the Thames, perfect for walks.', icon: Home },
    ],
    quote: "Our office is in Teddington—we live here, we know the streets, we know the buyers. This local expertise translates into accurate valuations, effective marketing, and faster sales.",
    quoteAuthor: "Bartlett & Partners"
  },
  'kew': {
    name: "Kew",
    heroImage: "https://images.unsplash.com/photo-1548330956-251a420d6bd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000",
    description: "Famous for its botanical gardens—a refined village atmosphere just 30 minutes from central London.",
    longDescription: "Famous for its botanical gardens, Kew offers a refined village atmosphere just 30 minutes from central London. The combination of green space, architectural heritage, and excellent transport makes it perennially popular with families and professionals. Kew's property market centres on elegant Victorian and Edwardian homes, many with generous gardens backing onto the green belt. The streets around Kew Green and North Road are particularly sought-after, while Kew Village offers a mix of apartments and townhouses. Prices start around £600,000 for flats, with family homes typically £1.2-2.5 million. Exceptional properties near the Gardens can exceed £4 million.",
    detailedSections: [
      {
        title: "Property in Kew",
        content: "Kew's property market centres on elegant Victorian and Edwardian homes, many with generous gardens backing onto the green belt. The streets around Kew Green and North Road are particularly sought-after. Prices start around £600,000 for flats, with family homes typically £1.2-2.5 million.",
        icon: Home
      },
      {
        title: "Living in Kew",
        content: "Beyond the world-famous Gardens: Kew Village's boutique shops and restaurants, the Thames towpath to Richmond and Chiswick, outstanding primary schools, District Line to central London, the National Archives, and a genuine village community.",
        icon: TreePine
      },
      {
        title: "Transport & Connectivity",
        content: "Kew Gardens station connects you to the District Line and London Overground. Kew Bridge station offers National Rail services to Waterloo. The M4 is easily accessible for travel to Heathrow and the West.",
        icon: Train
      }
    ],
    stats: {
      avgPrice: '£1.3M',
      growth: '+5.1%',
      schools: '9 Outstanding',
      transport: '30min to Victoria'
    },
    highlights: [
      { title: 'Royal Botanic Gardens', desc: 'World-leading botanic garden on your doorstep.', icon: TreePine },
      { title: 'Kew Green', desc: 'Historic cricket green surrounded by period homes.', icon: Trophy },
      { title: 'Village Community', desc: 'Boutique shops and genuine community spirit.', icon: MapPin },
    ],
    quote: "Kew attracts discerning buyers who appreciate quality and heritage. Properties here require marketing that matches their calibre—professional presentation, strategic pricing, and targeted exposure to qualified buyers.",
    quoteAuthor: "Bartlett & Partners"
  },
  'ham': {
    name: "Ham",
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80",
    description: "A tranquil village between Richmond Park and the Thames—space, nature, and a slower pace of life.",
    longDescription: "Tucked between Richmond Park and the Thames, Ham offers something increasingly rare: a genuine village atmosphere within Greater London. This quiet, family-focused community attracts buyers seeking space, nature, and a slower pace of life. Ham's housing stock is predominantly family-oriented—detached and semi-detached houses with gardens, many dating from the 1930s-1960s. The area offers more space for your money than neighbouring Richmond, with prices typically 20-30% lower for comparable properties. Family homes range from £700,000 to £1.5 million, with larger detached houses occasionally exceeding £2 million.",
    detailedSections: [
      {
        title: "Property in Ham",
        content: "Ham's housing stock is predominantly family-oriented—detached and semi-detached houses with gardens, many dating from the 1930s-1960s. The area offers more space for your money than neighbouring Richmond. Family homes range from £700,000 to £1.5 million, with larger detached houses occasionally exceeding £2 million.",
        icon: Home
      },
      {
        title: "Living in Ham",
        content: "Ham's appeal is its tranquillity: direct access to Richmond Park, the Thames towpath on your doorstep, Ham House and Gardens (National Trust), strong community spirit, good local primary schools, and bus links to Richmond and Kingston.",
        icon: TreePine
      },
      {
        title: "Transport & Connectivity",
        content: "While Ham doesn't have its own station, excellent bus links connect to Richmond (District Line/Overground) and Kingston. The proximity to Richmond Park and the Thames Path makes it ideal for those who value green space over rail proximity.",
        icon: Train
      }
    ],
    stats: {
      avgPrice: '£1.1M',
      growth: '+4.0%',
      schools: '6 Outstanding',
      transport: '10min bus to Richmond'
    },
    highlights: [
      { title: 'Richmond Park Access', desc: 'Direct access to 2,500 acres of parkland.', icon: TreePine },
      { title: 'Village Tranquillity', desc: 'Genuine village atmosphere within London.', icon: MapPin },
      { title: 'Ham House', desc: 'National Trust historic house and gardens.', icon: Home },
    ],
    quote: "Ham attracts buyers who've discovered its secret—families wanting outdoor space, dog owners, and those escaping busier areas. We understand what makes Ham special and how to market its unique lifestyle appeal.",
    quoteAuthor: "Bartlett & Partners"
  },
  'st-margarets': {
    name: "St Margarets",
    heroImage: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=2000&q=80",
    description: "A hidden gem between Richmond and Twickenham—village charm with urban convenience.",
    longDescription: "Tucked between Richmond and Twickenham, St Margarets offers the best of both worlds: a genuine village atmosphere with easy access to London. This residential enclave attracts families seeking excellent schools, green space, and a strong sense of community without the premium of neighbouring Richmond. St Margarets' property market features a mix of Victorian and Edwardian family homes, 1930s semis, and some new developments. The tree-lined streets around St Margarets Road and Crown Road are particularly desirable. Family homes typically range from £800,000 to £2 million.",
    detailedSections: [
      {
        title: "Property in St Margarets",
        content: "St Margarets features a mix of Victorian and Edwardian family homes, 1930s semis, and some new developments. The tree-lined streets around St Margarets Road and Crown Road are particularly desirable. Family homes typically range from £800,000 to £2 million.",
        icon: Home
      },
      {
        title: "Living in St Margarets",
        content: "St Margarets combines village charm with urban convenience: local shops and cafés along St Margarets Road, Marble Hill Park on your doorstep, excellent schools including St Stephens and Orleans Park, easy walking distance to both Richmond and Twickenham, and a strong community spirit.",
        icon: Coffee
      },
      {
        title: "Transport & Connectivity",
        content: "St Margarets station offers direct trains to London Waterloo in about 25 minutes. Buses connect to Richmond, Twickenham, and beyond. The area is well-positioned for both the A316 and South Circular routes.",
        icon: Train
      }
    ],
    stats: {
      avgPrice: '£1.2M',
      growth: '+4.5%',
      schools: '10 Outstanding',
      transport: '25min to Waterloo'
    },
    highlights: [
      { title: 'Marble Hill Park', desc: 'Beautiful riverside parkland and historic house.', icon: TreePine },
      { title: 'Village Feel', desc: 'Local shops, cafés, and genuine community.', icon: MapPin },
      { title: 'Best of Both', desc: 'Near Richmond and Twickenham amenities.', icon: Home },
    ],
    quote: "St Margarets attracts savvy buyers who've done their research. They want the lifestyle of Richmond at a more accessible price point, with excellent schools and a real sense of community. We know every street.",
    quoteAuthor: "Bartlett & Partners"
  }
};

export default function AreaGuide() {
  const { slug } = useParams<{ slug: string }>();
  const normalizedSlug = slug?.toLowerCase() || 'twickenham';
  const data = AREA_DATA[normalizedSlug] || AREA_DATA['twickenham'];

  const { images } = useSiteSettings();
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      const data = await getPublishedProperties();
      setProperties(data);
    };
    fetchProperties();
  }, []);

  // Dynamic CMS Image Override
  const cmsKey = `l_${normalizedSlug.replace('-', '_')}`;
  const heroImage = (images.locations as any)[cmsKey] || data.heroImage;

  // Scroll to top on mount and update SEO
  useEffect(() => {
    window.scrollTo(0, 0);

    updateSEO({
      title: `Living in ${data.name} - Bartlett & Partners Area Guide`,
      description: data.description,
      ogImage: heroImage,
      type: 'article',
      keywords: [`living in ${data.name}`, `${data.name} area guide`, 'London areas', 'luxury neighborhoods']
    });

    injectSchema({
      "@context": "https://schema.org",
      "@type": "Place",
      "name": data.name,
      "description": data.description,
      "image": heroImage,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": data.name,
        "addressRegion": "London",
        "addressCountry": "UK"
      }
    });
  }, [normalizedSlug, data, heroImage]);

  // Filter properties for this area
  const areaProperties = properties
    .filter(p => p.status.toLowerCase() === 'available')
    .filter(p =>
      (p.location || '').toLowerCase().includes(data.name.toLowerCase()) ||
      (p.address || '').toLowerCase().includes(data.name.toLowerCase())
    );



  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] md:h-[80vh] rounded-br-[80px] md:rounded-br-[180px] overflow-hidden bg-[#1A2551]">
        <ImageWithFallback
          src={heroImage}
          alt={data.name}
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24">
          <div className="max-w-4xl pt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-[1px] w-12 bg-white/80"></div>
              <span className="text-white uppercase tracking-[0.2em] text-sm font-bold">Area Guide</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-white text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
            >
              Living in <br /> {data.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-white/90 text-lg md:text-xl font-light max-w-xl leading-relaxed"
              style={{ fontFamily: "'Figtree', sans-serif" }}
            >
              {data.description}
            </motion.p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/80"
        >
          <ArrowDown className="w-8 h-8 animate-bounce font-light" strokeWidth={1.5} />
        </motion.div>
      </section>

      {/* Detailed Info Section */}
      <section className="py-12 md:py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Left Column: Description & Quote */}
          <div className="lg:col-span-7">
            <h2 className="text-[#1A2551] text-4xl font-serif font-light mb-8">About {data.name}</h2>
            <p className="text-[#1A2551]/70 text-lg leading-relaxed mb-8">
              {data.longDescription}
            </p>
            <div className="grid grid-cols-1 gap-8 mt-12">
              {data.detailedSections.map((section, idx) => (
                <div className="border-t border-[#1A2551]/10 pt-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F5F5F0] flex items-center justify-center text-[#1A2551] shrink-0">
                      <section.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-[#1A2551] text-xl font-serif font-light mb-2">{section.title}</h3>
                      <p className="text-[#1A2551]/60 leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Stats Sticky */}
          <div className="lg:col-span-5 lg:self-start">
            <StickyScroll topOffset={96}>
            <blockquote className="border-l-4 border-[#8E8567] pl-6 py-4 italic text-[#1A2551]/80 text-xl font-serif font-light mb-12 bg-[#F9F9F9] p-6 rounded-r-xl">
              "{data.quote}"
              <footer className="text-sm text-[#1A2551]/50 mt-3 font-sans not-italic uppercase tracking-widest">— {data.quoteAuthor}</footer>
            </blockquote>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 bg-[#1A2551] text-white rounded-2xl h-full">
                <p className="text-[#8E8567] text-sm uppercase tracking-[0.2em] font-bold mb-2">Average Price</p>
                <p className="text-white text-3xl font-serif">{data.stats.avgPrice}</p>
                <p className="text-green-400 text-sm mt-2 font-medium">{data.stats.growth} <span className="text-white/40 font-normal text-xs">Past 12 Months</span></p>
              </div>
              <div className="p-8 bg-[#F5F5F0] rounded-2xl h-full">
                <p className="text-[#8E8567] text-sm uppercase tracking-[0.2em] font-bold mb-2">Transport</p>
                <p className="text-[#1A2551] text-3xl font-serif leading-tight">{data.stats.transport}</p>
              </div>
              <div className="p-8 bg-[#F5F5F0] rounded-2xl sm:col-span-2">
                <p className="text-[#8E8567] text-sm uppercase tracking-[0.2em] font-bold mb-2">Education</p>
                <p className="text-[#1A2551] text-3xl font-serif">{data.stats.schools}</p>
                <p className="text-[#1A2551]/60 text-sm mt-2">Rated 'Outstanding' by Ofsted</p>
              </div>
            </div>
            </StickyScroll>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-12 md:py-20 bg-[#1A2551] text-white px-6 md:px-12 lg:px-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {data.highlights.map((highlight, idx) => (
              <div className="text-center md:text-left">
                <div className="w-12 h-12 rounded-full bg-[#8E8567]/20 flex items-center justify-center text-[#8E8567] mb-6 mx-auto md:mx-0">
                  <highlight.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif font-light mb-3">{highlight.title}</h3>
                <p className="text-white/60 leading-relaxed">{highlight.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Properties in Area (White Background) */}
      <section className="py-12 md:py-20 px-6 md:px-12 lg:px-20 bg-white">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div>
              <span className="block text-[#8E8567] text-sm tracking-[0.2em] uppercase mb-3 font-bold">Market Availability</span>
              <h2 className="text-[#1A2551] text-4xl md:text-5xl font-serif font-light">Homes in {data.name}</h2>
            </div>
            <Link
              to={`/properties?location=${data.name}`}
              onClick={() => trackEvent('click', 'Area Guide', `View All ${data.name} Properties`)}
              className="hidden md:flex items-center gap-2 text-[#1A2551] hover:text-[#8E8567] transition-colors"
            >
              <span className="uppercase tracking-widest text-sm font-medium">View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {areaProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {areaProperties.slice(0, 3).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-[#1A2551]/20 rounded-xl">
              <p className="text-[#1A2551]/50">No properties currently available in {data.name}.</p>
              <Link
                to="/contact"
                onClick={() => trackCTAClick('Register Interest', `Area Guide ${data.name}`)}
                className="text-[#8E8567] mt-2 inline-block hover:underline"
              >
                Register your interest
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Spiced Up CTA (Grey Background) */}
      <section className="py-12 md:py-20 bg-[#F5F5F0] px-6">
        <div className="max-w-[1600px] mx-auto relative">

          {/* Decorative Border Container */}
          <div className="border border-[#1A2551]/10 p-2 md:p-4">
            <div className="bg-white py-12 md:py-16 px-8 md:px-16 text-center relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#8E8567]/30"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#8E8567]/30"></div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="block text-[#8E8567] text-sm font-bold uppercase tracking-[0.2em] mb-6">Your Next Chapter</span>
                <h2 className="text-[#1A2551] text-4xl md:text-6xl font-serif font-light mb-6">
                  Thinking of moving to {data.name}?
                </h2>
                <p className="text-[#1A2551]/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                  Whether you're looking for a riverside retreat or a family home near outstanding schools, our local experts are here to guide your journey.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  {/* Primary CTA */}
                  <div onClick={() => trackCTAClick('Enquire Now', `Area Guide ${data.name}`)}>
                    <PropertyInquiryDialog
                      isMultiProperty={true}
                      trigger={
                        <Button
                          className="group relative px-10 h-11 bg-[#1A2551] text-white overflow-hidden transition-all hover:shadow-xl min-w-[200px]"
                          style={{
                            fontFamily: "'Figtree', sans-serif",
                          }}
                        >
                          <div className="absolute inset-0 w-0 bg-[#8E8567] transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></div>
                          <span className="relative uppercase tracking-widest text-sm font-medium flex items-center justify-center gap-2">
                            <span className="premium-hover" data-text="Enquire Now">
                              <span>Enquire Now</span>
                            </span>
                          </span>
                        </Button>
                      }
                    />
                  </div>

                  {/* Secondary CTA */}
                  <Link to="/properties" onClick={() => trackCTAClick('Browse Properties', `Area Guide ${data.name}`)}>
                    <Button
                      variant="outline"
                      className="group px-10 h-11 border-[#1A2551]/20 text-[#1A2551] hover:border-[#1A2551] transition-all min-w-[200px]"
                    >
                      <span className="uppercase tracking-widest text-sm font-medium flex items-center justify-center gap-2">
                        <span className="premium-hover" data-text="Browse Properties">
                          <span>Browse Properties</span>
                        </span>
                      </span>
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

// Helper for ArrowRight