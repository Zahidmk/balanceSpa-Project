import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  InputNumber,
  Modal,
  message,
  Table,
  Popconfirm,
  Form,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import axios from "../api/axios";
import { getMediaUrl } from "../utils/media";

const emptyForm = {
  name: "",
  name_ar: "",
  description: "",
  description_ar: "",
  price: "",
  tour_url: "",
  image: null,
  imageFile: null,
  video: null,
  videoFile: null,
};

const FacilityAdmin = () => {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setFetching(true);
      const res = await axios.get("/api/facilities");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      message.error("Failed to load facilities");
    } finally {
      setFetching(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name || "",
        name_ar: item.name_ar || "",
        description: item.description || "",
        description_ar: item.description_ar || "",
        price: item.price !== undefined ? item.price : "",
        tour_url: item.tour_url || "",
        image: item.image_url ? getMediaUrl(item.image_url, null) : null,
        imageFile: null,
        video: item.video_url ? getMediaUrl(item.video_url, null) : null,
        videoFile: null,
      });
    } else {
      setForm(emptyForm);
      setEditingItem(null);
    }
    setModalOpen(true);
  };

  const handleCancel = () => {
    setModalOpen(false);
    setForm(emptyForm);
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (value) => {
    setForm((prev) => ({ ...prev, price: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      message.error("Room name (English) is required");
      return;
    }
    if (form.price === "" || form.price === null || form.price === undefined) {
      message.error("Price is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("name_ar", form.name_ar.trim());
    formData.append("description", form.description.trim());
    formData.append("description_ar", form.description_ar.trim());
    formData.append("price", form.price);
    formData.append("tour_url", form.tour_url.trim());

    if (form.imageFile) {
      formData.append("image", form.imageFile);
    } else if (editingItem && editingItem.image_url) {
      formData.append("image_url", editingItem.image_url);
    }

    if (form.videoFile) {
      formData.append("video", form.videoFile);
    } else if (editingItem && editingItem.video_url) {
      formData.append("video_url", editingItem.video_url);
    }

    try {
      setLoading(true);
      if (editingItem) {
        await axios.put(`/api/facilities/${editingItem.id}`, formData);
        message.success("Facility updated successfully");
      } else {
        await axios.post("/api/facilities", formData);
        message.success("Facility added successfully");
      }
      fetchItems();
      handleCancel();
    } catch (err) {
      console.error("Save error:", err);
      message.error("Failed to save facility");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/facilities/${id}`);
      message.success("Facility deleted");
      fetchItems();
    } catch (err) {
      message.error("Failed to delete facility");
    }
  };

  const columns = [
    {
      title: "Preview",
      dataIndex: "image_url",
      width: 90,
      render: (image_url, record) => {
        if (image_url) {
          return (
            <img
              src={getMediaUrl(image_url)}
              alt="Facility"
              className="h-12 w-12 object-cover rounded-lg border"
            />
          );
        }
        if (record.video_url) {
          return (
            <div className="h-12 w-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg text-xs font-semibold">
              <VideoCameraOutlined className="text-base" />
            </div>
          );
        }
        return (
          <div className="h-12 w-12 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg text-xs border">
            No media
          </div>
        );
      },
    },
    {
      title: "Room Name (EN)",
      dataIndex: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Room Name (AR)",
      dataIndex: "name_ar",
      render: (text) => (
        <span className="font-medium" dir="rtl">
          {text || "—"}
        </span>
      ),
    },
    {
      title: "Description (EN)",
      dataIndex: "description",
      ellipsis: true,
      render: (text) => text || "—",
    },
    {
      title: "Price",
      dataIndex: "price",
      width: 110,
      render: (price) => (
        <span className="font-semibold text-green-700">
          {price !== undefined && price !== null
            ? `${Number(price).toFixed(2)} SAR`
            : "—"}
        </span>
      ),
    },
    {
      title: "Tour Video",
      dataIndex: "video_url",
      width: 100,
      render: (video_url) =>
        video_url ? (
          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded font-medium border border-purple-200">
            Uploaded
          </span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      title: "3D Virtual Tour",
      dataIndex: "tour_url",
      width: 120,
      render: (url) =>
        url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-600 underline"
          >
            View Link
          </a>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      title: "Actions",
      width: 110,
      render: (_, item) => (
        <div className="flex gap-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => openModal(item)}
            title="Edit"
          />
          <Popconfirm
            title="Delete this facility?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(item.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} title="Delete" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-6 bg-white text-black">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Facility Admin</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage facility rooms, descriptions, pricing, tour videos, and 3D links.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
          style={{ backgroundColor: "#18181b", borderColor: "#18181b" }}
        >
          Add Facility
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={items}
        rowKey="id"
        loading={fetching}
        pagination={{ pageSize: 8 }}
        bordered
        className="mb-8"
        locale={{ emptyText: "No facilities added yet." }}
      />

      <Modal
        title={
          <span className="text-lg font-semibold">
            {editingItem ? "Edit Facility" : "Add New Facility"}
          </span>
        }
        open={modalOpen}
        onCancel={handleCancel}
        onOk={handleSubmit}
        confirmLoading={loading}
        okText={editingItem ? "Update" : "Add"}
        okButtonProps={{
          style: { backgroundColor: "#18181b", borderColor: "#18181b" },
        }}
        width={600}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Room Name (English)" required>
              <Input
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="e.g. Hydrotherapy Suite"
                maxLength={80}
              />
            </Form.Item>
            <Form.Item label="Room Name (Arabic)">
              <Input
                name="name_ar"
                value={form.name_ar}
                onChange={handleInputChange}
                placeholder="e.g. جناح العلاج المائي"
                maxLength={80}
                dir="rtl"
              />
            </Form.Item>
          </div>

          <Form.Item label="Description (English)">
            <Input.TextArea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              placeholder="Brief description of the facility room..."
              maxLength={500}
              rows={3}
              showCount
            />
          </Form.Item>

          <Form.Item label="Description (Arabic)">
            <Input.TextArea
              name="description_ar"
              value={form.description_ar}
              onChange={handleInputChange}
              placeholder="وصف مختصر لغرفة المرفق..."
              maxLength={500}
              rows={3}
              showCount
              dir="rtl"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Price (SAR)" required>
              <InputNumber
                value={form.price}
                onChange={handlePriceChange}
                min={0}
                precision={2}
                placeholder="0.00"
                prefix="SAR"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item label="3D Virtual Tour URL (Optional)">
              <Input
                name="tour_url"
                value={form.tour_url}
                onChange={handleInputChange}
                placeholder="e.g. https://my.matterport.com/..."
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Cover Image (Optional)">
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={(file) => {
                  setForm((prev) => ({
                    ...prev,
                    image: URL.createObjectURL(file),
                    imageFile: file,
                  }));
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>Upload Photo</Button>
              </Upload>
              {form.image && (
                <div className="mt-2">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="h-20 w-32 object-cover rounded border"
                  />
                </div>
              )}
            </Form.Item>

            <Form.Item label="Room Showcase Video (Optional)">
              <Upload
                accept="video/mp4,video/webm,video/quicktime"
                showUploadList={false}
                beforeUpload={(file) => {
                  setForm((prev) => ({
                    ...prev,
                    video: URL.createObjectURL(file),
                    videoFile: file,
                  }));
                  return false;
                }}
              >
                <Button icon={<VideoCameraOutlined />}>Upload Video</Button>
              </Upload>
              {form.video && (
                <div className="mt-2">
                  <video
                    src={form.video}
                    controls
                    className="h-20 w-32 object-cover rounded border bg-black"
                  />
                </div>
              )}
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default FacilityAdmin;
