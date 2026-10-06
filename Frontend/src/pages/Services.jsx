import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios'; // ✅ use shared axios instance
import { getTranslations } from '../utils/translations';
import { getMediaUrl } from '../utils/media';
import { Form, Input, Button } from 'antd';
import AddCategoryForm from '../components/AddCategoryForm';

const Services = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract language and mobile from query string
  const queryParams = new URLSearchParams(location.search);
  const selectedLanguage = queryParams.get('lang') || 'en';
  const initialMobile = queryParams.get('mobile') || '';

  const translations = getTranslations(selectedLanguage);

  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false); // For mobile entry modal
  const [showAddCategory, setShowAddCategory] = useState(false); // For add category modal
  // Handler for successful category add
  const handleCategoryAdded = () => {
    setShowAddCategory(false);
    setLoading(true);
    axios.get('/api/categories').then(res => setCategories(res.data)).finally(() => setLoading(false));
  };
  const [mobileInput, setMobileInput] = useState(initialMobile);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);

  // Fetch service categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories');
        setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Submit mobile number for existing user
  const handleBookingSubmit = () => {
    if (!mobileInput.trim()) {
      alert('Please enter a mobile number');
      return;
    }
    navigate(`/booking?lang=${selectedLanguage}&mobile=${mobileInput}`);
  };

  // Toggle service selection
  const handleServiceSelect = (categoryId) => {
    setSelectedServices(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Go to treatments page with selected services
  const handleShowTreatments = () => {
    if (selectedServices.length === 0) {
      alert("Please select at least one service");
      return;
    }
    navigate(`/brochure?services=${selectedServices.join(",")}&lang=${selectedLanguage}`);
  };

  return (
    <div
      className={`min-h-screen bg-black text-white ${selectedLanguage === 'ar' ? 'rtl' : 'ltr'}`}
      dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
    > 
      {/* Header */}
      <div className="py-4 px-6 border-b border-zinc-800 relative">
        <h1 className="text-2xl font-bold text-center mb-2">
          {translations.common?.title || 'Balance Spa'}
        </h1>
        <p className="text-sm text-gray-400 text-center">
          {translations.common?.subtitle || 'Keet it balance'}
        </p>

        {/* Back Button */}
        <div className={`absolute top-8 ${selectedLanguage === 'ar' ? 'right-8' : 'left-8'}`}>
          <button onClick={() => navigate(-1)} className="text-white hover:text-blue-400 flex gap-1 items-center">
            <svg
              width="24"
              height="24"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className={selectedLanguage === 'ar' ? 'rotate-180' : ''}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>{selectedLanguage === 'ar' ? 'الرجوع' : 'Back'}</span>
          </button>
        </div>

        {/* Auth Buttons */}
        <div className={`absolute top-6 ${selectedLanguage === 'ar' ? 'left-8' : 'right-8'}`}>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/booking?lang=${selectedLanguage}`)}
              className="bg-white text-black px-6 py-3 rounded-full shadow hover:bg-blue-700 hover:text-white transition-colors"
            >
              {selectedLanguage === 'ar' ? 'تسجيل الآن' : 'Register Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <div className="px-6 pt-3 pb-2 flex flex-col h-screen overflow-hidden">
        {loading ? (
          <p className="text-center text-gray-400">Loading services...</p>
        ) : (
          <div>
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-5 overflow-y-auto max-h-[calc(100vh-180px)] px-2 hide-scrollbar"
              dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
            >
              {categories
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((category) => (
                  <div
                    key={category.id}
                    className={`bg-zinc-900 rounded-xl p-3 transition hover:bg-zinc-800 relative ${
                      selectedLanguage === 'ar' ? 'text-right' : 'text-left'
                    } ${selectedServices.includes(category.id) ? 'ring-2 ring-blue-500' : ''}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleServiceSelect(category.id)}
                  >
                    <div className="aspect-video rounded-lg overflow-hidden mb-3 relative group">
                      {category.media_type === 'video' || (category.media_url && category.media_url.match(/\.(mp4|webm|mov)$/i)) ? (
                        <>
                          <video
                            src={category.media_url ? axios.defaults.baseURL + category.media_url : (category.image_url ? axios.defaults.baseURL + category.image_url : '')}
                            className="w-full h-full object-cover"
                            controls
                            onError={e => { e.target.onerror = null; e.target.poster = '/default-treatment.jpg'; }}
                          />
                          {/* Play icon overlay */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-black bg-opacity-40 rounded-full p-3">
                              <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="24" fill="white" fillOpacity="0.7"/>
                                <polygon points="20,16 34,24 20,32" fill="#111" />
                              </svg>
                            </div>
                          </div>
                        </>
                      ) : (
                        <img
                          src={category.media_url ? axios.defaults.baseURL + category.media_url : (category.image_url ? axios.defaults.baseURL + category.image_url : '')}
                          alt={category.name_en}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.onerror = null; e.target.src = '/default-treatment.jpg'; }}
                        />
                      )}
                    </div>
                    <h3
                      className={`text-lg font-semibold transition-colors ${
                        selectedLanguage === 'ar'
                          ? 'text-right text-xl font-bold leading-snug tracking-wide'
                          : 'text-left'
                      }`}
                      style={{
                        fontFamily: selectedLanguage === 'ar' ? "'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif" : undefined
                      }}
                    >
                      {selectedLanguage === 'ar' ? category.name_ar : category.name_en}
                    </h3>
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(category.id)}
                      onChange={() => handleServiceSelect(category.id)}
                      className={`absolute top-4 ${selectedLanguage === 'ar' ? 'left-4' : 'right-4'} w-5 h-5 accent-blue-500 cursor-pointer z-10`}
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                ))}
            </div>
            <div className="flex justify-center mt-3">
              <button
                onClick={handleShowTreatments}
                className="bg-white text-black px-8 py-2 rounded-full shadow hover:bg-gray-100 text-lg font-semibold flex items-center gap-2 border border-gray-300"
              >
                {selectedLanguage === 'ar' ? 'عرض العلاجات' : 'Show Treatments'}
                <svg
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  className={selectedLanguage === 'ar' ? 'rotate-180' : ''}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#18181b] rounded-lg p-6 w-full max-w-sm text-white shadow-xl">
            <h2 className="text-md font-semibold mb-4">
              {selectedLanguage === 'ar' ? 'أدخل رقم الجوال' : 'Enter Mobile Number'}
            </h2>
            <input
              type="tel"
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg mb-4"
              placeholder={selectedLanguage === 'ar' ? 'رقم الجوال' : 'Mobile Number'}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-3 py-1 bg-zinc-700 rounded">
                {selectedLanguage === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={handleBookingSubmit} className="px-3 py-1 bg-white text-black rounded hover:bg-blue-700">
                {selectedLanguage === 'ar' ? 'إرسال' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Services;
