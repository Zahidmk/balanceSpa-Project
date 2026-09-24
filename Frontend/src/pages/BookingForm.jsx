import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTranslations } from '../utils/translations';
import BodySelection from '@components/BodySelection';
import SignaturePad from 'react-signature-pad-wrapper';
import axiosInstance from '../api/axios'; // Correct import path for axiosInstance

import { useRef } from 'react';
import { generateAppointmentPDF } from '@utils/pdfGenerator';
import axios from '../api/axios';

// ...existing code...
function SuccessModal({ onClose, language }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#1f2937',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        minWidth: '320px',
        color: '#fff'
      }}>
        <h2 style={{ marginBottom: '10px' }}>{language === 'ar' ? 'تم الحجز بنجاح!' : 'Booking Successful!'}</h2>
        <p>{language === 'ar' ? 'تم إرسال الاستشارة بنجاح.' : 'Your consultation has been submitted successfully.'}</p>
      </div>
    </div>
  );
}

const BookingForm = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedServiceQS = params.get('service') || params.get('services');
    // Removed duplicate declarations of query param variables
    const selectedTreatmentQS = params.get('treatment') || params.get('treatments');
    const selectedFoodsQS = params.get('food');
    const selectedProductsQS = params.get('products');
    const selectedDurationsQS = params.get('durations');
    const selectedLanguageQS = params.get('lang');
    const selectedLanguage = selectedLanguageQS || location.state?.language || 'en';
    const translations = getTranslations(selectedLanguage).booking;
    const selectedFoodsArr = selectedFoodsQS ? selectedFoodsQS.split(',').map(f => f.trim()).filter(Boolean) : [];
    const selectedProductsArr = selectedProductsQS ? selectedProductsQS.split(',').map(p => p.trim()).filter(Boolean) : [];
    
    // Parse durations data - format: treatmentId:duration:price,treatmentId:duration:price
    const selectedDurationsData = selectedDurationsQS ? 
      selectedDurationsQS.split(',').reduce((acc, item) => {
        const [treatmentId, duration, price] = item.split(':');
        if (treatmentId && duration && price) {
          acc[treatmentId] = { duration: decodeURIComponent(duration), price: decodeURIComponent(price) };
        }
        return acc;
      }, {}) : {};
  // Support multi-select for services and treatments
  const selectedServicesArr = selectedServiceQS ? selectedServiceQS.split(',').map(s => s.trim()).filter(Boolean) : [];
  const selectedTreatmentsArr = selectedTreatmentQS ? selectedTreatmentQS.split(',').map(t => t.trim()).filter(Boolean) : [];
  const [foodsList, setFoodsList] = useState([]);
  const [productsList, setProductsList] = useState([]);

  // Fetch all foods for name mapping
  useEffect(() => {
    axios.get('/api/food-beverages')
      .then(res => setFoodsList(Array.isArray(res.data) ? res.data : []))
      .catch(() => setFoodsList([]));
  }, []);

  // Fetch all products for name mapping
  useEffect(() => {
    axios.get('/api/products')
      .then(res => setProductsList(Array.isArray(res.data) ? res.data : []))
      .catch(() => setProductsList([]));
  }, []);
  // Removed duplicate declarations of query param variables

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const [formData, setFormData] = useState({
    date: getTodayDateString(),
    name: '',
    time: '',
    nationality: '',
    mobile: '',
    knowFrom: [],   
    socialMedia: [],
    healthConditions: [],
    implants: '',
    implantDetails: '',
    pressure: '',
    skinType: '',
    otherConcerns: '',
    promotional: false,
    signature: '',
    selectedBodyParts: [],
    selectedServices: selectedServicesArr,
    selectedTreatments: selectedTreatmentsArr,
    selectedFoods: selectedFoodsArr,
    selectedProducts: selectedProductsArr,
    selectedDurations: selectedDurationsData,
    selectedDuration: '',
    selectedPrice: ''
});

  // Pre-fill foods on mount (if needed for future dynamic updates)
  useEffect(() => {
    if (selectedFoodsArr.length > 0) {
      setFormData(prev => ({ ...prev, selectedFoods: selectedFoodsArr }));
    }
  }, []);

  // Pre-fill products on mount (if needed for future dynamic updates)
  useEffect(() => {
    if (selectedProductsArr.length > 0) {
      setFormData(prev => ({ ...prev, selectedProducts: selectedProductsArr }));
    }
  }, []);


  const calculateTreatmentsTotal = () => {
    if (!formData.selectedTreatments || formData.selectedTreatments.length === 0) return 0;
    return formData.selectedTreatments.reduce((sum, treatId) => {
      const durationInfo = formData.selectedDurations?.[treatId];
      if (durationInfo && durationInfo.price) {
        const numericPrice = parseFloat(String(durationInfo.price).replace(/[^0-9.]/g, '')) || 0;
        return sum + numericPrice;
      }
      return sum;
    }, 0);
  };

  const parseDurationToMinutes = (durationStr) => {
    if (!durationStr) return 0;
    const str = String(durationStr).trim().toLowerCase();
    
    if (str.includes('hr') || str.includes('hour')) {
      const match = str.match(/([0-9.]+)/);
      if (match) {
        return Math.round(parseFloat(match[1]) * 60);
      }
    }
    
    const match = str.match(/([0-9.]+)/);
    if (match) {
      return parseFloat(match[1]);
    }
    
    return 0;
  };

  const calculateTreatmentsTotalDuration = () => {
    if (!formData.selectedTreatments || formData.selectedTreatments.length === 0) return { totalMinutes: 0, formatted: '' };
    
    const totalMinutes = formData.selectedTreatments.reduce((sum, treatId) => {
      const durationInfo = formData.selectedDurations?.[treatId];
      if (durationInfo && durationInfo.duration) {
        return sum + parseDurationToMinutes(durationInfo.duration);
      }
      return sum;
    }, 0);

    if (totalMinutes <= 0) return { totalMinutes: 0, formatted: '' };

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    let formatted = '';
    if (hours > 0 && mins > 0) {
      formatted = selectedLanguage === 'ar' 
        ? `${hours} ${hours > 10 ? 'ساعة' : hours === 1 ? 'ساعة' : 'ساعات'} و ${mins} دقيقة` 
        : `${hours} hr${hours > 1 ? 's' : ''} ${mins} mins`;
    } else if (hours > 0) {
      formatted = selectedLanguage === 'ar' 
        ? `${hours} ${hours === 1 ? 'ساعة' : hours > 10 ? 'ساعة' : 'ساعات'}` 
        : `${hours} hr${hours > 1 ? 's' : ''}`;
    } else {
      formatted = selectedLanguage === 'ar' 
        ? `${mins} دقيقة` 
        : `${mins} mins`;
    }

    return { totalMinutes, formatted };
  };

  const [categories, setCategories] = useState([]);
  const [treatments, setTreatments] = useState([]);
