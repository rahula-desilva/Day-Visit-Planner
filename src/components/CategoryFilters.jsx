/**
 * COMPONENT: CategoryFilters
 * Horizontal list of category buttons to filter the places gallery.
 */
export default function CategoryFilters({ categories, activeCategory, setActiveCategory }) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={`px-5 py-2 rounded-full font-semibold transition-all border active:scale-95 active:shadow-inner ${activeCategory === cat
            ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
            : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-500"
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
