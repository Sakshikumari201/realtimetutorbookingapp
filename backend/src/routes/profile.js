import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

import { authenticateToken } from '../middleware/auth.js';
import { changeMyPassword, getMyProfile, updateMyProfile, uploadMyAvatar } from '../controllers/profileController.js';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = String(file.originalname || 'avatar').replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({ storage });

router.get('/me', authenticateToken, getMyProfile);
router.patch('/me', authenticateToken, updateMyProfile);
router.patch('/password', authenticateToken, changeMyPassword);
router.post('/avatar', authenticateToken, upload.single('avatar'), uploadMyAvatar);

export default router;
