import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to create storage with dynamic path
const createStorage = (subfolder) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join("uploads", subfolder);
      // Ensure directory exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  });
};

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// Configure multer instances
const uploadUser = multer({
  storage: createStorage("userImages"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

const uploadBaseProduct = multer({
  storage: createStorage("baseProducts"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

const uploadVendorProduct = multer({
  storage: createStorage("vendorProducts"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// Export middlewares
export const uploadUserImage = uploadUser.single("userImage");
export const uploadBaseProductImages = uploadBaseProduct.array("images", 10);
export const uploadVendorProductImages = uploadVendorProduct.array("images", 10);
