import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance, { BASE_URL } from '../api/axios';
import { getTranslations } from '../utils/translations';
import { getMediaUrl } from '../utils/media';

const BrochureDisplay = () => {
  // Multi-select treatments and checkout
  const [selectedTreatments, setSelectedTreatments] = useState([]);
  // Duration selections - format: { treatmentId: { duration: price } }
  const [selectedDurations, setSelectedDurations] = useState({});

  const handleSelect = (treatment) => {
    const id = typeof treatment === 'object' ? treatment.id : treatment;
    const treatmentObj = typeof treatment === 'object' ? treatment : allTreatments.find(t => String(t.id) === String(id));

    setSelectedTreatments(prev => {
      if (prev.includes(id)) {
        // Deselect treatment and clear duration
        setSelectedDurations(prevDur => {
          const updated = { ...prevDur };
          delete updated[id];
          return updated;
        });
        return prev.filter(tid => tid !== id);
      } else {
        // Select treatment and auto-pick 1st duration if available
        if (treatmentObj && treatmentObj.prices && treatmentObj.prices.length > 0) {
          const firstPrice = treatmentObj.prices[0];
          setSelectedDurations(prevDur => ({
            ...prevDur,
            [id]: { duration: firstPrice.duration, price: firstPrice.price }
          }));
        }
        return [...prev, id];
      }
    });
  };

  const handleDurationSelect = (treatmentId, duration, price) => {
    setSelectedDurations(prev => {
      const isCurrentlySelected = prev[treatmentId]?.duration === duration;
      if (isCurrentlySelected) {
        // Deselect duration and remove treatment from selectedTreatments
        setSelectedTreatments(prevTreatments => prevTreatments.filter(tid => tid !== treatmentId));
        const updated = { ...prev };
        delete updated[treatmentId];
        return updated;
      } else {
        // Select duration and ensure treatment is in selectedTreatments
        setSelectedTreatments(prevTreatments => 
          prevTreatments.includes(treatmentId) ? prevTreatments : [...prevTreatments, treatmentId]
        );
        return {
          ...prev,
          [treatmentId]: { duration, price }
        };
      }
    });
  };

  const handleCheckout = () => {
    if (selectedTreatments.length === 0) {
      alert(selectedLanguage === 'ar' ? 'يرجى اختيار علاج واحد على الأقل' : 'Please select at least one treatment');
      return;
    }

    // Check if all selected treatments have duration selected
    const treatmentsWithoutDuration = selectedTreatments.filter(treatmentId => !selectedDurations[treatmentId]);
    if (treatmentsWithoutDuration.length > 0) {
      alert(selectedLanguage === 'ar' ? 'يرجى اختيار المدة الزمنية لجميع العلاجات المحددة' : 'Please select duration for all selected treatments');
      return;
    }

    // Every selected category must have at least one treatment selected
    const selectedCategoryIds = new Set(
      selectedTreatments.map(tid => String(allTreatments.find(t => String(t.id) === String(tid))?.category_id))
    );
    const missingCategories = selectedServices.filter(sid => !selectedCategoryIds.has(String(sid)));
    if (missingCategories.length > 0) {
      const names = missingCategories.map(sid => {
        const cat = categories.find(c => String(c.id) === String(sid));
        return cat ? (selectedLanguage === 'ar' ? cat.name_ar : cat.name_en) : sid;
      }).join(', ');
      alert(selectedLanguage === 'ar'
        ? `لم يتم اختيار علاج للفئات التالية: ${names}. يرجى اختيار علاج من كل فئة محددة.`
        : `No treatment selected for: ${names}. Please select a treatment from each selected category.`);
      return;
    }

    // Format duration data for URL
    const durationsParam = selectedTreatments.map(treatmentId => {
      const duration = selectedDurations[treatmentId];
      return `${treatmentId}:${duration.duration}:${duration.price}`;
    }).join(',');

    // Determine services to pass - either from selectedServices or current category
    let servicesToPass = selectedServices;
    if (servicesToPass.length === 0 && selectedCategory) {
      servicesToPass = [selectedCategory];
    }

    // Pass selected services, treatments, and durations to Product page next
    navigate(`/product?lang=${selectedLanguage}&services=${servicesToPass.join(",")}&treatments=${selectedTreatments.join(",")}&durations=${encodeURIComponent(durationsParam)}`);
  };
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get('category');
  const selectedLanguage = params.get('lang') || 'en';
  const selectedServices = params.get('services')?.split(',').map(id => id.trim()).filter(Boolean) || [];
  const selectedTreatmentsQS = params.get('treatments')?.split(',').map(id => id.trim()).filter(Boolean) || [];

  const translations = getTranslations(selectedLanguage);
  const [categories, setCategories] = useState([]);
  const [allTreatments, setAllTreatments] = useState([]);
  const [category, setCategory] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tabTransitioning, setTabTransitioning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mobileInput, setMobileInput] = useState('');

  // Memoized filtered treatments based on current selection
  const treatments = useMemo(() => {
    if (selectedServices.length > 0) {
      return allTreatments.filter(t => selectedServices.includes(String(t.category_id)));
    }
    if (selectedCategory) {
      return allTreatments.filter(t => String(t.category_id) === selectedCategory);
    }
    return [];
  }, [allTreatments, selectedServices, selectedCategory]);

  // Group treatments by category for better organization
  const treatmentsByCategory = useMemo(() => {
    const grouped = {};
    
    if (selectedServices.length > 0) {
      // Group treatments by their categories
      selectedServices.forEach(serviceId => {
        const category = categories.find(cat => String(cat.id) === serviceId);
        const categoryTreatments = allTreatments.filter(t => String(t.category_id) === serviceId);
        
        if (category && categoryTreatments.length > 0) {
          grouped[serviceId] = {
            category,
            treatments: categoryTreatments
          };
        }
      });
    } else if (selectedCategory) {
      // Single category view
      const category = categories.find(cat => String(cat.id) === selectedCategory);
      const categoryTreatments = allTreatments.filter(t => String(t.category_id) === selectedCategory);
      
      if (category && categoryTreatments.length > 0) {
        grouped[selectedCategory] = {
          category,
          treatments: categoryTreatments
        };
      }
    }
    
    return grouped;
  }, [allTreatments, selectedServices, selectedCategory, categories]);

  // Initial data fetch - load all data once
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, treatRes] = await Promise.all([
          axiosInstance.get('/api/categories'),
          axiosInstance.get('/api/treatments')
        ]);
        setCategories(catRes.data);
        setAllTreatments(treatRes.data);
        
        // Set current category if single category is selected
        if (selectedCategory && !selectedServices.length) {
          const currentCat = catRes.data.find(cat => String(cat.id) === selectedCategory);
          setCategory(currentCat);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Handle navigation without selected category or services
  useEffect(() => {
    if (!initialLoading && !selectedCategory && selectedServices.length === 0) {
      navigate('/', { replace: true });
    }
  }, [selectedCategory, selectedServices, navigate, initialLoading]);

  const handleBookingClick = () => {
    if (!mobileInput) {
      alert('Please enter a mobile number');
      return;
    }
    navigate('/booking', {
      state: { language: selectedLanguage, mobile: mobileInput }
    });
  };

  const goToCategory = (id) => {
    setTabTransitioning(true);
    
    // Small delay to show transition effect
    setTimeout(() => {
      navigate(`/brochure?category=${id}&lang=${selectedLanguage}`);
      setTabTransitioning(false);
    }, 150);
  };

  return (
    <div className={`min-h-screen bg-black text-white ${selectedLanguage === 'ar' ? 'rtl' : 'ltr'}`}>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {/* Top Header */}
      <div className="bg-black py-4 px-6 border-b border-zinc-800 relative">
        <h1 className="text-2xl font-bold text-center text-white">
          {translations.common?.title}
        </h1>
        <p className="text-sm text-gray-400 text-center">{translations.common?.subtitle}</p>

        {/* Back Button */}
        <div className={`absolute top-8 ${selectedLanguage === 'ar' ? 'right-8' : 'left-8'}`}>
          <button onClick={() => navigate(-1)} className="text-white hover:text-blue-400 flex gap-1">
            <svg width="24" height="24" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>{selectedLanguage === 'ar' ? 'الرجوع' : 'Back'}</span>
          </button>
        </div>

        {/* Booking Buttons */}
        <div className={`absolute top-6 ${selectedLanguage === 'ar' ? 'left-8' : 'right-8'}`}>
          <div className="flex gap-2">
            <button onClick={() => navigate('/booking', { state: { language: selectedLanguage } })} className="bg-white text-black px-6 py-3 rounded-full hover:bg-blue-700">
              {selectedLanguage === 'ar' ? 'تسجيل الآن' : 'Register Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="overflow-x-auto whitespace-nowrap px-6 py-4 bg-[#121212] border-b border-zinc-800">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => goToCategory(cat.id)}
            disabled={tabTransitioning}
            className={`inline-block px-4 py-2 text-sm font-medium rounded-full mx-1 transition-all duration-300 transform hover:scale-105 
              ${tabTransitioning ? 'opacity-60 cursor-not-allowed' : ''} 
              ${selectedServices.includes(String(cat.id)) ? 'bg-blue-600 text-white border-2 border-blue-400 shadow-lg' : (String(cat.id) === selectedCategory ? 'bg-white text-black shadow-md' : 'bg-zinc-800 text-white hover:bg-zinc-700 hover:shadow-md')}`}
          >
            {selectedLanguage === 'ar' ? cat.name_ar : cat.name_en}
          </button>
        ))}
      </div>

      {/* Treatments Section */}
      <div className="container mx-auto p-6">
        {selectedServices.length === 0 && (
          <h2 className="text-2xl font-semibold mb-4 capitalize transition-opacity duration-300">
            {selectedLanguage === 'ar' ? category?.name_ar : category?.name_en}
          </h2>
        )}
        
        {/* Loading state */}
        {initialLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className={`transition-all duration-300 ${tabTransitioning ? 'opacity-60 scale-95' : 'opacity-100 scale-100'}`}>
            {Object.keys(treatmentsByCategory).length === 0 ? (
              <div className="text-center py-20">
                <p className="text-red-500 text-lg">No treatments found.</p>
              </div>
            ) : (
              <>
                {/* Render treatments grouped by category */}
                {Object.entries(treatmentsByCategory).map(([categoryId, { category, treatments }]) => (
                  <div key={categoryId} className="mb-12">
                    {/* Category Heading - Only show if multiple services selected */}
                    {selectedServices.length > 1 && (
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2 border-b-2 border-blue-500 pb-2 inline-block">
                          {selectedLanguage === 'ar' ? category.name_ar : category.name_en}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                          {treatments.length} {selectedLanguage === 'ar' ? 'علاج متاح' : 'treatments available'}
                        </p>
                      </div>
                    )}

                    {/* Treatments Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {treatments.map((treatment) => {
                        const isSelected = selectedTreatments.includes(treatment.id) || selectedTreatmentsQS.includes(String(treatment.id));
                        const mediaSrc = getMediaUrl(treatment.media_url || treatment.image_url);
                        const isVideo = treatment.media_type === 'video' || (treatment.media_url && treatment.media_url.match(/\.(mp4|webm|mov)$/i));

                        return (
                          <div
                            key={treatment.id}
                            className={`bg-zinc-900 rounded-xl overflow-hidden shadow hover:bg-zinc-800 transition-all duration-300 cursor-pointer border relative ${isSelected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-800'}`}
                            onClick={() => handleSelect(treatment)}
                          >
                            {isVideo ? (
                              <video
                                src={mediaSrc}
                                className="w-full h-48 object-cover transition-transform duration-300"
                                controls
                                onError={(e) => {
                                  if (e.target.dataset.failed) return;
                                  e.target.dataset.failed = 'true';
                                  e.target.poster = '/default-treatment.jpg';
                                }}
                              />
                            ) : (
                              <img
                                src={mediaSrc}
                                alt={treatment.name_en}
                                className="w-full h-48 object-cover transition-transform duration-300"
                                onError={(e) => {
                                  if (e.target.dataset.failed) return;
                                  e.target.dataset.failed = 'true';
                                  e.target.src = '/default-treatment.jpg';
                                }}
                              />
                            )}
                            <div className="p-4">
                              <h3 className="text-xl font-bold mb-2 text-white">
                                {selectedLanguage === 'ar' ? treatment.name_ar : treatment.name_en}
                              </h3>
                              <p className="text-sm text-gray-300 mb-3">
                                {selectedLanguage === 'ar' ? treatment.description_ar : treatment.description_en}
                              </p>
                            
                            {/* Duration Selection */}
                            <div className="mb-3">
                              <h4 className="text-sm font-semibold text-gray-300 mb-2">
                                {selectedLanguage === 'ar' ? 'اختر المدة:' : 'Select Duration:'}
                              </h4>
                              <div className="space-y-2">
                                {treatment.prices.map((price, idx) => (
                                  <div 
                                    key={idx} 
                                    className="flex items-center justify-between border-b border-gray-700 pb-2 hover:bg-gray-800 rounded px-2 py-1 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDurationSelect(treatment.id, price.duration, price.price);
                                    }}
                                  >
                                    <div className="flex items-center gap-2 flex-1">
                                      <input
                                        type="checkbox"
                                        checked={selectedDurations[treatment.id]?.duration === price.duration}
                                        onChange={() => handleDurationSelect(treatment.id, price.duration, price.price)}
                                        className="w-4 h-4 accent-blue-500 cursor-pointer"
                                        onClick={e => e.stopPropagation()}
                                      />
                                      <span className="text-sm text-white">{price.duration}</span>
                                    </div>
                                    <span className="text-sm text-[#ababab] font-medium">
                                      {price.price} {selectedLanguage === 'ar' ? 'ريال' : 'QR'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Selected duration indicator */}
                            {selectedDurations[treatment.id] && (
                              <div className="bg-blue-900/30 border border-blue-500/50 rounded p-2 mt-2">
                                <span className="text-xs text-blue-300">
                                  {selectedLanguage === 'ar' ? 'المدة المحددة: ' : 'Selected: '}
                                  {selectedDurations[treatment.id].duration} - {selectedDurations[treatment.id].price} {selectedLanguage === 'ar' ? 'ريال' : 'QR'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleCheckout}
                    className="bg-white text-black px-8 py-3 rounded-full shadow hover:bg-gray-100 text-lg font-semibold flex items-center gap-2 border border-gray-300 transition-all duration-300 hover:scale-105"
                  >
                    {selectedLanguage === 'ar' ? 'الدفع' : 'Checkout'}
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal for Existing User */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#18181b] rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-md text-white font-semibold mb-4">
              {selectedLanguage === 'ar' ? 'أدخل رقم الجوال' : 'Enter Mobile Number'}
            </h2>
            <input
              type="tel"
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white mb-4"
              placeholder={selectedLanguage === 'ar' ? 'رقم الجوال' : 'Mobile Number'}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-zinc-700 text-white rounded">
                {selectedLanguage === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={handleBookingClick} className="px-4 py-2 bg-white text-black rounded hover:bg-blue-700">
                {selectedLanguage === 'ar' ? 'إرسال' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrochureDisplay;
