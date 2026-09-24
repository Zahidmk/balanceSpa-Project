import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import bodyFront from '../assets/body-forward.png';
import bodyBack from '../assets/body-backward.png';
import logo from "@assets/logo.png";
const PDFPreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData;

  useEffect(() => {
    if (!formData) {
      navigate('/booking-form');
    }
  }, [formData, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/booking-form');
  };

  if (!formData) {
    return null;
  }

  // Debug: Log signature data
  console.log('Signature data:', formData.signature);

  // Placeholder signature image (SVG)
  const placeholderSignature =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><rect width="200" height="80" fill="white"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="lightgray" font-size="18">Signature</text></svg>';

  // Body parts data for visualization
  const BODY_PARTS = {
    front: [
      { id: 'head_front', x: 50, y: 12, label: 'Head' },
      { id: 'neck_front', x: 50, y: 20, label: 'Neck' },
      { id: 'left_shoulder', x: 35, y: 25, label: 'Left Shoulder' },
      { id: 'right_shoulder', x: 63, y: 25, label: 'Right Shoulder' },
      { id: 'chest', x: 50, y: 30, label: 'Chest' },
      { id: 'abdomen', x: 50, y: 45, label: 'Abdomen' },
      { id: 'left_arm_front', x: 30, y: 35, label: 'Left Arm' },
      { id: 'right_arm_front', x: 70, y: 35, label: 'Right Arm' },
      { id: 'left_wrist', x: 30, y: 50, label: 'Left Wrist' },
      { id: 'right_wrist', x: 70, y: 50, label: 'Right Wrist' },
      { id: 'left_leg_front', x: 40, y: 62, label: 'Left Thigh' },
      { id: 'right_leg_front', x: 60, y: 62, label: 'Right Thigh' },
      { id: 'left_foot', x: 40, y: 78, label: 'Left Leg' },
      { id: 'right_foot', x: 60, y: 78, label: 'Right Leg' }
    ],
    back: [
      { id: 'head_back', x: 50, y: 12, label: 'Head' },
      { id: 'neck_back', x: 50, y: 20, label: 'Neck' },
      { id: 'left_back_shoulders', x: 35, y: 25, label: 'Left Back Shoulders' },
      { id: 'right_back_shoulders', x: 63, y: 25, label: 'Right Back Shoulders' },
      { id: 'left_back_wrist', x: 30, y: 50, label: 'Left Back Wrist' },
      { id: 'right_back_wrist', x: 70, y: 50, label: 'Right Back Wrist' },
      { id: 'upper_back', x: 50, y: 30, label: 'Upper Back' },
      { id: 'lower_back', x: 50, y: 45, label: 'Lower Back' },
      { id: 'left_back_thigh', x: 40, y: 60, label: 'Left Back Thigh' },
      { id: 'Right_back_thigh', x: 60, y: 60, label: 'Right Back Thigh' },
      { id: 'left_arm_back', x: 30, y: 35, label: 'Left Back Arm' },
      { id: 'right_arm_back', x: 70, y: 35, label: 'Right Back Arm' },
      { id: 'left_leg_back', x: 40, y: 75, label: 'Left Back Leg' },
      { id: 'right_leg_back', x: 60, y: 75, label: 'Right Back Leg' }
    ]
  };

  // Get body part labels for selected parts
  const getSelectedPartLabels = () => {
    if (!formData.selectedBodyParts || formData.selectedBodyParts.length === 0) {
      return [];
    }
    
    const allParts = [...BODY_PARTS.front, ...BODY_PARTS.back];
    return formData.selectedBodyParts.map(partId => {
      const part = allParts.find(p => p.id === partId);
      return part?.label || partId;
    });
  };

  // Replace CheckIcon with a checkbox style tick box
  const CheckBoxTick = () => (
    <span style={{ display: 'inline-block', width: 13, height: 13, border: '1px solid #121212', borderRadius: 3, marginRight: 6, verticalAlign: 'middle', position: 'relative' }}>
      <svg width="12" height="12" viewBox="0 0 12 12" style={{ position: 'absolute', top: 0, left: 1 }}>
        <polyline points="2,7 5,10 10,2" style={{ fill: 'none', stroke: '#121212', strokeWidth: 1.5 }} />
      </svg>
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Print Header - Only visible on screen */}
      <div className="print:hidden bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={handleBack}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            ← Back to Form
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="bg-black text-white px-6 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print PDF
            </button>
          </div>
        </div>
      </div>

      {/* PDF Content - Optimized for single page */}
      <div
        className="max-w-7xl mx-auto bg-white shadow-lg my-6 print:shadow-none print:my-0 print:max-w-none print:w-full"
        style={{
          fontFamily: 'Arial, sans-serif',
          height: '297mm',
          width: '210mm',
          maxHeight: '297mm',
          maxWidth: '210mm',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        <div className="p-6 print:p-4 w-full">
        

          {/* Two Column Layout - Robust for print */}
          <div className="flex flex-row w-full print:w-full gap-4 print:gap-2">
            {/* Left Column - Personal Details */}
            <div className=" w-1/2 print:w-1/2" style={{ breakInside: 'avoid' }}>
            {/* logo */}
            <div className='flex justify-center flex-col items-center'>
            <img 
                src={logo} 
                alt="Balance Logo" x
                className="w-24 invert"
              />
              <h1 className=" text-sm font-semibold capitalize -mt-4">BALANCE SPA</h1>
              <h3 className='text-sm font-semibold capitalize mt-2 mb-4'>Customer Consultation</h3>
            </div>
           
              {/* Customer Details */}
              <div className=" p-3 print:p-2 rounded print:rounded-none">
                <div className="flex flex-row text-sm print:text-xs mb-1">
                  <div className="font-bold w-32 text-left pr-2">Date:</div>
                  <div className="flex-1 text-left">{formData.date || 'N/A'}</div>
                </div>
                <div className="flex flex-row text-sm print:text-xs mb-1">
                  <div className="font-bold w-32 text-left pr-2">Name:</div>
                  <div className="flex-1 text-left">{formData.name || 'N/A'}</div>
                </div>
                <div className="flex flex-row text-sm print:text-xs mb-1">
                  <div className="font-bold w-32 text-left pr-2">Phone:</div>
                  <div className="flex-1 text-left">{formData.mobile || 'N/A'}</div>
                </div>
                <div className="flex flex-row text-sm print:text-xs mb-1">
                  <div className="font-bold w-32 text-left pr-2">Nationality:</div>
                  <div className="flex-1 text-left">{formData.nationality || 'N/A'}</div>
                </div>
                <div className="flex flex-row text-sm print:text-xs mb-1">
                  <div className="font-bold w-32 text-left pr-2">Service:</div>
                  <div className="flex-1 text-left flex items-center">
                    {formData.selectedService ? (
                      <span className="text-xs font-medium flex items-center mb-1 mr-4">
                        {formData.selectedService}
                      </span>
                    ) : (
                      <span className="text-gray-500 italic text-sm">N/A</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-row text-sm print:text-xs mb-1">
                  <div className="font-bold w-32 text-left pr-2">Treatment:</div>
                  <div className="flex-1 text-left flex items-center">
                    {formData.selectedTreatment ? (
                      <span className="text-xs font-medium flex items-center mb-1 mr-4">
                        {formData.selectedTreatment}
                      </span>
                    ) : (
                      <span className="text-gray-500 italic text-sm">N/A</span>
                    )}
                  </div>
                </div>
              </div>

         

              {/* How did you know about us? */}
              <div className=" p-3 print:p-2 rounded print:rounded-none">
                <h2 className="text-[14px] print:text-base font-semibold text-gray-800 mb-2 print:mb-1 border-b pb-1">How did you know about us?</h2>
                <div className="flex gap-2 flex-wrap text-sm print:text-xs">
                  {Array.isArray(formData.knowFrom) && formData.knowFrom.length > 0 ? (
                    formData.knowFrom.map((option) => (
                      <span key={option} className="text-xs font-medium flex items-center mb-1 mr-4">
                        <CheckBoxTick />{option}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic text-sm">No selection</span>
                  )}
                </div>
              </div>

              {/* Social Media (if present) */}
              {Array.isArray(formData.socialMedia) && formData.socialMedia.length > 0 && (
                <div className=" p-3 print:p-2 rounded print:rounded-none">
                  <h2 className="text-[14px] print:text-base font-semibold text-gray-800 mb-2 print:mb-1 border-b pb-1">Social Media</h2>
                  <div className="flex flex-wrap gap-2 text-sm print:text-xs">
                    {formData.socialMedia.map((platform) => (
                      <span key={platform} className="text-xs font-medium flex items-center mb-1 mr-4">
                        <CheckBoxTick />{platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Health Information */}
              <div className=" p-3 print:p-2 rounded print:rounded-none">
                <h2 className="text-[14px] print:text-base font-semibold text-gray-800 mb-2 print:mb-1 border-b pb-1">Customer Health Condition</h2>
                <div className="flex flex-row text-sm print:text-xs mb-1">
                  <div className="flex flex-col gap-1 text-sm print:text-xs">
                    {Array.isArray(formData.healthConditions) && formData.healthConditions.length > 0 ? (
                      formData.healthConditions.map((condition) => (
                        <span key={condition} className="text-xs font-medium flex items-center mb-1 mr-4">
                          <CheckBoxTick />{condition}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 italic text-sm">No health conditions selected</span>
                    )}
                  </div>
                </div>
              </div>


              {/* do you have */}

              <div className="flex p-3 print:p-2 flex-col text-sm print:text-xs mb-1">
                  <div className=" text-left pr-2">Do you have any implants? Please provide detail:</div>
                  <div className="flex-1 text-left mt-2">{formData.implants || 'N/A'}
                    {formData.implants && formData.implants.toLowerCase() === 'yes' && (
                      <span> ({formData.implantDetails || 'No details provided'})</span>
                    )}</div>
                </div>

                <div className="flex p-3 print:p-2 flex-col text-sm print:text-xs mb-1">
                  <h4 className='text-[14px] font-bold mb-3'>For Massage Only:</h4>
                  <div className="text-[13px] font-medium text-left pr-2">What type of massage pressure would you like during your massage?</div>
                  <div className="mt-1">
                    {formData.pressure ? (
                      <span className="text-xs font-medium flex items-center mb-1 mr-4">
                        <CheckBoxTick />{formData.pressure}
                      </span>
                    ) : (
                      <span className="text-gray-500 italic text-sm">No selection</span>
                    )}
                  </div>
                </div>

              {/*  */}


           
            </div>

            {/* Right Column - Body Selection Visualization */}
            <div className="space-y-3 print:space-y-2 w-1/2 print:w-1/2" style={{ breakInside: 'avoid' }}>
              

              {/* Body Visualization - Compact */}
              <div className=" p-3 print:p-2 rounded print:rounded-none">
                <div className="grid grid-cols-2 gap-2">
                  {/* Front View */}
                  <div>
                    <div className="relative mx-auto bg-white rounded w-full max-w-[180px] print:max-w-[180px] h-auto" style={{ aspectRatio: '5/7' }}>
                      <img 
                        src={bodyFront} 
                        alt="Body Front" 
                        className="w-full h-auto object-contain invert contrast-200" 
                      />
                      {BODY_PARTS.front.map(({ id, x, y, label }) => (
                        <div
                          key={id}
                          className={`absolute w-2 h-2 rounded-full border transition-all
                            ${formData.selectedBodyParts?.includes(id) 
                              ? 'bg-green-500 border-white shadow scale-125' 
                              : 'bg-gray-400/50 border-gray-600'}`}
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          title={label}
                        >
                          {formData.selectedBodyParts?.includes(id) && (
                            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Back View */}
                  <div>
                    <div className="relative mx-auto bg-white rounded  w-full max-w-[180px] print:max-w-[180px] h-auto" style={{ aspectRatio: '5/7' }}>
                      <img 
                        src={bodyBack} 
                        alt="Body Back" 
                        className="w-full h-auto object-contain invert contrast-200" 
                      />
                      {BODY_PARTS.back.map(({ id, x, y, label }) => (
                        <div
                          key={id}
                          className={`absolute w-2 h-2 rounded-full border transition-all
                            ${formData.selectedBodyParts?.includes(id) 
                              ? 'bg-green-500 border-white shadow scale-125' 
                              : 'bg-gray-400/50 border-gray-600'}`}
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          title={label}
                        >
                          {formData.selectedBodyParts?.includes(id) && (
                            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selected Body Parts List */}
              <div className=" p-3 print:p-2 rounded print:rounded-none">
                <h2 className="text-[14px] print:text-base font-semibold text-gray-800 mb-2 print:mb-1 border-b pb-1">Selected Body Parts</h2>
                <div className="bg-white p-2 rounded">
                  {getSelectedPartLabels().length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {getSelectedPartLabels().map((label, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">No body parts selected</p>
                  )}
                </div>
              </div>

                 {/* Skin Type */}
                 <div className="p-3 print:p-2 rounded print:rounded-none">
                    <h2 className="text-[14px] print:text-base font-semibold text-gray-800 mb-2 print:mb-1 border-b pb-1">What is your Skin Type</h2>
                    <div className="text-sm print:text-xs mt-1">
                      {formData.skinType ? (
                        <span className="text-xs font-medium flex items-center mb-1 mr-4">
                          <CheckBoxTick />{formData.skinType}
                        </span>
                      ) : (
                        <span className="text-gray-500 italic text-sm">No selection</span>
                      )}
                    </div>
                  </div>

                   {/* Other Concerns */}
              <div className=" p-3 print:p-2 rounded print:rounded-none">
                <h2 className="text-[13px] font-medium text-gray-800 mb-2 print:mb-1 border-b pb-1">Do you have other concerns which may affect your treatment today? If yes please provide details.</h2>
                <div className="text-sm print:text-xs">
                  {formData.otherConcerns || 'N/A'}
                </div>
              </div>


                     {/* Notes */}
              <div className="p-3 print:p-2 rounded print:rounded-none">
                <h2 className="text-[13px] print:text-base font-semibold text-gray-800">Notes: <span> Sexual behavior is prohibited by law and will not be tolerated by the management and the Authority.</span>  </h2>         
              </div>

              {/* content-note */}

              <div className="text-sm  p-3 mb-4" style={{ color: '#18181b', }}>
                {formData.language === 'ar'
                  ? 'لقد قرأت الموقع أدناه وفهمت المحتويات والشروط المذكورة أعلاه. أوافق على أن المنتجع الصحي غير مسؤول عن أي حالة ناتجة عن العلاج.'
                  : 'The undersigned has read and understood the above contents and terms. The undersigned represent that the information provided is true and accurate and understands the importance of alerting the staff to any medical conditions or concern. The spa reserves the right to refuse treatment. I agree that either the spa, not its employee or management shall be liable or responsible for aggravation of any existing conditions as a result of my treatment. I am voluntarily undertaking this treatment.'}
              </div>

              {/*  */}

              
              {/* Signature */}
              <div className=" p-3 print:p-2 rounded print:rounded-none">
                <h2 className="text-[14px] font-semibold text-gray-800 mb-2 print:mb-1 border-b pb-1">Customer Signature</h2>
                <div className="border border-gray-300 p-2 rounded bg-white flex items-center justify-center" style={{ minHeight: '90px' }}>
                  <img
                    src={formData.signature && formData.signature.startsWith('data:image') ? formData.signature : placeholderSignature}
                    alt="Customer Signature"
                    style={{ maxWidth: '200px', maxHeight: '80px', display: 'block', margin: '0 auto', opacity: formData.signature && formData.signature.startsWith('data:image') ? 1 : 0.5 }}
                  />
                </div>
              </div>


              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PDFPreviewPage; 