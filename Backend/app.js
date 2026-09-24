import foodBeverageRoutes from './routes/foodBeverageRoutes.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ 1. CORS
app.use(cors({
  origin: ['https://balancespa.net', 'https://www.balancespa.net', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// ✅ 2. ONLY JSON parser (not for files!)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 3. Routes that use multer (handles multipart/form-data correctly)
import bookingRoutes from './routes/bookingRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import treatmentRoutes from './routes/treatmentRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import productRoutes from './routes/productRoutes.js';
import facilityRoutes from './routes/facilityRoutes.js';

app.use('/api/bookings', bookingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/treatments', treatmentRoutes); // ✅ this uses multer
app.use('/api/customers', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/food-beverages', foodBeverageRoutes);
app.use('/api/products', productRoutes); // ✅ this uses multer
app.use('/api/facilities', facilityRoutes);

// ✅ Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/pdfs', express.static(path.join(__dirname, 'uploads/pdfs')));
app.use('/pdf-assets', express.static(path.join(__dirname, 'public/pdf-assets')));

// ✅ React frontend (if serving from backend)
app.use(express.static(path.join(__dirname, 'views')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

export default app;
