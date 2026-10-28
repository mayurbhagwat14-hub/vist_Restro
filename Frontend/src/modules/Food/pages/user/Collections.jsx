import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Share2, UtensilsCrossed, Bookmark, Heart, Store, X } from "lucide-react"
import { Button } from "@food/components/ui/button"
import { Input } from "@food/components/ui/input"
import useAppBackNavigation from "@food/hooks/useAppBackNavigation"

// Heritage luxury card theme presets
const heritageCardStyles = [
  {
    bg: "bg-gradient-to-br from-[#3D2114] via-[#2A140A] to-[#150904]",
    accent: "#C5A059",
    badge: "SIGNATURE",
    border: "border-[#C5A059]/40",
    glow: "rgba(197, 160, 89, 0.2)",
  },
  {
    bg: "bg-gradient-to-br from-[#4A2612] via-[#351909] to-[#1D0C03]",
    accent: "#D4AF37",
    badge: "FAVORITES",
    border: "border-[#C5A059]/30",
    glow: "rgba(212, 175, 55, 0.2)",
  },
  {
    bg: "bg-gradient-to-br from-[#5A2C18] via-[#421D0E] to-[#240C04]",
    accent: "#E6C687",
    badge: "CURATED",
    border: "border-[#C5A059]/30",
    glow: "rgba(230, 198, 135, 0.2)",
  },
  {
    bg: "bg-gradient-to-br from-[#2D4A20] via-[#1F3514] to-[#101D0A]",
    accent: "#76C454",
    badge: "PURE VEG",
    border: "border-[#3B7A27]/40",
    glow: "rgba(59, 122, 39, 0.2)",
  },
  {
    bg: "bg-gradient-to-br from-[#683A1E] via-[#4D2812] to-[#261206]",
    accent: "#E4B875",
    badge: "SPECIALS",
    border: "border-[#C5A059]/30",
    glow: "rgba(197, 160, 89, 0.2)",
  },
]

