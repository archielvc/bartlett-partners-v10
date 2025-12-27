import { Reveal } from "../components/animations/Reveal";
import { PropertyCard } from "../components/PropertyCard";
import { PropertiesHero } from "../components/properties/PropertiesHero";
import { TestimonialsCarousel } from "../components/TestimonialsCarousel";
import { InsightsNewsletter } from "../components/insights/InsightsNewsletter";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../contexts/FavoritesContext";
import { applySEO, PAGE_SEO } from "../utils/seo";
import { getPublishedProperties, getPublishedTestimonials, getStored, getGlobalSettings } from "../utils/database";
import { trackPropertyFilter, trackEvent } from "../utils/analytics";
import type { Property } from "../types/property";
import type { Testimonial } from "../types/database";

const STATUS_MAPPING: Record<string, string[]> = {
  "Available": ["available"],
  "Sale Agreed": ["sale-agreed", "under-offer", "under_offer"],
  "Sold": ["sold"]
};

export default function Properties() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize from persistent cache for instant load
  const [properties, setProperties] = useState<Property[]>(() => {
    return getStored<Property[]>('properties_published') || [];
  });

  const [heroImage, setHeroImage] = useState<string | undefined>(undefined);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(() => properties.length === 0);

  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const propertiesGridRef = useRef<HTMLElement>(null);

  // Fetch properties from database
  useEffect(() => {
    applySEO('properties');
    const fetchProperties = async () => {
      // Don't show loading spinner if we already have data
      if (properties.length === 0) setIsLoading(true);

      const [propsData, testimonialData, globalSettings] = await Promise.all([
        getPublishedProperties(),
        getPublishedTestimonials(),
        getGlobalSettings<Record<string, string>>('page_hero_images').catch(() => ({}))
      ]);

      const images = globalSettings as Record<string, string> | null;
      if (images && images.properties) {
        setHeroImage(images.properties);
      }

      // Update state (this will refresh the UI if data changed)
      setProperties(propsData);
      setTestimonials(testimonialData);
      setIsLoading(false);
    };

    fetchProperties();
  }, []);

  const propertiesPerPage = 12;

  // Helper function to change page and scroll to top
  const changePage = (newPage: number, shouldScroll = true) => {
    trackEvent('click', 'Pagination', String(newPage));
    setCurrentPage(newPage);

    if (shouldScroll && propertiesGridRef.current) {
      // Small timeout to ensure DOM has updated and layout is stable
      // This fixes an issue on mobile where it would scroll to the footer
      setTimeout(() => {
        if (propertiesGridRef.current) {
          const element = propertiesGridRef.current;
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;

          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  };

  // Toggle availability filter
  const toggleAvailability = (status: string) => {
    const isAdding = !selectedAvailability.includes(status);
    if (isAdding) {
      trackPropertyFilter('Availability', status);
    }

    setSelectedAvailability(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
    changePage(1, false);
  };

  // Toggle price range filter
  const togglePriceRange = (range: string) => {
    const isAdding = !selectedPriceRanges.includes(range);
    if (isAdding) {
      trackPropertyFilter('Price Range', range);
    }

    setSelectedPriceRanges(prev =>
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
    changePage(1, false);
  };

  // Check if property matches price range
  const matchesPriceRange = (priceValue: number, range: string) => {
    switch (range) {
      case "Under £750K": return priceValue < 750000;
      case "£750K - £1.5M": return priceValue >= 750000 && priceValue < 1500000;
      case "£1.5M - £2.5M": return priceValue >= 1500000 && priceValue < 2500000;
      case "Over £2.5M": return priceValue >= 2500000;
      default: return false;
    }
  };

  // Filter and sort properties
  const filteredProperties = properties
    .filter(property => {
      const hasAvailabilityFilter = selectedAvailability.length > 0;
      const hasPriceFilter = selectedPriceRanges.length > 0;
      const hasSearchQuery = searchQuery.trim().length > 0;

      // Check availability filter
      const matchesAvailability = !hasAvailabilityFilter ||
        selectedAvailability.some(label => {
          const validStatuses = STATUS_MAPPING[label];
          return validStatuses ? validStatuses.includes(property.status) : false;
        });

      // Check price range filter
      const matchesPrice = !hasPriceFilter || selectedPriceRanges.some(range => matchesPriceRange(property.priceValue, range));

      // Check search query - searches title, location, price, beds, baths
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !hasSearchQuery || (
        property.title.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.price.toLowerCase().includes(query) ||
        String(property.beds).includes(query) ||
        String(property.baths).includes(query)
      );

      // AND logic: must match all active filters
      return matchesAvailability && matchesPrice && matchesSearch;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  const activeFilterCount = selectedAvailability.length + selectedPriceRanges.length;

  useEffect(() => {
    applySEO('properties');
  }, []);

  return (
    <main id="main-content">
      {/* Hero Section */}
      <PropertiesHero image={heroImage} />

      {/* Filter Section */}
      <Reveal width="100%" variant="fade-in">
        <section className="w-full bg-white border-b border-gray-100 shadow-sm">
          <div className="w-full px-6 md:px-12 lg:px-20 py-6">
            <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
              <p
                className="text-[#3A3A3A]"
                style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: "0.875rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase"
                }}
              >
                Showing {filteredProperties.length} {filteredProperties.length === 1 ? 'Residence' : 'Residences'}
              </p>

              <div className="flex items-center gap-6">
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      trackEvent('click', 'Filter', 'Clear All');
                      setSelectedAvailability([]);
                      setSelectedPriceRanges([]);
                      changePage(1, false);
                    }}
                    className="text-[#1A2551] hover:opacity-70 transition-opacity text-xs uppercase tracking-widest font-medium group"
                    style={{ fontFamily: "'Figtree', sans-serif" }}
                  >
                    <span className="premium-hover relative" data-text="Clear Filters">
                      <span>Clear Filters</span>
                    </span>
                  </button>
                )}

                <button
                  onClick={() => {
                    trackEvent('click', 'Filter', isFilterOpen ? 'Close' : 'Open');
                    setIsFilterOpen(!isFilterOpen);
                  }}
                  className={`flex items-center gap-3 px-8 h-11 rounded-full transition-all relative cursor-pointer ${isFilterOpen ? 'bg-[#1A2551] text-white' : 'border border-gray-200 text-[#1A2551] hover:border-[#1A2551]'
                    }`}
                  style={{
                    fontFamily: "'Figtree', sans-serif",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    fontWeight: 600
                  }}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="ml-2 w-5 h-5 bg-[#8E8567] text-white text-[10px] rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      changePage(1, false);
                    }}
                    className="pl-14 pr-4 h-11 rounded-full border border-gray-200 focus:border-[#1A2551] focus:ring-1 focus:ring-[#1A2551] outline-none text-sm w-64 transition-all"
                    style={{ fontFamily: "'Figtree', sans-serif" }}
                  />
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        changePage(1, false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A2551]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Panel Dropdown */}
          {isFilterOpen && (
            <div className="w-full border-t border-gray-100 bg-gray-50/50">
              <div className="w-full px-6 md:px-12 lg:px-20 py-12">
                <div className="max-w-[1600px] mx-auto">
                  <div className="grid md:grid-cols-2 gap-12 max-w-3xl">
                    {/* Availability Filter */}
                    <div>
                      <h3
                        className="text-[#1A2551] mb-6"
                        style={{
                          fontFamily: "'Figtree', sans-serif",
                          fontSize: "1rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em"
                        }}
                      >
                        Availability
                      </h3>
                      <div className="space-y-4">
                        {["Available", "Sale Agreed", "Sold"].map((status) => (
                          <label key={status} className="flex items-center gap-4 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={selectedAvailability.includes(status)}
                                onChange={() => toggleAvailability(status)}
                                className="w-5 h-5 border border-gray-300 rounded-none appearance-none checked:bg-[#1A2551] checked:border-[#1A2551] cursor-pointer transition-colors"
                              />
                              {selectedAvailability.includes(status) && (
                                <svg className="absolute w-3 h-3 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span
                              className="text-[#3A3A3A] group-hover:text-[#1A2551] transition-colors font-light"
                              style={{ fontFamily: "'Figtree', sans-serif" }}
                            >
                              {status}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <h3
                        className="text-[#1A2551] mb-6"
                        style={{
                          fontFamily: "'Figtree', sans-serif",
                          fontSize: "1rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em"
                        }}
                      >
                        Price Range
                      </h3>
                      <div className="space-y-4">
                        {["Under £750K", "£750K - £1.5M", "£1.5M - £2.5M", "Over £2.5M"].map((range) => (
                          <label key={range} className="flex items-center gap-4 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={selectedPriceRanges.includes(range)}
                                onChange={() => togglePriceRange(range)}
                                className="w-5 h-5 border border-gray-300 rounded-none appearance-none checked:bg-[#1A2551] checked:border-[#1A2551] cursor-pointer transition-colors"
                              />
                              {selectedPriceRanges.includes(range) && (
                                <svg className="absolute w-3 h-3 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span
                              className="text-[#3A3A3A] group-hover:text-[#1A2551] transition-colors font-light"
                              style={{ fontFamily: "'Figtree', sans-serif" }}
                            >
                              {range}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </Reveal>

      {/* Properties Grid */}
      <section ref={propertiesGridRef} className="w-full bg-white py-12 md:py-20">
        <div className="w-full px-6 md:px-12 lg:px-20">
          <div className="max-w-[1600px] mx-auto">
            {currentProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {currentProperties.map((property, index) => (
                  <Reveal key={property.id} delay={index * 0.1} className="h-full" width="100%">
                    <PropertyCard property={property} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <Reveal variant="fade-in">
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <h3 className="text-2xl text-[#1A2551] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>No properties found</h3>
                  <p className="text-gray-500 mb-8" style={{ fontFamily: "'Figtree', sans-serif" }}>Try adjusting your filters to see more results.</p>
                  <button
                    onClick={() => {
                      trackEvent('click', 'Filter', 'Clear All (Empty State)');
                      setSelectedAvailability([]);
                      setSelectedPriceRanges([]);
                      changePage(1, false);
                    }}
                    className="px-8 h-11 flex items-center justify-center bg-[#1A2551] text-white rounded-full text-xs uppercase tracking-widest hover:bg-[#1A2551]/90 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </Reveal>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-20">
                <button
                  onClick={() => changePage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-8 h-11 flex items-center justify-center rounded-full border transition-all duration-300 ${currentPage === 1
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'border-gray-300 text-[#1A2551] hover:border-[#1A2551] hover:bg-[#1A2551] hover:text-white cursor-pointer'
                    }`}
                  style={{
                    fontFamily: "'Figtree', sans-serif",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    fontWeight: 600
                  }}
                >
                  <span className={currentPage !== 1 ? "premium-hover" : ""} data-text="Previous">
                    <span>Previous</span>
                  </span>
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => changePage(page)}
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${currentPage === page
                        ? 'bg-[#1A2551] text-white'
                        : 'text-[#1A2551] hover:bg-gray-100'
                        }`}
                      style={{
                        fontFamily: "'Figtree', sans-serif",
                        fontSize: "0.875rem",
                        fontWeight: 600
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-8 h-11 flex items-center justify-center rounded-full border transition-all duration-300 ${currentPage === totalPages
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'border-gray-300 text-[#1A2551] hover:border-[#1A2551] hover:bg-[#1A2551] hover:text-white cursor-pointer'
                    }`}
                  style={{
                    fontFamily: "'Figtree', sans-serif",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    fontWeight: 600
                  }}
                >
                  <span className={currentPage !== totalPages ? "premium-hover" : ""} data-text="Next">
                    <span>Next</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <Reveal width="100%">
        <InsightsNewsletter
          title="Unlock Exclusive Access"
          description="Join our private register for off-market opportunities, market insights, and priority access to new collections."
        />
      </Reveal>

      {/* Testimonials Section */}
      <Reveal width="100%">
        <TestimonialsCarousel testimonials={testimonials} />
      </Reveal>
    </main>
  );
}