import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getTranslations } from "../utils/translations";
import { Button, Input, Modal, Upload, message, Table, Popconfirm, Form } from "antd";
import { PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "../api/axios";
import { getMediaUrl } from "../utils/media";

const FoodBeverages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const lang = params.get('lang') || 'en';
  const services = params.get('services');
  const treatments = params.get('treatments');
  const durations = params.get('durations');
  const products = params.get('products');
  const facilities = params.get('facilities');
  const translations = getTranslations(lang);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: null,
    imageFile: null,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get("/api/food-beverages");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      message.error("Failed to load items");
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name,
        description: item.description,
        image: getMediaUrl(item.image_url, null),
        imageFile: null,
      });
    } else {
      setForm({ name: "", description: "", image: null, imageFile: null });
      setEditingItem(null);
    }
    setModalOpen(true);
  };

  const handleCancel = () => {
    setModalOpen(false);
    setForm({ name: "", description: "", image: null, imageFile: null });
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      message.error("Name is required");
      return;
    }
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    if (form.imageFile) {
      formData.append("image", form.imageFile);
    }
    try {
      setLoading(true);
      if (editingItem) {
        await axios.put(`/api/food-beverages/${editingItem.id}`, formData);
        message.success("Item updated successfully");
      } else {
        await axios.post("/api/food-beverages", formData);
        message.success("Item added successfully");
      }
      fetchItems();
      handleCancel();
    } catch (err) {
      message.error("Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/food-beverages/${id}`);
      message.success("Item deleted successfully");
      fetchItems();
    } catch (err) {
      message.error("Failed to delete item");
    }
  };

  const handleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((iid) => iid !== id) : [...prev, id]
    );
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image_url",
      render: (image_url) =>
        image_url ? (
          <img
            src={getMediaUrl(image_url)}
            alt="Food"
            className="h-12 w-12 object-cover rounded-full border"
          />
        ) : (
          <div className="h-12 w-12 flex items-center justify-center bg-gray-200 text-gray-500 rounded-full">
            ?
          </div>
        ),
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Select",
      render: (_, item) => (
        <input
          type="checkbox"
          checked={selectedItems.includes(item.id)}
          onChange={() => handleSelect(item.id)}
          className="w-5 h-5 accent-blue-500 cursor-pointer"
        />
      ),
    },
    {
      title: "Actions",
      render: (_, item) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => openModal(item)} />
          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() => handleDelete(item.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} className="ml-2" />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className={`min-h-screen p-6 ${lang === 'ar' ? 'font-arabic' : ''} bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center`}>
      {/* Header with Back Button */}
      <div className="w-full max-w-6xl relative mb-8">
        {/* Back Button */}
        <div className={`absolute top-0 ${lang === 'ar' ? 'right-0' : 'left-0'}`}>
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-blue-400 flex items-center gap-2 text-lg font-medium transition-colors duration-300"
          >
            <svg width="24" height="24" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={lang === 'ar' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
            <span>{lang === 'ar' ? 'الرجوع' : 'Back'}</span>
          </button>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center tracking-wide">{lang === 'ar' ? 'الأطعمة والمشروبات' : 'Food & Beverages'}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 justify-items-center w-full max-w-6xl">
        {items.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 text-lg">{lang === 'ar' ? 'لا توجد أطعمة أو مشروبات متاحة.' : 'No food or beverages available.'}</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white text-black rounded-2xl shadow-xl p-6 w-full max-w-xs flex flex-col items-center transition-transform hover:scale-105">
              <img
                src={getMediaUrl(item.image_url, 'https://via.placeholder.com/100x100?text=No+Image')}
                alt={lang === 'ar' ? item.name_ar : item.name}
                className="h-24 w-24 object-cover rounded-full border-2 border-gray-300 mb-4 shadow"
              />
              <div className="font-bold text-xl mb-2 text-center">{lang === 'ar' ? item.name_ar : item.name}</div>
              <div className="text-gray-700 text-base mb-2 text-center">
                {lang === 'ar' ? item.description_ar : item.description}
              </div>
              <label className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelect(item.id)}
                  className="w-5 h-5 accent-purple-600 cursor-pointer"
                />
                <span className="text-base font-semibold">{lang === 'ar' ? 'اختيار' : 'Select'}</span>
              </label>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-center mt-16">
        <Button
          type="default"
          className="bg-white text-black px-10 py-4 rounded-full shadow-lg hover:bg-gray-100 text-xl font-bold flex items-center gap-2 border border-gray-300"
          onClick={() => {
            // Pass all selections to BookingForm including durations
            window.location.href = `/booking?lang=${lang}`
              + (services ? `&services=${services}` : '')
              + (treatments ? `&treatments=${treatments}` : '')
              + (durations ? `&durations=${durations}` : '')
              + (products ? `&products=${products}` : '')
              + (facilities ? `&facilities=${facilities}` : '')
              + (selectedItems.length > 0 ? `&food=${selectedItems.join(",")}` : '');
          }}
        >
          {lang === 'ar' ? 'احجز الآن' : 'Book Now'}
        </Button>
      </div>
    </div>
  );
};

export default FoodBeverages;
