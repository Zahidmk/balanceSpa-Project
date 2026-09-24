import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { getMediaUrl } from "../utils/media";

// Inline placeholder (no network dependency)
const NO_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%2327272a'/%3E%3Ccircle cx='150' cy='110' r='24' fill='%233f3f46'/%3E%3Cpath d='M120 210l55-65 42 48 36-42 60 72z' fill='%233f3f46'/%3E%3C/svg%3E";

const ProductCard = ({ product, lang, isSelected, onToggle }) => (
  <div
    onClick={onToggle}
    className={`bg-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:bg-zinc-850 hover:shadow-2xl transition-all duration-300 cursor-pointer border relative flex flex-col justify-between ${
      isSelected
        ? "border-blue-500 ring-2 ring-blue-500"
        : "border-zinc-800 hover:border-zinc-700"
    }`}
  >
    <div>
      <div className="relative w-full h-52 overflow-hidden bg-zinc-800">
        <img
          src={product.image_url ? getMediaUrl(product.image_url, NO_IMAGE) : NO_IMAGE}
          alt={lang === "ar" ? product.name_ar : product.name_en}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            if (e.target.dataset.failed) return;
            e.target.dataset.failed = "true";
            e.target.src = NO_IMAGE;
          }}
        />
        {/* Subtle dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2 leading-snug">
          {lang === "ar" ? product.name_ar : product.name_en}
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed line-clamp-3 mb-4">
          {lang === "ar" ? product.description_ar : product.description_en}
        </p>
      </div>
    </div>

    {/* Bottom Price & Select action bar mirroring the brochure card design */}
    <div className="px-5 pb-5 pt-2 border-t border-zinc-800/80 flex items-center justify-between">
      <label
        className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
        />
        <span className={isSelected ? "text-blue-400 font-semibold" : "text-gray-300"}>
          {isSelected
            ? lang === "ar"
              ? "تم الاختيار"
              : "Selected"
            : lang === "ar"
            ? "اختيار"
            : "Select"}
        </span>
      </label>

      {product.price != null && (
        <span className="text-base font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-3 py-1 rounded-full whitespace-nowrap">
          {Number(product.price).toFixed(2)} {lang === "ar" ? "ريال" : "QR"}
        </span>
      )}
    </div>
  </div>
);