const [isModalOpen, setIsModalOpen] = useState(false);
const [showServiceDropdown, setShowServiceDropdown] = useState(false);
const [showTreatmentDropdown, setShowTreatmentDropdown] = useState(false);
const [showFoodDropdown, setShowFoodDropdown] = useState(false);
const [showProductDropdown, setShowProductDropdown] = useState(false);





  // Fetch categories (services) and auto-select if query param exists
  useEffect(() => {
    axios.get('/api/categories')
      .then(res => {
        setCategories(res.data);
      })
      .catch(err => console.error('Failed to fetch services:', err));
  }, []);

  // Refs to ensure URL query params sync ONLY ONCE on initial load and never override user deletions
  const initialServicesSyncedRef = useRef(false);
  const initialTreatmentsSyncedRef = useRef(false);
  const initialServicesDerivedRef = useRef(false);

  // Set selectedService in formData ONCE after categories are loaded
  useEffect(() => {
    if (!initialServicesSyncedRef.current && categories.length > 0 && selectedServicesArr.length > 0) {
      initialServicesSyncedRef.current = true;
      setFormData(prev => ({
        ...prev,
        selectedServices: prev.selectedServices.length > 0 ? prev.selectedServices : selectedServicesArr
      }));
    }
  }, [categories, selectedServicesArr]);

  // Guard to prevent repeated fetching when selectedServices changes due to setFormData
  const lastFetchedServicesRef = useRef([]);
  useEffect(() => {
    const servicesKey = JSON.stringify(formData.selectedServices);
    if (formData.selectedServices && formData.selectedServices.length > 0 && servicesKey !== JSON.stringify(lastFetchedServicesRef.current)) {
      lastFetchedServicesRef.current = [...formData.selectedServices];
      Promise.all(formData.selectedServices.map(serviceId =>
        axios.get(`/api/treatments?category_id=${serviceId}`)
      )).then(responses => {
        let allTreatments = [];
        responses.forEach(res => {
          let treatmentsArr = Array.isArray(res.data) ? res.data : [];
          if (Array.isArray(res.data) && res.data.length > 0 && res.data[0].treatments) {
            treatmentsArr = res.data[0].treatments;
          }
          allTreatments = allTreatments.concat(treatmentsArr);
        });
        setTreatments(allTreatments);
      }).catch(err => {
        setTreatments([]);
        console.error('Failed to fetch treatments:', err);
      });
    } else if (!formData.selectedServices || formData.selectedServices.length === 0) {
      setTreatments([]);
    }
  }, [formData.selectedServices]);

  // Set selectedTreatment in formData ONCE after initial treatments are loaded
  useEffect(() => {
    if (!initialTreatmentsSyncedRef.current && treatments.length > 0 && selectedTreatmentsArr.length > 0) {
      initialTreatmentsSyncedRef.current = true;
      const validTreatments = selectedTreatmentsArr.filter(tid => treatments.some(t => String(t.id) === String(tid)));
      if (validTreatments.length > 0) {
        setFormData(prev => ({
          ...prev,
          selectedTreatments: [...new Set([...prev.selectedTreatments, ...validTreatments])]
        }));
      }
    }
  }, [treatments, selectedTreatmentsArr]);

  // Auto-derive services from treatments ONCE when treatments exist but no explicit services
  useEffect(() => {
    if (!initialServicesDerivedRef.current && selectedTreatmentsArr.length > 0 && categories.length > 0) {
      initialServicesDerivedRef.current = true;
      if (!selectedServicesArr || selectedServicesArr.length === 0) {
        axios.get('/api/treatments')
          .then(res => {
            const allTreatments = Array.isArray(res.data) ? res.data : [];
            const serviceIds = [...new Set(
              selectedTreatmentsArr.map(treatmentId => {
                const treatment = allTreatments.find(t => String(t.id) === String(treatmentId));
                return treatment ? String(treatment.category_id) : null;
              }).filter(Boolean)
            )];
            
            if (serviceIds.length > 0) {
              setFormData(prev => ({
                ...prev,
                selectedServices: serviceIds
              }));
            }
          })
          .catch(err => console.error('Failed to fetch treatments for service derivation:', err));
      }
    }
  }, [selectedTreatmentsArr, selectedServicesArr, categories]);

  

  const navigate = useNavigate();
  const handleBodyPartSelection = (newSelectedParts) => {
    setFormData(prev => ({
      ...prev,
      selectedBodyParts: newSelectedParts
    }));
  };

  const toggleCheckbox = (key, value) => {
    setFormData(prev => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(value)
          ? list.filter(v => v !== value)
          : [...list, value]
      };
    });
  };

  

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle duration selection for treatments
  const handleDurationSelect = (treatmentId, duration, price) => {
    setFormData(prev => ({
      ...prev,
      selectedDurations: {
        ...prev.selectedDurations,
        [treatmentId]: { duration, price }
      }
    }));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowServiceDropdown(false);
        setShowTreatmentDropdown(false);
        setShowFoodDropdown(false);
        setShowProductDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


const sigPadRef = useRef();
const dateInputRef = useRef();

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation
  if (!formData.selectedServices || formData.selectedServices.length === 0) {
    alert(selectedLanguage === 'ar' ? 'يرجى اختيار خدمة واحدة على الأقل' : 'Please select at least one service');
    return;
  }

  if (!formData.selectedTreatments || formData.selectedTreatments.length === 0) {
    alert(selectedLanguage === 'ar' ? 'يرجى اختيار علاج واحد على الأقل' : 'Please select at least one treatment');
    return;
  }

  if (!formData.name.trim()) {
    alert(selectedLanguage === 'ar' ? 'يرجى إدخال الاسم' : 'Please enter your name');
    return;
  }

  if (!formData.mobile.trim()) {
    alert(selectedLanguage === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter your mobile number');
    return;
  }

  let signatureDataUrl = '';
  if (sigPadRef.current) {
    signatureDataUrl = sigPadRef.current.toDataURL();
  }

  const pdfData = {
    ...formData,
    signature: signatureDataUrl,
    language: selectedLanguage,
    categories,
    treatments,
    foodsList,
    productsList,
  };

  const pdfBlob = await generateAppointmentPDF(pdfData);

  const form = new FormData();
  Object.entries(pdfData).forEach(([key, value]) => {
    form.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
  });
  form.append('pdf', pdfBlob, 'consultation.pdf');

  try {
    const response = await axiosInstance.post('/api/bookings/create', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setIsModalOpen(true);
  } catch (err) {
    alert(selectedLanguage === 'ar' ? 'فشل في إرسال الحجز' : 'Failed to submit booking');
    console.error(err);
  }
};

// Only clear the pad on clear button
const handleClearSignature = () => {
  if (sigPadRef.current) {
    sigPadRef.current.clear();
  }
};

  const checkboxClass = (isActive) =>
    `flex items-center gap-2 px-4 py-2 rounded-full border transition text-sm font-medium cursor-pointer ${
      isActive
        ? 'bg-green-600 text-white border-green-600'
        : 'bg-zinc-800 text-white border-zinc-600 hover:bg-zinc-700'
    }`;

  const radioClass = (isActive) =>
    `px-4 py-2 rounded-full border transition text-sm font-medium cursor-pointer ${
      isActive
        ? 'bg-green-600 text-white border-green-600'
        : 'bg-zinc-800 text-white border-zinc-600 hover:bg-zinc-700'
    }`;

  // Options data that changes based on language
  const durationOptions = [
    { label: '60 min', duration: 60, price: 220 },
    { label: '90 min', duration: 90, price: 250 },
    { label: '2 hrs', duration: 120, price: 300 },
  ];
  
  const formOptions = {
    knowFrom: selectedLanguage === 'ar' ? 
      ['صديق', 'فيسبوك', 'سناب شات', 'إنستغرام', 'خرائط جوجل'] : 
      ['Friend', 'Facebook', 'Snapchat', 'Instagram', 'Google Map'],
    
    healthConditions: selectedLanguage === 'ar' ? 
      [
        'سرطان', 'سكري', 'ضغط دم مرتفع/منخفض', 'أمراض قلب/كلى',
        'هربس', 'حمى', 'قدم رياضي', 'أمراض جلدية',
        'أي عملية جراحية (حديثة أو سابقة)', 'حساسية من منتجات'
      ] : 
      [
        'Cancer', 'Diabetes', 'High / Low Blood pressure', 'Heart / Kidney disease',
        'Herpes', 'Fever', 'Athletes Foot', 'Skin diseases',
        'Any operation (recent or past)', 'Product Allergies'
      ],
    
    pressureOptions: selectedLanguage === 'ar' ? 
      ['خفيف/ناعم', 'متوسط', 'قوي/عميق'] : 
      ['Soft/Light', 'Medium', 'Strong / Deep'],
    
    skinTypeOptions: selectedLanguage === 'ar' ? 
      ['عادي', 'حساس', 'جاف', 'دهني', 'مختلط'] : 
      ['Normal', 'Sensitive', 'Dry', 'Oil', 'Combination'],
    
    yesNoOptions: selectedLanguage === 'ar' ? ['نعم', 'لا'] : ['yes', 'no']
  };

  return (
  <div className={`min-h-screen bg-black ${selectedLanguage === 'ar' ? 'rtl' : 'ltr'}`} dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-black py-4 px-6 border-b border-zinc-800 re">
        <h1 className="text-2xl font-bold text-center mb-2 text-white">
          {getTranslations(selectedLanguage).common.title}
        </h1>
        <p className="text-sm text-gray-400 text-center">
          {getTranslations(selectedLanguage).common.subtitle}
        </p>
              {/* Back Button */}
      <div className={`absolute top-8 ${selectedLanguage === 'ar' ? 'right-8' : 'left-8'}`}>
        <button
          onClick={() => navigate(-1)}
          className="text-white hover:text-blue-400 transition flex gap-1"
          aria-label="Go back"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>{selectedLanguage === 'ar' ? 'الرجوع' : 'Back'}</span>
        </button>
        </div>
      </div>

      <div className="px-6 py-10 text-white">
        <div className="max-w-7xl mx-auto">
          {/* Help message for direct visitors */}
          {(!formData.selectedServices || formData.selectedServices.length === 0) && 
           (!formData.selectedTreatments || formData.selectedTreatments.length === 0) && (
            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-6 text-center">
              <div className="text-blue-300 mb-2">
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p className="text-white text-sm">
                {selectedLanguage === 'ar' 
                  ? 'يرجى اختيار الخدمات والعلاجات أولاً من القوائم أدناه لإنشاء حجزك.'
                  : 'Please select services and treatments from the dropdowns below to create your booking.'}
              </p>
            </div>
          )}
          
          <div className="bg-zinc-900 p-6 rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className={`grid md:grid-cols-2 gap-8 ${selectedLanguage === 'ar' ? 'rtl' : 'ltr'}`} dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
              {/* Left Column */}
              <div className="space-y-6">
                <div className="bg-zinc-900 p-6 border border-zinc-700 rounded-lg shadow-lg">
                  <div className="space-y-4">
                  <div>
                      <label className="block font-semibold mb-2">{translations.labels.mobile}</label>
                      <input
                        type="text"
                        name="mobile"
                        onChange={handleChange}
                        className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">{translations.labels.customerName}</label>
                      <input
                        type="text"
                        name="name"
                        onChange={handleChange}
                        className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white"
                      />
                    </div>
                  {/* Services Selection Section */}
                  <div className="mb-4">
                    <h2 className="font-bold text-white text-lg mb-2 tracking-wide">{selectedLanguage === 'ar' ? 'الخدمات' : 'Services'}</h2>
                    
                    {/* Show selected services or dropdown */}
                    {formData.selectedServices && formData.selectedServices.length > 0 ? (
                      <div>
                        <div className="text-sm text-gray-300 mb-2">{selectedLanguage === 'ar' ? 'الخدمات المختارة:' : 'Selected Services:'}</div>
                        {formData.selectedServices.map((serviceId, idx) => {
                          const selectedCat = categories.find(cat => String(cat.id) === String(serviceId));
                          return (
                            <div key={serviceId + idx} className="mb-2 p-2 bg-zinc-800 rounded-lg border border-zinc-700 flex justify-between items-center">
                              <span className="text-white font-medium">
                                {selectedCat ? (selectedLanguage === 'ar' ? selectedCat.name_ar : selectedCat.name_en) : serviceId}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData(prev => {
                                    const updatedServices = (prev.selectedServices || []).filter(id => String(id) !== String(serviceId));
                                    const updatedTreatments = (prev.selectedTreatments || []).filter(treatId => {
                                      const t = treatments.find(item => String(item.id) === String(treatId));
                                      return !t || String(t.category_id) !== String(serviceId);
                                    });
                                    const updatedDurations = { ...prev.selectedDurations };
                                    (prev.selectedTreatments || []).forEach(treatId => {
                                      const t = treatments.find(item => String(item.id) === String(treatId));
                                      if (t && String(t.category_id) === String(serviceId)) {
                                        delete updatedDurations[treatId];
                                        delete updatedDurations[String(treatId)];
                                      }
                                    });
                                    return {
                                      ...prev,
                                      selectedServices: updatedServices,
                                      selectedTreatments: updatedTreatments,
                                      selectedDurations: updatedDurations
                                    };
                                  });
                                }}
                                className="text-red-400 hover:text-red-300 text-base font-bold px-2 py-1 cursor-pointer transition-colors"
                                title={selectedLanguage === 'ar' ? 'إزالة' : 'Remove'}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                          className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                        >
                          + {selectedLanguage === 'ar' ? 'إضافة خدمة أخرى' : 'Add Another Service'}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-400 mb-2">{selectedLanguage === 'ar' ? 'اختر الخدمات:' : 'Select Services:'}</div>
                        <button
                          type="button"
                          onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                          className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white text-left hover:bg-zinc-700 transition"
                        >
                          {selectedLanguage === 'ar' ? 'اختر الخدمات...' : 'Choose Services...'}
                        </button>
                      </div>
                    )}

                    {/* Service Dropdown */}
                    {showServiceDropdown && (
                      <div className="dropdown-container mt-2 bg-zinc-800 border border-zinc-600 rounded-lg max-h-40 overflow-y-auto">
                        {categories.map(category => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              const serviceId = String(category.id);
                              if (!formData.selectedServices.includes(serviceId)) {
                                setFormData(prev => ({
                                  ...prev,
                                  selectedServices: [...prev.selectedServices, serviceId]
                                }));
                              }
                              setShowServiceDropdown(false);
                            }}
                            className="w-full text-left p-3 hover:bg-zinc-700 transition text-white border-b border-zinc-700 last:border-b-0"
                          >
                            {selectedLanguage === 'ar' ? category.name_ar : category.name_en}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Treatments Selection Section */}
                  <div className="mb-2">
                    <h2 className="font-bold text-white text-lg mb-2 tracking-wide">{selectedLanguage === 'ar' ? 'العلاجات' : 'Treatments'}</h2>
                    
                    {/* Show selected treatments or dropdown */}
                    {formData.selectedTreatments && formData.selectedTreatments.length > 0 ? (
                      <div>
                        <div className="text-sm text-gray-300 mb-2">{selectedLanguage === 'ar' ? 'العلاجات المختارة:' : 'Selected Treatments:'}</div>
                        {formData.selectedTreatments.map((treatId, idx) => {
                          const selectedTreat = treatments.find(treat => String(treat.id) === String(treatId));
                          const durationInfo = formData.selectedDurations[treatId];
                          return (
                            <div key={treatId + idx} className="mb-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white text-base">
                                    {selectedTreat ? (selectedLanguage === 'ar' ? selectedTreat.name_ar : selectedTreat.name_en) : treatId}
                                  </h4>
                                  {durationInfo ? (
                                    <div className="mt-2 text-sm">
                                      <div className="flex justify-between items-center bg-blue-900/30 border border-blue-500/50 rounded p-2">
                                        <span className="text-blue-300">
                                          {selectedLanguage === 'ar' ? 'المدة: ' : 'Duration: '}
                                          <span className="font-medium">{durationInfo.duration}</span>
                                        </span>
                                        <span className="text-blue-300 font-semibold">
                                          {durationInfo.price} {selectedLanguage === 'ar' ? 'ريال' : 'QR'}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="mt-2">
                                      <div className="text-xs text-gray-400 mb-2">{selectedLanguage === 'ar' ? 'اختر المدة:' : 'Select Duration:'}</div>
                                      <div className="flex flex-wrap gap-2">
                                        {[
                                          { duration: '60 min', price: '220' },
                                          { duration: '90 min', price: '250' },
                                          { duration: '2 hrs', price: '300' }
                                        ].map((option) => (
                                          <button
                                            key={option.duration}
                                            type="button"
                                            onClick={() => handleDurationSelect(treatId, option.duration, option.price)}
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition"
                                          >
                                            {option.duration} - {option.price} {selectedLanguage === 'ar' ? 'ريال' : 'QR'}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFormData(prev => {
                                      const updatedTreatments = (prev.selectedTreatments || []).filter(id => String(id) !== String(treatId));
                                      const updatedDurations = { ...prev.selectedDurations };
                                      delete updatedDurations[treatId];
                                      delete updatedDurations[String(treatId)];

                                      // Auto-remove parent service if no selected treatments remain for it
                                      const targetTreatment = treatments.find(t => String(t.id) === String(treatId));
                                      let updatedServices = prev.selectedServices || [];

                                      if (targetTreatment && targetTreatment.category_id) {
                                        const catIdStr = String(targetTreatment.category_id);
                                        const hasRemainingTreatmentsForService = updatedTreatments.some(id => {
                                          const t = treatments.find(item => String(item.id) === String(id));
                                          return t && String(t.category_id) === catIdStr;
                                        });

                                        if (!hasRemainingTreatmentsForService) {
                                          updatedServices = updatedServices.filter(sId => String(sId) !== catIdStr);
                                        }
                                      }

                                      return {
                                        ...prev,
                                        selectedTreatments: updatedTreatments,
                                        selectedDurations: updatedDurations,
                                        selectedServices: updatedServices
                                      };
                                    });
                                  }}
                                  className="text-red-400 hover:text-red-300 text-base font-bold px-2 py-1 cursor-pointer transition-colors ml-2"
                                  title={selectedLanguage === 'ar' ? 'إزالة' : 'Remove'}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Total Duration & Amount Summary */}
                        <div className="mt-3 p-3 bg-zinc-800/90 border border-blue-500/60 rounded-lg space-y-2 shadow">
                          {calculateTreatmentsTotalDuration().formatted && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300 font-medium text-sm">
                                {selectedLanguage === 'ar' ? 'إجمالي المدة:' : 'Total Duration:'}
                              </span>
                              <span className="text-blue-300 font-semibold text-sm">
                                {calculateTreatmentsTotalDuration().formatted}
                              </span>
                            </div>
                          )}
                          <div className={`flex justify-between items-center ${calculateTreatmentsTotalDuration().formatted ? 'pt-2 border-t border-zinc-700/60' : ''}`}>
                            <span className="text-white font-semibold text-sm">
                              {selectedLanguage === 'ar' ? 'المبلغ الإجمالي:' : 'Total Amount:'}
                            </span>
                            <span className="text-blue-400 font-bold text-base">
                              {calculateTreatmentsTotal()} {selectedLanguage === 'ar' ? 'ريال' : 'QR'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowTreatmentDropdown(!showTreatmentDropdown)}
                          className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                        >
                          + {selectedLanguage === 'ar' ? 'إضافة علاج آخر' : 'Add Another Treatment'}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-400 mb-2">{selectedLanguage === 'ar' ? 'اختر العلاجات:' : 'Select Treatments:'}</div>
                        {formData.selectedServices && formData.selectedServices.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setShowTreatmentDropdown(!showTreatmentDropdown)}
                            className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white text-left hover:bg-zinc-700 transition"
                          >
                            {selectedLanguage === 'ar' ? 'اختر العلاجات...' : 'Choose Treatments...'}
                          </button>
                        ) : (
                          <div className="text-sm text-gray-500 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                            {selectedLanguage === 'ar' ? 'يرجى اختيار خدمة أولاً' : 'Please select a service first'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Treatment Dropdown */}
                    {showTreatmentDropdown && treatments.length > 0 && (
                      <div className="dropdown-container mt-2 bg-zinc-800 border border-zinc-600 rounded-lg max-h-60 overflow-y-auto">
                        {treatments.map(treatment => (
                          <div key={treatment.id} className="border-b border-zinc-700 last:border-b-0">
                            <button
                              type="button"
                              onClick={() => {
                                const treatmentId = String(treatment.id);
                                if (!formData.selectedTreatments.includes(treatmentId)) {
                                  setFormData(prev => ({
                                    ...prev,
                                    selectedTreatments: [...prev.selectedTreatments, treatmentId]
                                  }));
                                }
                                setShowTreatmentDropdown(false);
                              }}
                              className="w-full text-left p-3 hover:bg-zinc-700 transition text-white"
                            >
                              <div className="font-medium">
                                {selectedLanguage === 'ar' ? treatment.name_ar : treatment.name_en}
                              </div>
                              <div className="text-sm text-gray-400 mt-1">
                                {selectedLanguage === 'ar' ? treatment.description_ar : treatment.description_en}
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Foods & Beverages Selection Section */}
                  <div className="mb-4">
                    <h2 className="font-bold text-white text-lg mb-2 tracking-wide">{selectedLanguage === 'ar' ? 'الأطعمة والمشروبات' : 'Foods & Beverages'}</h2>
                    
                    {/* Show selected foods or dropdown */}
                    {formData.selectedFoods && formData.selectedFoods.length > 0 ? (
                      <div>
                        <div className="text-sm text-gray-300 mb-2">{selectedLanguage === 'ar' ? 'الأطعمة والمشروبات المختارة:' : 'Selected Foods & Beverages:'}</div>
                        {formData.selectedFoods.map((foodId, idx) => {
                          const selectedFood = foodsList.find(food => String(food.id) === String(foodId));
                          return (
                            <div key={foodId + idx} className="mb-2 p-2 bg-zinc-800 rounded-lg border border-zinc-700 flex justify-between items-center">
                              <span className="text-white font-medium">
                                {selectedFood ? (selectedLanguage === 'ar' ? selectedFood.name_ar : selectedFood.name) : foodId}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData(prev => ({
                                    ...prev,
                                    selectedFoods: (prev.selectedFoods || []).filter(id => String(id) !== String(foodId))
                                  }));
                                }}
                                className="text-red-400 hover:text-red-300 text-base font-bold px-2 py-1 cursor-pointer transition-colors"
                                title={selectedLanguage === 'ar' ? 'إزالة' : 'Remove'}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => setShowFoodDropdown(!showFoodDropdown)}
                          className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                        >
                          + {selectedLanguage === 'ar' ? 'إضافة طعام أو مشروب آخر' : 'Add More Food/Beverage'}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-400 mb-2">{selectedLanguage === 'ar' ? 'اختر الأطعمة والمشروبات (اختياري):' : 'Select Foods & Beverages (Optional):'}</div>
                        <button
                          type="button"
                          onClick={() => setShowFoodDropdown(!showFoodDropdown)}
                          className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white text-left hover:bg-zinc-700 transition"
                        >
                          {selectedLanguage === 'ar' ? 'اختر الأطعمة والمشروبات...' : 'Choose Foods & Beverages...'}
                        </button>
                      </div>
                    )}

                    {/* Food Dropdown */}
                    {showFoodDropdown && foodsList.length > 0 && (
                      <div className="dropdown-container mt-2 bg-zinc-800 border border-zinc-600 rounded-lg max-h-40 overflow-y-auto">
                        {foodsList.map(food => (
                          <button
                            key={food.id}
                            type="button"
                            onClick={() => {
                              const foodId = String(food.id);
                              if (!formData.selectedFoods.includes(foodId)) {
                                setFormData(prev => ({
                                  ...prev,
                                  selectedFoods: [...prev.selectedFoods, foodId]
                                }));
                              }
                              setShowFoodDropdown(false);
                            }}
                            className="w-full text-left p-3 hover:bg-zinc-700 transition text-white border-b border-zinc-700 last:border-b-0"
                          >
                            <div className="font-medium">
                              {selectedLanguage === 'ar' ? food.name_ar : food.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {food.price} {selectedLanguage === 'ar' ? 'ريال' : 'QR'}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Products Selection Section */}
                  <div className="mb-4">
                    <h2 className="font-bold text-white text-lg mb-2 tracking-wide">{selectedLanguage === 'ar' ? 'المنتجات' : 'Products'}</h2>

                    {/* Show selected products or dropdown */}
                    {formData.selectedProducts && formData.selectedProducts.length > 0 ? (
                      <div>
                        <div className="text-sm text-gray-300 mb-2">{selectedLanguage === 'ar' ? 'المنتجات المختارة:' : 'Selected Products:'}</div>
                        {formData.selectedProducts.map((productId, idx) => {
                          const selectedProduct = productsList.find(product => String(product.id) === String(productId));
                          return (
                            <div key={productId + idx} className="mb-2 p-2 bg-zinc-800 rounded-lg border border-zinc-700 flex justify-between items-center">
                              <span className="text-white font-medium">
                                {selectedProduct ? (selectedLanguage === 'ar' ? selectedProduct.name_ar : selectedProduct.name_en) : productId}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData(prev => ({
                                    ...prev,
                                    selectedProducts: (prev.selectedProducts || []).filter(id => String(id) !== String(productId))
                                  }));
                                }}
                                className="text-red-400 hover:text-red-300 text-base font-bold px-2 py-1 cursor-pointer transition-colors"
                                title={selectedLanguage === 'ar' ? 'إزالة' : 'Remove'}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => setShowProductDropdown(!showProductDropdown)}
                          className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                        >
                          + {selectedLanguage === 'ar' ? 'إضافة منتج آخر' : 'Add Another Product'}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-400 mb-2">{selectedLanguage === 'ar' ? 'اختر المنتجات (اختياري):' : 'Select Products (Optional):'}</div>
                        <button
                          type="button"
                          onClick={() => setShowProductDropdown(!showProductDropdown)}
                          className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white text-left hover:bg-zinc-700 transition"
                        >
                          {selectedLanguage === 'ar' ? 'اختر المنتجات...' : 'Choose Products...'}
                        </button>
                      </div>
                    )}

                    {/* Product Dropdown */}
                    {showProductDropdown && productsList.length > 0 && (
                      <div className="dropdown-container mt-2 bg-zinc-800 border border-zinc-600 rounded-lg max-h-40 overflow-y-auto">
                        {productsList.map(product => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              const productId = String(product.id);
                              if (!formData.selectedProducts.includes(productId)) {
                                setFormData(prev => ({
                                  ...prev,
                                  selectedProducts: [...prev.selectedProducts, productId]
                                }));
                              }
                              setShowProductDropdown(false);
                            }}
                            className="w-full text-left p-3 hover:bg-zinc-700 transition text-white border-b border-zinc-700 last:border-b-0"
                          >
                            <div className="font-medium">
                              {selectedLanguage === 'ar' ? product.name_ar : product.name_en}
                            </div>
                            {product.price != null && (
                              <div className="text-sm text-gray-400">
                                {product.price} {selectedLanguage === 'ar' ? 'ريال' : 'QR'}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                    <div>
                      <label className="block font-semibold mb-2">{translations.labels.date}</label>
                      <div className="w-full bg-zinc-800/80 border border-zinc-700 p-3 rounded-lg text-white font-medium select-none cursor-not-allowed">
                        {formData.date}
                      </div>
                    </div>

                    {/* <div>
                    <label className="block font-semibold mb-2">Start Time</label>
                    <input
                      type="time"
                      name="time"
                      className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white"
                      onChange={handleChange}
                    />
                  </div> */}

                  

                   
                    <div>
                      <label className="block font-semibold mb-2">{translations.labels.nationality}</label>
                      <input
                        type="text"
                        name="nationality"
                        onChange={handleChange}
                        className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white"
                      />
                    </div>
                   
                  </div>
                </div>

                <div className="bg-zinc-900 p-6 border border-zinc-700 rounded-lg shadow-lg">
                  <p className="font-semibold mb-4">{translations.labels.knowFrom}</p>
                  <div className="flex flex-wrap gap-3">
                    {formOptions.knowFrom.map(option => {
                      const isChecked = formData.knowFrom.includes(option);
                      return (
                        <label key={option} className={checkboxClass(isChecked)}>
                          <input
                            type="checkbox"
                            onChange={() => toggleCheckbox('knowFrom', option)}
                            checked={isChecked}
                            className="hidden"
                          />
                          {isChecked && <span className="text-xs"><svg width="14" height="14" fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <path d="M22 4 12 14.01l-3-3"></path>
                          </svg></span>}
                          {option}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-zinc-900 p-6 border border-zinc-700 rounded-lg shadow-lg">
                  <p className="font-semibold mb-4">{translations.labels.healthConditions}</p>
                  <div className="flex flex-wrap gap-3">
                    {formOptions.healthConditions.map(option => {
                      const isChecked = formData.healthConditions.includes(option);
                      return (
                        <label key={option} className={checkboxClass(isChecked)}>
                          <input
                            type="checkbox"
                            onChange={() => toggleCheckbox('healthConditions', option)}
                            checked={isChecked}
                            className="hidden"
                          />
                          {isChecked && <span className="text-lg"><svg width="14" height="14" fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <path d="M22 4 12 14.01l-3-3"></path>
                          </svg></span>}
                          {option}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700">
                  <p className="font-semibold mb-4">{translations.labels.implants}</p>
                  <div className="flex gap-3">
                    {formOptions.yesNoOptions.map(option => (
                      <label key={option} className={radioClass(formData.implants === option)}>
                        <input
                          type="radio"
                          name="implants"
                          value={option}
                          onChange={handleChange}
                          checked={formData.implants === option}
                          className="hidden"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                  {formData.implants === formOptions.yesNoOptions[0] && (
                    <input
                      type="text"
                      name="implantDetails"
                      placeholder={selectedLanguage === 'ar' ? "يرجى تقديم التفاصيل" : "Please provide detail"}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 mt-4 p-2 rounded text-white"
                    />
                  )}
                </div>

                <div className="bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700">
                  <h1 className="font-bold mb-3">
                    {selectedLanguage === 'ar' ? 'للمساج فقط' : 'For Massage Only'}
                  </h1>
                  <p className="font-semibold mb-4">
                    {selectedLanguage === 'ar' ? 
                      'ما نوع ضغط المساج الذي تفضله؟' : 
                      'What type of massage pressure would you like?'}
                  </p>
                  <div className="flex gap-3">
                    {formOptions.pressureOptions.map(option => (
                      <label key={option} className={radioClass(formData.pressure === option)}>
                        <input
                          type="radio"
                          name="pressure"
                          value={option}
                          onChange={handleChange}
                          checked={formData.pressure === option}
                          className="hidden"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700 mb-4">
                  <h2 className="font-bold mb-3">
                    {selectedLanguage === 'ar' ? 'حدد مناطق العلاج:' : 'Select Areas for Treatment:'}
                  </h2>
                  <div className="min-h-[400px]">
                    <BodySelection
                      selectedParts={formData.selectedBodyParts}
                      setSelectedParts={handleBodyPartSelection}
                      language={selectedLanguage}
                    />
                  </div>
                </div>

                <div className="bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700 mb-4">
                  <h2 className="font-bold mb-3">
                    {selectedLanguage === 'ar' ? 'لعلاج الوجه فقط:' : 'For Facial Treatment Only:'}
                  </h2>
                  <p className="font-semibold mb-4">
                    {selectedLanguage === 'ar' ? 
                      'ما هو نوع بشرتك؟' : 
                      'What is your skin type?'}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {formOptions.skinTypeOptions.map(option => (
                      <label key={option} className={radioClass(formData.skinType === option)}>
                        <input
                          type="radio"
                          name="skinType"
                          value={option}
                          onChange={handleChange}
                          checked={formData.skinType === option}
                          className="hidden"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700 mb-4">
                  <p className="font-semibold mb-4">{translations.labels.otherConcerns}</p>
                  <textarea
                    name="otherConcerns"
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 mt-1 p-2 rounded text-white"
                    onChange={handleChange}
                  />
                </div>

                <div className="text-lg border border-zinc-700 p-3 mb-4 rounded bg-zinc-800">
                  <strong className="text-red-500">
                    {selectedLanguage === 'ar' ? 'ملاحظة:' : 'NOTE:'}
                  </strong> 
                  {selectedLanguage === 'ar' ? 
                    ' السلوك الجنسي محظور بموجب القانون ولن يتم التسامح معه من قبل الإدارة والسلطات.' : 
                    ' Sexual behavior is prohibited by law and will not be tolerated by the management and the Authority.'}
                </div>

                <div className="text-sm border border-zinc-700 p-3 rounded bg-zinc-800 mb-4">
                  {selectedLanguage === 'ar' ? 
                    'لقد قرأت الموقع أدناه وفهمت المحتويات والشروط المذكورة أعلاه. أوافق على أن المنتجع الصحي غير مسؤول عن أي حالة ناتجة عن العلاج.' : 
                    'The undersigned has read and understood the above contents and terms. The undersigned represent that the information provided is true and accurate and understands the importance of alerting the staff to any medical conditions or concern. The spa reserves the right to refuse treatment. I agree that either the spa, not its employee or management shall be liable or responsible for aggravation of any existing conditions as a result of my treatment. I am voluntarily undertaking this treatment.'}
                </div>

                <label className="block mb-4">
                  <input
                    type="checkbox"
                    name="promotional"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {translations.labels.promotional}
                </label>

                
{isModalOpen && (
  <SuccessModal
    onClose={() => {
      setIsModalOpen(false);
      navigate('/');
    }}
    language={selectedLanguage}
  />
)}



                <div className="mt-4">
                  <label className="block font-semibold mb-2">{translations.labels.signature}</label>
                  <div className="border border-zinc-700 rounded bg-white">
                  <SignaturePad
                      ref={sigPadRef}
                      options={{
                        minWidth: 1,
                        maxWidth: 2.5,
                        penColor: "black",
                        backgroundColor: "white"
                      }}
                      canvasProps={{
                        width: 500,
                        height: 200,
                        className: "signatureCanvas w-full"
                      }}
                    />

                  </div>
                  <div className="flex justify-between mt-2">
                    <button
                      type="button"
                      onClick={handleClearSignature}
                      className="bg-zinc-700 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      {selectedLanguage === 'ar' ? 'مسح' : 'Clear'}
                    </button>
                  </div>
               </div>

               
                <button
                  type="submit"
                  className="mt-6 w-full bg-white text-black py-2 rounded-md font-medium transition hover:bg-gray-200"
                >
                  {selectedLanguage === 'ar' ? 'إرسال الاستشارة' : 'Submit Consultation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingForm;