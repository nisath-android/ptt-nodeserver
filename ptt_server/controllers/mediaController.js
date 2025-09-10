import express from 'express';
import multer from 'multer';
import config from '../config.js';
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, config.UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false });
    res.json({ success: true, path: `/uploads/${req.file.filename}` });
});

export default router;
