import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from '../assets/logo1.png';
import bodyFrontImg from '../assets/body-forward.png';
import bodyBackImg from '../assets/body-backward.png';

const BODY_IMG_WIDTH = 180;
const BODY_IMG_HEIGHT = 252;

// Dot positions in percentages (matching PDFPreviewPage.jsx)
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

const getSelectedPartLabels = (selectedBodyParts, language = 'en') => {
  const allParts = [...BODY_PARTS.front, ...BODY_PARTS.back];
  
  // Arabic translations for body parts
  const bodyPartTranslations = {
    'Head': 'الرأس',
    'Neck': 'الرقبة',
    'Left Shoulder': 'الكتف الأيسر',
    'Right Shoulder': 'الكتف الأيمن',
    'Chest': 'الصدر',
    'Abdomen': 'البطن',
    'Left Arm': 'الذراع اليسرى',
    'Right Arm': 'الذراع اليمنى',
    'Left Wrist': 'المعصم الأيسر',
    'Right Wrist': 'المعصم الأيمن',
    'Left Thigh': 'الفخذ الأيسر',
    'Right Thigh': 'الفخذ الأيمن',
    'Left Leg': 'الساق اليسرى',
    'Right Leg': 'الساق اليمنى',
    'Left Back Shoulders': 'أكتاف الظهر اليسرى',
    'Right Back Shoulders': 'أكتاف الظهر اليمنى',
    'Left Back Wrist': 'معصم الظهر الأيسر',
    'Right Back Wrist': 'معصم الظهر الأيمن',
    'Upper Back': 'أعلى الظهر',
    'Lower Back': 'أسفل الظهر',
    'Left Back Thigh': 'فخذ الظهر الأيسر',
    'Right Back Thigh': 'فخذ الظهر الأيمن',
    'Left Back Arm': 'ذراع الظهر اليسرى',
    'Right Back Arm': 'ذراع الظهر اليمنى',
    'Left Back Leg': 'ساق الظهر اليسرى',
    'Right Back Leg': 'ساق الظهر اليمنى'
  };
  
  return selectedBodyParts.map(partId => {
    const part = allParts.find(p => p.id === partId);
    if (!part) return partId;
    
    if (language === 'ar') {
      return bodyPartTranslations[part.label] || part.label;
    }
    return part.label;
  });
};

