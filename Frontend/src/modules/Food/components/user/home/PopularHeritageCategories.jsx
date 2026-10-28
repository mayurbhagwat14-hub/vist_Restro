import React from "react";
import { useNavigate } from "react-router-dom";

export default function PopularHeritageCategories({ categories = [], onSelectCategory }) {
  const navigate = useNavigate();

  // Try to find matching categories from admin (e.g. Thali & Biryani or first two categories)
  const defaultHeritage = [
    {
      id: "thali",
      name: "Thali",
      subtitle: "Traditional Favourites",
      slug: "thali",
      image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "biryani",
      name: "Biryani",
      subtitle: "A Royal Treat",
      slug: "biryani",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    },
  ];

  // If admin has categories, blend them with heritage cards
  const displayCards = React.useMemo(() => {
    if (!categories || categories.length === 0) return defaultHeritage;

    // Check if admin has Thali / Biryani
    const thaliMatch = categories.find((c) => /thali/i.test(c.name));
    const biryaniMatch = categories.find((c) => /biryani/i.test(c.name));

    if (thaliMatch && biryaniMatch) {
      return [
        {
          id: thaliMatch.id || thaliMatch._id,
          name: thaliMatch.name,
          subtitle: "Traditional Favourites",
          slug: thaliMatch.slug || "thali",
          image: thaliMatch.image || defaultHeritage[0].image,
        },
        {
          id: biryaniMatch.id || biryaniMatch._id,
          name: biryaniMatch.name,
          subtitle: "A Royal Treat",
          slug: biryaniMatch.slug || "biryani",
          image: biryaniMatch.image || defaultHeritage[1].image,
        },
      ];
    }

    // Otherwise, pick the top 2 categories from admin or fallback
    if (categories.length >= 2) {
      return [
        {
          id: categories[0].id || categories[0]._id,
          name: categories[0].name,
          subtitle: "Signature Special",
          slug: categories[0].slug,
          image: categories[0].image || defaultHeritage[0].image,
        },
        {
          id: categories[1].id || categories[1]._id,
          name: categories[1].name,
          subtitle: "Most Loved",
          slug: categories[1].slug,
          image: categories[1].image || defaultHeritage[1].image,
        },
      ];
    }

    return defaultHeritage;
  }, [categories]);

  const handleCardClick = (cat) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else {
      navigate(`/food/user/category/${cat.slug}`);
    }
  };

  return (
    <div className="px-4 md:px-0 py-3">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="font-serif text-base sm:text-lg font-bold text-[#2C1810] tracking-tight">
          Popular Categories
        </h2>
      </div>

      {/* Dual Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {displayCards.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleCardClick(cat)}
            className="group relative h-40 sm:h-48 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md border border-[#EADBCE] bg-[#FAF5ED] transition-all duration-300"
          >
            {/* Background Image with Zoom on Hover */}
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />

            {/* Dark Vignette Overlay for Crisp Typography */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

            {/* Card Content (Bottom Left) */}
            <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end">
              <span className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide leading-tight drop-shadow-sm group-hover:text-[#E2B755] transition-colors">
                {cat.name}
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-white/80 line-clamp-1 mt-0.5">
                {cat.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
