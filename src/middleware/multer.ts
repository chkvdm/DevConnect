import multer from 'multer';
import path from 'path';

// Define a Multer storage configuration to store files in the "public" directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'public'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Multer filter
const maxFileSize = 5 * 1024 * 1024;
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
) => {
  if (!file.mimetype.match(/png|jpe?g/) || file.size > maxFileSize) {
    cb(new Error('File must be a png, jpg, or jpeg under 4MB'), false);
  } else {
    cb(null, true);
  }
};

// Create a Multer instance to handle file uploads
export const upload = multer({
  storage,
  fileFilter,
});