const renderBodySVG = (side, selectedIds) => {
  const parts = BODY_PARTS[side];
  return `
    <div style="position:relative;width:${BODY_IMG_WIDTH}px;height:${BODY_IMG_HEIGHT}px;display:inline-block;background:#222;border-radius:8px;border:3px solid #111;">
      <img src="${side === 'front' ? bodyFrontImg : bodyBackImg}" width="${BODY_IMG_WIDTH}" height="${BODY_IMG_HEIGHT}" style="display:block;object-fit:contain;filter:contrast(3) grayscale(1) brightness(1);background:#222;" />
      ${parts.map(({ id, x, y }) => {
        const isSelected = selectedIds.includes(id);
        return `
          <div style="
            position:absolute;
            left:${x}%;
            top:${y}%;
            width:18px;
            height:18px;
            border-radius:50%;
            background:${isSelected ? '#fff' : 'rgba(120,120,120,0.15)'};
            border:2px solid #111;
            box-shadow:${isSelected ? '0 0 8px #fff' : 'none'};
            transform:translate(-50%,-50%);
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:12px;
            color:#222;
            font-weight:bold;
          ">
            ${isSelected ? '<span style="display:block;width:14px;height:14px;background:#fff;border-radius:50%;border:2px solid #ef4444;"></span>' : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
};

export const generateAppointmentPDF = async (formData) => {
  const selectedFront = formData.selectedBodyParts?.filter(id => BODY_PARTS.front.some(p => p.id === id)) || [];
  const selectedBack = formData.selectedBodyParts?.filter(id => BODY_PARTS.back.some(p => p.id === id)) || [];

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "1100px";
  container.style.minHeight = "1600px";
  container.style.background = "#fff";
  container.style.fontFamily = "'Assistant', Arial, 'Tahoma', 'Microsoft Sans Serif', sans-serif";
  container.style.fontSize = "16px";
  container.style.color = "#222";
  container.style.borderRadius = "18px";
  container.style.direction = formData.language === 'ar' ? 'rtl' : 'ltr';

  document.body.appendChild(container);

  // Helper to get names for services/treatments/foods
  const getNames = (ids, list, type) => {
    if (!Array.isArray(ids)) return [];
    return ids.map(id => {
      const obj = list.find(item => String(item.id) === String(id));
      if (!obj) return id;
      if (type === 'service' || type === 'treatment') {
        if (formData.language === 'ar') return obj.name_ar || obj.name_en || id;
        return obj.name_en || obj.name_ar || id;
      }
      // foods
      if (formData.language === 'ar') return obj.name_ar || obj.name || id;
      return obj.name || obj.name_ar || id;
    });
  };

  // Get names for selected services, treatments, foods
  const selectedServicesNames = getNames(formData.selectedServices, formData.categories || [], 'service');
  const selectedFoodsNames = getNames(formData.selectedFoods, formData.foodsList || [], 'food');
  const selectedProductsNames = getNames(formData.selectedProducts, formData.productsList || [], 'treatment');
  
  // Generate treatment names with duration and price info
  const selectedTreatmentsWithDuration = formData.selectedTreatments ? 
    formData.selectedTreatments.map(treatmentId => {
      const treatment = formData.treatments?.find(t => String(t.id) === String(treatmentId));
      const durationInfo = formData.selectedDurations?.[treatmentId];
      
      if (treatment && durationInfo) {
        const treatmentName = formData.language === 'ar' ? 
          (treatment.name_ar || treatment.name_en) : 
          (treatment.name_en || treatment.name_ar);
        const currency = formData.language === 'ar' ? 'ريال' : 'QR';
        return `${treatmentName} (${durationInfo.duration} - ${durationInfo.price} ${currency})`;
      } else if (treatment) {
        return formData.language === 'ar' ? 
          (treatment.name_ar || treatment.name_en) : 
          (treatment.name_en || treatment.name_ar);
      }
      return treatmentId;
    }) : [];

  // Arabic translations for PDF labels
  const labels = {
    title: formData.language === 'ar' ? '' : 'Customer Consultation',
    personalDetails: formData.language === 'ar' ? 'البيانات الشخصية' : 'Personal Details',
    name: formData.language === 'ar' ? 'الاسم' : 'Name',
    phone: formData.language === 'ar' ? 'الهاتف' : 'Phone',
    nationality: formData.language === 'ar' ? 'الجنسية' : 'Nationality',
    selectedServices: formData.language === 'ar' ? 'الخدمات المختارة' : 'Selected Services',
    selectedTreatments: formData.language === 'ar' ? 'العلاجات المختارة' : 'Selected Treatments',
    selectedFoods: formData.language === 'ar' ? 'الأطعمة والمشروبات المختارة' : 'Selected Foods & Beverages',
    selectedProducts: formData.language === 'ar' ? 'المنتجات المختارة' : 'Selected Products',
    knowAboutUs: formData.language === 'ar' ? 'كيف علمت عنا؟' : 'How did you know about us?',
    source: formData.language === 'ar' ? 'المصدر' : 'Source',
    socialMedia: formData.language === 'ar' ? 'وسائل التواصل الاجتماعي' : 'Social Media',
    healthCondition: formData.language === 'ar' ? 'الحالة الصحية للعميل' : 'Customer Health Condition',
    healthConditions: formData.language === 'ar' ? 'الحالات الصحية' : 'Health Conditions',
    implants: formData.language === 'ar' ? 'الزراعات' : 'Implants',
    implantDetails: formData.language === 'ar' ? 'تفاصيل الزراعات' : 'Implant Details',
    massageOnly: formData.language === 'ar' ? 'للمساج فقط' : 'For Massage Only',
    massagePressure: formData.language === 'ar' ? 'ضغط المساج' : 'Massage Pressure',
    selectedBodyParts: formData.language === 'ar' ? 'أجزاء الجسم المختارة' : 'Selected Body Parts',
    skinType: formData.language === 'ar' ? 'نوع البشرة' : 'Skin Type',
    otherConcerns: formData.language === 'ar' ? 'مخاوف أخرى' : 'Other Concerns',
    customerSignature: formData.language === 'ar' ? 'توقيع العميل' : 'Customer Signature',
    noDetailsProvided: formData.language === 'ar' ? 'لم يتم تقديم تفاصيل' : 'No details provided',
    notAvailable: formData.language === 'ar' ? 'غير متوفر' : 'N/A'
  };

  container.innerHTML = `
    <style>
      .pdf-header {
        text-align: center;
        padding-top: 32px;
        margin-bottom: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .pdf-logo {
        width: 120px;
        height: auto;
        margin-bottom: 8px;
        display: block;
        margin-left: auto;
        margin-right: auto;
      }
      .pdf-company {
        font-size: 28px;
        font-weight: bold;
        color: #1e293b;
        margin-bottom: 2px;
        letter-spacing: 2px;
      }
      .pdf-title {
        font-size: 22px;
        font-weight: 600;
        color: #2563eb;
        margin-bottom: 18px;
        letter-spacing: 1px;
      }
      .pdf-main { display: flex; gap: 32px; padding: 24px 48px 12px 48px; background: #fff; border-radius: 18px; min-height: 1273px; }
      .col { flex: 1; background: #fff; border-radius: 16px; padding: 32px; margin-bottom: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);}
      .section-title { font-size: 18px; font-weight: bold; margin-bottom: 18px; color: #222; }
      .label { font-weight: 600; margin-bottom: 4px; color: #444; }
      .value { margin-bottom: 12px; color: #222; }
      .line { height: 1px; background: #eee; margin: 16px 0; }
      .body-images { display: flex; gap: 32px; justify-content: center; align-items: flex-start; margin-bottom: 8px; }
      .selected-parts-list { color:#222; padding:8px 0 0 0; border-radius:8px; margin-bottom:8px; font-size:14px; }
      .notes { margin-top:0; color:#b91c1c; font-weight:bold; text-align:left; }
      .terms { margin-top:0; color:#444; font-size:14px; text-align:left; line-height:1.7; }
      .selected-list { margin-bottom: 12px; }
      .selected-list span { display:inline-block; background:#f3f4f6; color:#222; padding:4px 12px; border-radius:12px; margin-right:6px; font-size:14px; font-weight:500; }
    </style>
    <div class="pdf-header">
      <img src="${logo}" class="pdf-logo" alt="BALANCE SPA Logo" />
      <div class="pdf-company">BALANCE SPA</div>
      <div class="pdf-title">${labels.title}</div>
    </div>
    <div class="pdf-main">
      <div class="col">
        <div class="section-title">${labels.personalDetails}</div>
        <div class="label">${labels.name}</div><div class="value">${formData.name || labels.notAvailable}</div>
        <div class="label">${labels.phone}</div><div class="value">${formData.mobile || labels.notAvailable}</div>
        <div class="label">${labels.nationality}</div><div class="value">${formData.nationality || labels.notAvailable}</div>
        <div class="label">${labels.selectedServices}</div>
        <div class="selected-list">${selectedServicesNames.length ? selectedServicesNames.map(n => `<span>${n}</span>`).join('') : labels.notAvailable}</div>
        <div class="label">${labels.selectedTreatments}</div>
        <div class="selected-list">${selectedTreatmentsWithDuration.length ? selectedTreatmentsWithDuration.map(n => `<span>${n}</span>`).join('') : labels.notAvailable}</div>
        <div class="label">${labels.selectedFoods}</div>
        <div class="selected-list">${selectedFoodsNames.length ? selectedFoodsNames.map(n => `<span>${n}</span>`).join('') : labels.notAvailable}</div>
        <div class="label">${labels.selectedProducts}</div>
        <div class="selected-list">${selectedProductsNames.length ? selectedProductsNames.map(n => `<span>${n}</span>`).join('') : labels.notAvailable}</div>
        <div class="line"></div>
        <div class="section-title">${labels.knowAboutUs}</div>
        <div class="label">${labels.source}</div><div class="value">${Array.isArray(formData.knowFrom) && formData.knowFrom.length ? formData.knowFrom.join(', ') : labels.notAvailable}</div>
        ${Array.isArray(formData.socialMedia) && formData.socialMedia.length ? `<div class="label">${labels.socialMedia}</div><div class="value">${formData.socialMedia.join(', ')}</div>` : ''}
        <div class="line"></div>
        <div class="section-title">${labels.healthCondition}</div>
        <div class="label">${labels.healthConditions}</div><div class="value">${Array.isArray(formData.healthConditions) ? formData.healthConditions.join(', ') : labels.notAvailable}</div>
        <div class="label">${labels.implants}</div><div class="value">${formData.implants || labels.notAvailable}</div>
        ${formData.implants && formData.implants.toLowerCase() === 'yes' ? `<div class="label">${labels.implantDetails}</div><div class="value">${formData.implantDetails || labels.noDetailsProvided}</div>` : ""}
        <div class="line"></div>
        <div class="section-title">${labels.massageOnly}</div>
        <div class="label">${labels.massagePressure}</div><div class="value">${formData.pressure || labels.notAvailable}</div>
      </div>
      <div class="col">
        <div class="section-title">${labels.selectedBodyParts}</div>
        <div class="body-images">
          ${renderBodySVG('front', selectedFront)}
          ${renderBodySVG('back', selectedBack)}
        </div>
        <div class="selected-parts-list">
          ${getSelectedPartLabels(formData.selectedBodyParts, formData.language).map(label => `<span style="color:#222;padding:4px 10px;border-radius:12px;margin-right:4px;display:inline-block;background:#f3f4f6;">${label}</span>`).join('')}
        </div>
        <div class="line"></div>
        <div class="section-title">${labels.skinType}</div>
        <div class="label">${labels.skinType}</div><div class="value">${formData.skinType || labels.notAvailable}</div>
        <div class="label">${labels.otherConcerns}</div><div class="value">${formData.otherConcerns || labels.notAvailable}</div>
        <div class="line"></div>
        <div class="section-title">${labels.customerSignature}</div>
        <div class="value">
          ${formData.signature ? `<img src="${formData.signature}" style="width:150px;height:60px;border-radius:6px;border:1px solid #ccc;object-fit:contain;" />` : (formData.language === 'ar' ? 'لم يتم تقديم توقيع' : 'No signature provided')}
        </div>
        <div style="margin-top:32px; text-align:${formData.language === 'ar' ? 'right' : 'left'};">
          <div class="notes" style="color:#b91c1c; font-weight:bold; text-align:${formData.language === 'ar' ? 'right' : 'left'}; font-size:15px; margin-bottom:8px;">${formData.language === 'ar' ? 'ملاحظات: السلوك الجنسي محظور قانونًا ولن تتسامح معه الإدارة والسلطة.' : 'Notes: Sexual behavior is prohibited by law and will not be tolerated by the management and the Authority.'}</div>
          <div class="terms" style="color:#444; font-size:14px; text-align:${formData.language === 'ar' ? 'right' : 'left'}; line-height:1.7; max-width:600px; margin-${formData.language === 'ar' ? 'right' : 'left'}:0;">${formData.language === 'ar' ? 'لقد قرأ الموقع أدناه وفهم المحتويات والشروط المذكورة أعلاه. يمثل الموقع أدناه أن المعلومات المقدمة صحيحة ودقيقة ويفهم أهمية تنبيه الموظفين إلى أي حالات طبية أو مخاوف. يحتفظ المنتجع الصحي بالحق في رفض العلاج. أوافق على أن المنتجع الصحي وليس موظفيه أو إدارته مسؤولون عن تفاقم أي حالات موجودة نتيجة علاجي. أنا أقوم بهذا العلاج طوعًا.' : 'The undersigned has read and understood the above contents and terms. The undersigned represent that the information provided is true and accurate and understands the importance of alerting the staff to any medical conditions or concern. The spa reserves the right to refuse treatment. I agree that either the spa, not its employee or management shall be liable or responsible for aggravation of any existing conditions as a result of my treatment. I am voluntarily undertaking this treatment.'}</div>
        </div>
      </div>
    </div>
  `;

  // Reduce scale for smaller image size
  const canvas = await html2canvas(container, {
    scale: 1.2, // lower scale for smaller output
    useCORS: true,
    backgroundColor: null,
    logging: false
  });

  // Compress PNG dataURL
  const imgData = canvas.toDataURL("image/jpeg", 0.7); // use JPEG and lower quality
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [1100, 1600]
  });

  pdf.addImage(imgData, "JPEG", 0, 0, 1100, 1600, undefined, 'FAST');
  document.body.removeChild(container);

  return pdf.output("blob");
};
