import Facility from '../models/facilityModel.js';

const getAll = async (req, res) => {
  try {
    const [rows] = await Facility.getAll();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching facilities:', err);
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
};

const getById = async (req, res) => {
  try {
    const [rows] = await Facility.getById(req.params.id);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching facility:', err);
    res.status(500).json({ error: 'Failed to fetch facility' });
  }
};

const create = async (req, res) => {
  try {
    const { name, name_ar, description, description_ar, price, video_url, tour_url } = req.body;
    let image_url = null;
    let final_video_url = video_url || null;

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        image_url = '/pdf-assets/' + req.files.image[0].filename;
      }
      if (req.files.video && req.files.video[0]) {
        final_video_url = '/pdf-assets/' + req.files.video[0].filename;
      }
    } else if (req.file) {
      image_url = '/pdf-assets/' + req.file.filename;
    }

    if (!image_url && req.body.image_url) {
      image_url = req.body.image_url;
    }

    const data = {
      name,
      name_ar: name_ar || null,
      description: description || null,
      description_ar: description_ar || null,
      price: price !== undefined && price !== '' ? Number(price) : 0,
      image_url,
      video_url: final_video_url,
      tour_url: tour_url || null,
    };
    const [result] = await Facility.create(data);
    res.status(201).json({ message: 'Facility created', id: result.insertId });
  } catch (err) {
    console.error('Error creating facility:', err);
    res.status(500).json({ error: 'Failed to create facility' });
  }
};

const update = async (req, res) => {
  try {
    const { name, name_ar, description, description_ar, price, video_url, tour_url } = req.body;
    let image_url = req.body.image_url;
    let final_video_url = video_url !== undefined ? video_url : null;

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        image_url = '/pdf-assets/' + req.files.image[0].filename;
      }
      if (req.files.video && req.files.video[0]) {
        final_video_url = '/pdf-assets/' + req.files.video[0].filename;
      }
    } else if (req.file) {
      image_url = '/pdf-assets/' + req.file.filename;
    }

    const data = {
      name,
      name_ar: name_ar || null,
      description: description || null,
      description_ar: description_ar || null,
      price: price !== undefined && price !== '' ? Number(price) : 0,
      image_url: image_url || null,
      video_url: final_video_url,
      tour_url: tour_url !== undefined ? tour_url : null,
    };
    await Facility.update(req.params.id, data);
    res.json({ message: 'Facility updated' });
  } catch (err) {
    console.error('Error updating facility:', err);
    res.status(500).json({ error: 'Failed to update facility' });
  }
};

const deleteFacility = async (req, res) => {
  try {
    await Facility.delete(req.params.id);
    res.json({ message: 'Facility deleted' });
  } catch (err) {
    console.error('Error deleting facility:', err);
    res.status(500).json({ error: 'Failed to delete facility' });
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: deleteFacility,
};
