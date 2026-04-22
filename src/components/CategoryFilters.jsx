/**
 * COMPONENT: CategoryFilters
 * Horizontal list of category buttons to filter the places gallery.
 */
export default function CategoryFilters({ categories, activeCategory, setActiveCategory }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-8">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={`inline-flex items-center min-h-[42px] px-6 py-2.5 rounded-full font-medium leading-none whitespace-nowrap transition-all active:scale-95 border ${
            activeCategory === cat
              ? "bg-[#005ab7] text-white shadow-lg border-transparent"
              : "bg-gray-100 text-gray-600 border-transparent hover:opacity-90"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
