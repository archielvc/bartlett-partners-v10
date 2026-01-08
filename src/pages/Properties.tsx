
import { PropertyCard } from "../components/PropertyCard";
import { PageHeader } from "../components/global/PageHeader";
import { TestimonialsCarousel } from "../components/TestimonialsCarousel";
import { InsightsNewsletter } from "../components/insights/InsightsNewsletter";
import { PropertyFilterMultiSelect } from "../components/filters";
import { Search, X } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFavorites } from "../contexts/FavoritesContext";
import { applySEO, PAGE_SEO } from "../utils/seo";
import { getPublishedProperties, getPublishedTestimonials, getStored, getGlobalSettings } from "../utils/database";
import { trackPropertyFilter, trackEvent } from "../utils/analytics";
import { useAreas } from "../hooks/useAreas";
import type { Property } from "../types/property";
import type { Testimonial } from "../types/database";

const STATUS_MAPPING: Record<string, string[]> = {
  "Available": ["available"],
  "Sale Agreed": ["sale-agreed", "under-offer", "under_offer"],
  "Sold": ["sold"]
};

export default function Properties() {
  const [searchParams] = useSearchParams();
  const { data: areas = [] } = useAreas();

  // Build location options from database areas (just the names for multi-select)
  const locationOptions = useMemo(() => {
    return areas.map(a => a.name);
  }, [areas]);

  const [selectedLocations, setSelectedLocations] = useState<string[]>(() => {
    const locationParam = searchParams.get("location");
    // Support comma-separated locations in URL
    return locationParam ? locationParam.split(',').filter(Boolean) : [];
  });

  // Sync selectedLocations with URL search params whenever they change
  useEffect(() => {
    const locationParam = searchParams.get("location");
    if (locationParam) {
      // Support comma-separated locations in URL
      const locations = locationParam.split(',').filter(Boolean);
      setSelectedLocations(locations);
    } else {
      setSelectedLocations([]);
    }
  }, [searchParams]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize from persistent cache for instant load
  const [properties, setProperties] = useState<Property[]>(() => {
    return getStored<Property[]>('properties_published') || [];
  });

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

      const [propsData, testimonialData] = await Promise.all([
        getPublishedProperties(),
        getPublishedTestimonials()
      ]);

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
      const hasLocationFilter = selectedLocations.length > 0;

      // Check location filter (matches if property location includes ANY selected location)
      const matchesLocation = !hasLocationFilter ||
        selectedLocations.some(loc =>
          (property.location || '').toLowerCase().includes(loc.toLowerCase()) ||
          (property.address || '').toLowerCase().includes(loc.toLowerCase())
        );

      // Check availability filter
      const matchesAvailability = !hasAvailabilityFilter ||
        selectedAvailability.some(label => {
          const validStatuses = STATUS_MAPPING[label];
          return validStatuses ? validStatuses.includes(property.status) : false;
        });

      // Check price range filter
      const matchesPrice = !hasPriceFilter || selectedPriceRanges.some(range => matchesPriceRange(property.priceValue, range));

      // Check search query - searches title, location, price, beds, baths
      // Check search query - advanced parsing for beds/baths/price + general text
      const queryLower = searchQuery.toLowerCase().trim();
      let matchesSearch = !hasSearchQuery;

      if (hasSearchQuery) {
        // Parse "X beds" or "X baths"
        const bedsMatch = queryLower.match(/(\d+)\s*(?:bed|beds|bedroom|bedrooms)/);
        const bathsMatch = queryLower.match(/(\d+)\s*(?:bath|baths|bathroom|bathrooms)/);

        let remainingQuery = queryLower;

        // Check specific bed count if specified
        if (bedsMatch) {
          const minBeds = parseInt(bedsMatch[1]);
          if (property.beds < minBeds) return false;
          remainingQuery = remainingQuery.replace(bedsMatch[0], '').trim();
        }

        // Check specific bath count if specified
        if (bathsMatch) {
          const minBaths = parseInt(bathsMatch[1]);
          if (property.baths < minBaths) return false;
          remainingQuery = remainingQuery.replace(bathsMatch[0], '').trim();
        }

        // Check remaining text against general fields if there's anything left
        if (remainingQuery.length > 0) {
          const terms = remainingQuery.split(/\s+/);
          const searchableText = `
            ${property.title}
            ${property.location}
            ${property.price}
            ${property.tags ? property.tags.join(' ') : ''}
            ${property.type}
            ${property.description || ''}
          `.toLowerCase();

          matchesSearch = terms.every(term => searchableText.includes(term));
        } else {
          // If only specific filters were provided (e.g. "5 beds") and they matched, we're good
          matchesSearch = true;
        }
      }

      // AND logic: must match all active filters
      return matchesLocation && matchesAvailability && matchesPrice && matchesSearch;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  const activeFilterCount = selectedAvailability.length + selectedPriceRanges.length + selectedLocations.length;

  useEffect(() => {
    applySEO('properties');
  }, []);

  return (
    <main id="main-content">
      {/* Hero Section */}
      <PageHeader title="Our Collection" />

      {/* Filter Section */}
      <section className="w-full bg-white border-b border-gray-100 shadow-sm">
        <div className="w-full px-6 md:px-12 lg:px-20 py-6">
          <div className="max-w-[1600px] mx-auto">
            {/* Desktop: flex row, Mobile: stack vertically */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              {/* Left Side: Search + Count */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Search Bar */}
                <div
                  className="group relative flex items-center gap-3 pl-4 pr-4 h-11 bg-white border border-gray-200 rounded-full hover:border-[#1A2551] transition-all shrink-0 cursor-text w-full sm:w-auto"
                  onClick={() => document.querySelector<HTMLInputElement>('input[placeholder="SEARCH"]')?.focus()}
                >
                  <Search className="w-4 h-4 text-[#1A2551]" />
                  <input
                    type="text"
                    placeholder="SEARCH"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      changePage(1, false);
                    }}
                    className="w-full sm:w-[60px] sm:focus:w-[150px] transition-all duration-300 bg-transparent border-none p-0 text-[0.75rem] tracking-[0.2em] font-semibold text-[#1A2551] placeholder:text-[#1A2551] focus:ring-0 outline-none uppercase"
                    style={{ fontFamily: "'Figtree', sans-serif" }}
                  />
                  {searchQuery && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery("");
                        changePage(1, false);
                      }}
                      className="p-0.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-[#1A2551] transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Showing X Residences - Desktop only */}
                <p
                  className="text-[#3A3A3A] whitespace-nowrap hidden lg:block"
                  style={{
                    fontFamily: "'Figtree', sans-serif",
                    fontSize: "0.875rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Showing {filteredProperties.length} {filteredProperties.length === 1 ? "Residence" : "Residences"}
                </p>
              </div>

              {/* Right Side: Filter Dropdowns */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 ml-auto">
                {/* Clear Filters - positioned to the left of dropdowns */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      trackEvent("click", "Filter", "Clear All");
                      setSelectedAvailability([]);
                      setSelectedPriceRanges([]);
                      setSelectedLocations([]);
                      changePage(1, false);
                    }}
                    className="text-[#1A2551] hover:opacity-70 transition-opacity text-xs uppercase tracking-widest font-medium whitespace-nowrap"
                    style={{ fontFamily: "'Figtree', sans-serif" }}
                  >
                    Clear ({activeFilterCount})
                  </button>
                )}

                {/* Filter Dropdowns */}
                <div className="grid grid-cols-3 sm:flex sm:flex-row gap-3">
                  {/* Location Filter */}
                  <PropertyFilterMultiSelect
                    label="Areas"
                    options={locationOptions}
                    selected={selectedLocations}
                    onChange={(selected) => {
                      setSelectedLocations(selected);
                      trackPropertyFilter("Location", selected.join(','));
                      changePage(1, false);
                    }}
                  />

                  {/* Availability Filter */}
                  <PropertyFilterMultiSelect
                    label="Availability"
                    options={["Available", "Sale Agreed", "Sold"]}
                    selected={selectedAvailability}
                    onChange={(selected) => {
                      setSelectedAvailability(selected);
                      changePage(1, false);
                    }}
                  />

                  {/* Price Range Filter */}
                  <PropertyFilterMultiSelect
                    label="Price"
                    options={["Under £750K", "£750K - £1.5M", "£1.5M - £2.5M", "Over £2.5M"]}
                    selected={selectedPriceRanges}
                    onChange={(selected) => {
                      setSelectedPriceRanges(selected);
                      changePage(1, false);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Count - shown below filters on mobile */}
            <p
              className="text-[#3A3A3A] text-center mt-4 lg:hidden"
              style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: "0.875rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Showing {filteredProperties.length} {filteredProperties.length === 1 ? "Residence" : "Residences"}
            </p>
          </div>
        </div>
      </section>


      {/* Properties Grid */}
      <section ref={propertiesGridRef} className="w-full bg-white py-12 md:py-20">
        <div className="w-full px-6 md:px-12 lg:px-20">
          <div className="max-w-[1600px] mx-auto">
            {currentProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {currentProperties.map((property, index) => (
                  <PropertyCard property={property} />
                ))}
              </div>
            ) : (

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
      <InsightsNewsletter
        title="Unlock Exclusive Access"
        description="Join our private register for off-market opportunities, market insights, and priority access to new collections."
      />

      {/* Testimonials Section */}
      <TestimonialsCarousel testimonials={testimonials} />
    </main>
  );
}