export default function Collections() {
  const navigate = useNavigate()
  const goBack = useAppBackNavigation()
  const [activeTab, setActiveTab] = useState("delivery")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")

  // Delivery collections
  const [deliveryCollections, setDeliveryCollections] = useState([
    { id: "bookmarks", name: "Bookmarks", dishes: 0, restaurants: 0, isDefault: true }
  ])

  // Dining collections
  const [diningCollections, setDiningCollections] = useState([
    { id: "bookmarks", name: "Bookmarks", dishes: 0, restaurants: 0, isDefault: true }
  ])

  const currentCollections = activeTab === "delivery" ? deliveryCollections : diningCollections
  const setCurrentCollections = activeTab === "delivery" ? setDeliveryCollections : setDiningCollections

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      const newCollection = {
        id: `collection-${Date.now()}`,
        name: newCollectionName.trim(),
        dishes: 0,
        restaurants: 0,
        isDefault: false
      }
      setCurrentCollections(prev => [...prev, newCollection])
      setNewCollectionName("")
      setIsCreateDialogOpen(false)
    }
  }

  const getCardStyle = (index) => {
    return heritageCardStyles[index % heritageCardStyles.length]
  }

  return (
    <div className="min-h-screen bg-[#FAF5ED] dark:bg-[#120E0C] text-[#2C1810] dark:text-neutral-100 transition-colors duration-300 pb-24">
      {/* Heritage Brand Header Banner */}
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#2C1810] via-[#3B2012] to-[#1F0F08] border-b border-[#C5A059]/40 pt-10 pb-8 px-4 sm:px-8">
        {/* Subtle Ambient Radial Gold Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C5A059]/20 via-transparent to-transparent pointer-events-none" />

        {/* Back Button */}
        <button
          onClick={goBack}
          className="absolute top-4 left-4 z-20 w-9 h-9 bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md rounded-full flex items-center justify-center transition-all border border-white/15 cursor-pointer shadow-sm"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4 text-[#FAF5ED]" />
        </button>

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10 pt-2">
          {/* Brand Crest Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF5ED]/10 border border-[#C5A059]/40 backdrop-blur-md mb-3">
            <img
              src="/visit-crest-gold.jpg"
              alt="Visit 1996"
              className="w-4 h-4 rounded-full object-cover border border-[#C5A059]/60"
            />
            <span className="text-[11px] font-bold tracking-widest text-[#E6C687] uppercase">
              VISIT RESTAURANT • EST. 1996
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#FAF5ED] tracking-tight mb-2">
            Your Curated Collections
          </h1>
          <p className="text-xs sm:text-sm text-[#FAF5ED]/80 max-w-md font-medium leading-relaxed">
            Personal bookmark vault for signature dishes, culinary favorites, and preferred dining spots.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 bg-[#FAF5ED]/95 dark:bg-[#120E0C]/95 backdrop-blur-md z-10 border-b border-[#EADBCE] dark:border-white/10 transition-colors">
        <div className="max-w-md mx-auto flex px-4">
          <button
            onClick={() => setActiveTab("delivery")}
            className={`flex-1 py-3.5 text-center text-xs sm:text-sm font-bold tracking-wide transition-all relative cursor-pointer ${
              activeTab === "delivery"
                ? "text-[#5C381E] dark:text-[#E6C687]"
                : "text-[#7C6E65] dark:text-gray-400 hover:text-[#5C381E]"
            }`}
          >
            Delivery
            {activeTab === "delivery" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.75 bg-[#5C381E] dark:bg-[#E6C687] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("dining")}
            className={`flex-1 py-3.5 text-center text-xs sm:text-sm font-bold tracking-wide transition-all relative cursor-pointer ${
              activeTab === "dining"
                ? "text-[#5C381E] dark:text-[#E6C687]"
                : "text-[#7C6E65] dark:text-gray-400 hover:text-[#5C381E]"
            }`}
          >
            Dining
            {activeTab === "dining" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.75 bg-[#5C381E] dark:bg-[#E6C687] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 lg:gap-6">
            {/* Collection Cards */}
            {currentCollections.map((collection, index) => {
              const cardStyle = getCardStyle(index)
              return (
                <Link
                  key={collection.id}
                  to={collection.isDefault ? "/food/user/profile/favorites" : `/food/user/collections/${collection.id}`}
                  className="block group"
                >
                  <div className={`${cardStyle.bg} ${cardStyle.border} border rounded-2xl p-4 h-52 relative overflow-hidden shadow-md group-hover:shadow-xl group-hover:scale-[1.02] transition-all duration-300`}>
                    {/* Ambient Glow */}
                    <div 
                      className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-40"
                      style={{ background: cardStyle.accent }}
                    />

                    {/* Share Button */}
                    <button
                      className="absolute top-3 right-3 text-white/75 hover:text-white transition-colors z-10 p-1.5 rounded-full hover:bg-white/10"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (navigator.share) {
                          navigator.share({
                            title: collection.name,
                            text: `Check out my curated food collection on VIST Restaurant!`,
                            url: window.location.href,
                          }).catch(() => {})
                        }
                      }}
                      aria-label="Share collection"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>

                    {/* Center Luxury Emblem */}
                    <div className="absolute inset-0 flex items-center justify-center pb-8 pointer-events-none">
                      <div className="relative flex items-center justify-center">
                        {/* Outer Glow Ring */}
                        <div className="w-20 h-20 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full border border-[#C5A059]/40 bg-[#FAF5ED]/10 flex items-center justify-center shadow-inner">
                            {collection.isDefault ? (
                              <Bookmark className="h-6 w-6 text-[#E6C687]" />
                            ) : (
                              <UtensilsCrossed className="h-6 w-6 text-[#E6C687]" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Collection Info */}
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
                      <span className="text-[9px] font-bold tracking-widest uppercase text-[#E6C687] block mb-0.5">
                        {cardStyle.badge}
                      </span>
                      <h3 className="text-white font-serif font-bold text-base sm:text-lg mb-0.5 truncate group-hover:text-[#E6C687] transition-colors">
                        {collection.name}
                      </h3>
                      <p className="text-[#FAF5ED]/75 text-xs font-medium">
                        {collection.dishes} {collection.dishes === 1 ? 'dish' : 'dishes'} • {collection.restaurants} {collection.restaurants === 1 ? 'place' : 'places'}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}

            {/* Create New Collection Card */}
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-[#FFFDF9] dark:bg-[#1A1410] border-2 border-dashed border-[#EADBCE] dark:border-white/15 hover:border-[#C5A059] hover:bg-[#FAF6F0] dark:hover:bg-[#201812] rounded-2xl p-4 h-52 flex flex-col items-center justify-center gap-3 transition-all duration-300 group cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-[#EDE4D8] dark:bg-[#5C381E]/30 border border-[#C5A059]/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-[#5C381E] dark:text-[#E6C687]" />
              </div>
              <div className="text-center">
                <p className="font-serif font-bold text-sm text-[#2C1810] dark:text-[#FAF5ED] group-hover:text-[#5C381E] dark:group-hover:text-[#E6C687] transition-colors">
                  Create a new
                </p>
                <p className="font-serif font-bold text-sm text-[#5C381E] dark:text-[#E6C687]">
                  Collection
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Create Collection Modal */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => {
              setIsCreateDialogOpen(false)
              setNewCollectionName("")
            }}
          />

          {/* Modal */}
          <div className="relative bg-[#FFFDF9] dark:bg-[#1A1410] border border-[#EADBCE] dark:border-white/15 rounded-2xl shadow-2xl w-[90%] max-w-sm mx-4 overflow-hidden animate-[slideUp_0.3s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#EADBCE] dark:border-white/10 bg-[#FAF5ED] dark:bg-[#150F0B]">
              <h2 className="font-serif text-lg font-bold text-[#2C1810] dark:text-white">Create New Collection</h2>
              <button
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  setNewCollectionName("")
                }}
                className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-[#7C6E65]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-gray-400">Give your personalized collection a unique name</p>
              <Input
                placeholder="e.g., Weekend Specials, Family Dinners"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCollectionName.trim()) {
                    handleCreateCollection()
                  }
                }}
                className="w-full h-11 text-sm border border-[#EADBCE] dark:border-white/15 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/30 rounded-xl bg-white dark:bg-[#201812] text-[#2C1810] dark:text-white placeholder:text-[#7C6E65]"
                autoFocus
              />

              {/* Preview */}
              {newCollectionName.trim() && (
                <div className="p-3 bg-[#FAF5ED] dark:bg-[#201812] border border-[#EADBCE] dark:border-white/10 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#C5A059] mb-0.5">Preview</p>
                  <p className="font-serif font-bold text-sm text-[#2C1810] dark:text-white">{newCollectionName.trim()}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-4 border-t border-[#EADBCE] dark:border-white/10 bg-[#FAF5ED]/50 dark:bg-[#150F0B]">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  setNewCollectionName("")
                }}
                className="flex-1 h-10 rounded-xl font-semibold border-[#EADBCE] dark:border-white/15 text-[#7C6E65] dark:text-gray-300 hover:bg-black/5 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim()}
                className="flex-1 h-10 bg-[#5C381E] hover:bg-[#482A14] text-[#FAF5ED] rounded-xl font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}