const Product = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const lang = params.get("lang") || "en";
  const servicesParam = params.get("services");
  const treatments = params.get("treatments");
  const durations = params.get("durations");
  const selectedServices = servicesParam
    ? servicesParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get("/api/categories"),
          axios.get("/api/products"),
        ]);
        const catData = Array.isArray(catRes.data) ? catRes.data : [];
        const prodData = Array.isArray(prodRes.data) ? prodRes.data : [];

        setCategories(catData);
        setAllProducts(prodData);

        // If the user arrived with specific services selected from previous step,
        // pre-activate the first selected service category
        if (selectedServices.length > 0) {
          const matched = catData.find((c) => String(c.id) === selectedServices[0]);
          if (matched) {
            setActiveCategory(String(matched.id));
          }
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered categories that have at least one product
  const availableCategories = useMemo(() => {
    return categories
      .filter((cat) => allProducts.some((p) => String(p.category_id) === String(cat.id)))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories, allProducts]);

  // Filtered products based on active category pill + search input
  const displayedProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchCategory =
        activeCategory === "all" || String(product.category_id) === String(activeCategory);

      const name = (lang === "ar" ? product.name_ar : product.name_en) || product.name_en || "";
      const desc =
        (lang === "ar" ? product.description_ar : product.description_en) ||
        product.description_en ||
        "";
      const matchSearch =
        !searchQuery.trim() ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [allProducts, activeCategory, searchQuery, lang]);

  const toggleProduct = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const goToFacility = () => {
    const query = new URLSearchParams({ lang });
    if (servicesParam) query.set("services", servicesParam);
    if (treatments) query.set("treatments", treatments);
    if (durations) query.set("durations", durations);
    if (selectedProducts.length > 0) query.set("products", selectedProducts.join(","));
    navigate(`/facility?${query.toString()}`);
  };

  return (
    <div
      className={`min-h-screen bg-black text-white flex flex-col ${
        lang === "ar" ? "rtl" : "ltr"
      }`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Top Header */}
      <div className="py-4 px-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 z-30 bg-black/95 backdrop-blur">
        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-blue-400 flex gap-2 items-center text-sm font-medium"
          >
            <svg
              width="22"
              height="22"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className={lang === "ar" ? "rotate-180" : ""}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>{lang === "ar" ? "الرجوع" : "Back"}</span>
          </button>
        </div>

        {/* Title Center */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold">
            {lang === "ar" ? "المنتجات الفاخرة" : "Spa Products"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            {lang === "ar"
              ? "اختر منتجات العناية المصاحبة لجلساتك"
              : "Enhance your wellness experience with our curated products"}
          </p>
        </div>

        {/* Top Continue Button */}
        <div>
          <button
            onClick={goToFacility}
            className="bg-white text-black px-6 py-2.5 rounded-full shadow hover:bg-gray-100 text-sm font-bold flex items-center gap-2 border border-gray-300 transition-transform active:scale-95 whitespace-nowrap"
          >
            <span>{lang === "ar" ? "التالي" : "Continue"}</span>
            {selectedProducts.length > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {selectedProducts.length}
              </span>
            )}
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              className={lang === "ar" ? "rotate-180" : ""}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Category Filter Pills (Exact Match to Brochure Page) */}
      <div className="overflow-x-auto whitespace-nowrap px-6 py-3.5 bg-[#121212] border-b border-zinc-800 flex items-center gap-2 hide-scrollbar">
        {/* All Products pill */}
        <button
          onClick={() => setActiveCategory("all")}
          className={`inline-block px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 transform hover:scale-105 ${
            activeCategory === "all"
              ? "bg-white text-black shadow-md font-semibold"
              : "bg-zinc-800 text-white hover:bg-zinc-700"
          }`}
        >
          {lang === "ar" ? "جميع المنتجات" : "All Products"}
        </button>

        {/* Dynamic Category Pills */}
        {availableCategories.map((cat) => {
          const isActive = activeCategory === String(cat.id);
          const isUserSelectedService = selectedServices.includes(String(cat.id));

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(String(cat.id))}
              className={`inline-block px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 transform hover:scale-105 ${
                isActive
                  ? "bg-white text-black shadow-md font-semibold"
                  : isUserSelectedService
                  ? "bg-blue-900/60 border border-blue-500 text-blue-200 hover:bg-blue-800/70"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            >
              {lang === "ar" ? cat.name_ar : cat.name_en}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Search Bar & Counter */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="text-gray-400 text-sm">
            {lang === "ar"
              ? `عرض ${displayedProducts.length} منتج`
              : `Showing ${displayedProducts.length} product${
                  displayedProducts.length === 1 ? "" : "s"
                }`}
          </div>

          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "ar" ? "ابحث عن منتج..." : "Search products..."}
              className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-full px-4 py-2.5 pl-10 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <svg
              className={`w-4 h-4 text-gray-400 absolute top-3.5 ${
                lang === "ar" ? "left-3.5" : "left-3.5"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M16.65 11a5.65 5.65 0 11-11.3 0 5.65 5.65 0 0111.3 0z"
              />
            </svg>
          </div>
        </div>

        {/* Products Grid (3 Columns) */}
        {loading ? (
          <div className="flex justify-center items-center py-28">
            <div className="animate-spin rounded-full h-11 w-11 border-b-2 border-white"></div>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 p-8 mt-4">
            <p className="text-gray-400 text-lg">
              {lang === "ar"
                ? "لا توجد منتجات مطابقة لهذا القسم."
                : "No products found for this selection."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                lang={lang}
                isSelected={selectedProducts.includes(product.id)}
                onToggle={() => toggleProduct(product.id)}
              />
            ))}
          </div>
        )}

        {/* Bottom Continue Button */}
        <div className="flex justify-center mt-14 mb-10">
          <button
            onClick={goToFacility}
            className="bg-white text-black px-10 py-3.5 rounded-full shadow hover:bg-gray-100 text-base font-bold flex items-center gap-3 border border-gray-300 transition-transform active:scale-95"
          >
            <span>{lang === "ar" ? "التالي" : "Continue"}</span>
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              className={lang === "ar" ? "rotate-180" : ""}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;
