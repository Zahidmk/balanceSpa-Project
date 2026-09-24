import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { getMediaUrl } from "../utils/media";

// Default virtual tour fallback if no 3D tours are provided
const DEFAULT_TOUR = {
  id: "main-tour",
  name: "Virtual 360 Tour",
  name_ar: "جولة افتراضية ٣٦٠",
  url: "https://my.matterport.com/show/?m=N7vsiehnUVx",
};

const Facility = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const lang = params.get("lang") || "en";
  const services = params.get("services");
  const treatments = params.get("treatments");
  const durations = params.get("durations");
  const products = params.get("products");
  const facilitiesParam = params.get("facilities");

  const [facilities, setFacilities] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState(
    facilitiesParam ? facilitiesParam.split(",").filter(Boolean) : []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const res = await axios.get("/api/facilities");
        setFacilities(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load facilities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  const toggleFacility = (id) => {
    const idStr = String(id);
    setSelectedFacilities((prev) =>
      prev.includes(idStr) ? prev.filter((item) => item !== idStr) : [...prev, idStr]
    );
  };

  const goToFood = () => {
    const query = new URLSearchParams({ lang });
    if (services) query.set("services", services);
    if (treatments) query.set("treatments", treatments);
    if (durations) query.set("durations", durations);
    if (products) query.set("products", products);
    if (selectedFacilities.length > 0) query.set("facilities", selectedFacilities.join(","));
    navigate(`/food-beverages?${query.toString()}`);
  };

  // Filter facilities that have showcase videos or 3D tour URLs
  const videoFacilities = facilities.filter(
    (f) => (f.video_url && f.video_url.trim()) || (f.tour_url && f.tour_url.trim())
  );

  return (
    <div
      className={`min-h-screen bg-black text-white flex flex-col ${
        lang === "ar" ? "rtl" : "ltr"
      }`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Top Header Navbar */}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>{lang === "ar" ? "الرجوع" : "Back"}</span>
          </button>
        </div>

        {/* Title Center */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold">
            {lang === "ar" ? "المرفق والتجهيزات" : "Our Facilities"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            {lang === "ar"
              ? "استكشف مرافق وتجهيزات سبا بالانس"
              : "Explore Balance Spa rooms & amenities"}
          </p>
        </div>

        {/* Top Continue Button */}
        <div>
          <button
            onClick={goToFood}
            className="bg-white text-black px-6 py-2.5 rounded-full shadow hover:bg-gray-100 text-sm font-bold flex items-center gap-2 border border-gray-300 transition-transform active:scale-95 whitespace-nowrap"
          >
            <span>{lang === "ar" ? "التالي" : "Continue"}</span>
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              className={lang === "ar" ? "rotate-180" : ""}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center p-6 max-w-6xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {/* Section 1: Facility Room Cards (2 Columns) */}
            {facilities.length > 0 && (
              <div className="w-full mb-8">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-zinc-800 pb-3 flex items-center gap-2">
                  <span>{lang === "ar" ? "غرف ومرافق السبا" : "Spa Rooms & Suites"}</span>
                </h2>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                  {facilities.map((item) => {
                    const isSelected = selectedFacilities.includes(String(item.id));
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleFacility(item.id)}
                        className={`bg-zinc-900 border rounded-2xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col cursor-pointer ${
                          isSelected
                            ? "border-emerald-500 ring-2 ring-emerald-500/50"
                            : "border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        {/* Image / Media */}
                        {item.image_url ? (
                          <div className="w-full h-56 overflow-hidden bg-zinc-800 relative">
                            <img
                              src={getMediaUrl(item.image_url)}
                              alt={lang === "ar" ? item.name_ar || item.name : item.name}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                            {isSelected && (
                              <div className="absolute top-3 right-3 bg-emerald-600 text-white rounded-full p-1.5 shadow-lg">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-44 bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm relative">
                            {lang === "ar" ? "سبا بالانس" : "Balance Spa Facility"}
                            {isSelected && (
                              <div className="absolute top-3 right-3 bg-emerald-600 text-white rounded-full p-1.5 shadow-lg">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Details */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <h3 className="text-xl font-bold text-white">
                                {lang === "ar" ? item.name_ar || item.name : item.name}
                              </h3>
                              {item.price !== null && item.price !== undefined && Number(item.price) > 0 && (
                                <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-sm font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                                  {Number(item.price).toFixed(2)}{" "}
                                  {lang === "ar" ? "ريال" : "SAR"}
                                </span>
                              )}
                            </div>

                            <p className="text-gray-300 text-sm leading-relaxed mt-2">
                              {lang === "ar"
                                ? item.description_ar || item.description
                                : item.description}
                            </p>
                          </div>

                          {/* Select Button */}
                          <div className="mt-5 pt-4 border-t border-zinc-800/80">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFacility(item.id);
                              }}
                              className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                                isSelected
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/30"
                                  : "bg-white hover:bg-zinc-200 text-black font-semibold"
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>{lang === "ar" ? "تم الاختيار" : "Selected"}</span>
                                </>
                              ) : (
                                <span>{lang === "ar" ? "اختيار المرفق" : "Select Facility"}</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Continue button directly below the cards */}
                <div className="flex justify-center mt-10 mb-4">
                  <button
                    onClick={goToFood}
                    className="bg-white text-black px-10 py-3 rounded-full shadow hover:bg-gray-100 text-base font-bold flex items-center gap-3 border border-gray-300 transition-transform active:scale-95"
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Section 2: Room Video Tours & Virtual Showcase (2 Columns Layout) */}
            <div className="w-full">
              <div className="border-t border-zinc-800 pt-8 mb-8 text-center">
                <h2 className="text-2xl font-bold text-white">
                  {lang === "ar" ? "جولة في مرافقنا" : "Facility Video Tours"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {lang === "ar"
                    ? "شاهد جولات تفصيلية من داخل غرف ومرافق السبا"
                    : "Take a closer look inside our luxury spa suites and facilities"}
                </p>
              </div>

              {videoFacilities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  {videoFacilities.map((item) => (
                    <div
                      key={`tour-${item.id}`}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                    >
                      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">
                          {lang === "ar" ? item.name_ar || item.name : item.name}
                        </h3>
                        <span className="text-xs text-blue-400 bg-blue-950/60 border border-blue-800 px-2.5 py-0.5 rounded-full">
                          {item.video_url
                            ? lang === "ar"
                              ? "فيديو جولة"
                              : "Room Tour"
                            : lang === "ar"
                            ? "جولة ٣٦٠"
                            : "3D Virtual Tour"}
                        </span>
                      </div>

                      <div className="w-full aspect-video bg-black relative">
                        {item.video_url ? (
                          <video
                            src={getMediaUrl(item.video_url)}
                            controls
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : item.tour_url ? (
                          <iframe
                            src={item.tour_url}
                            title={item.name}
                            className="w-full h-full border-0"
                            allowFullScreen
                            allow="xr-spatial-tracking"
                          />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Default fallback virtual tour if no room videos are added yet */
                <div className="w-full flex flex-col items-center">
                  <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
                    <iframe
                      src={DEFAULT_TOUR.url}
                      title="Virtual Tour"
                      className="w-full h-full border-0"
                      allowFullScreen
                      allow="xr-spatial-tracking"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Facility;
