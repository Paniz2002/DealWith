import { Express, Request } from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import sharp from "sharp";

export interface MulterRequest extends Request {
  files: any;
}

const storage = multer.diskStorage({
  destination: (req: Request, file: any, cb: any) => {
    const dir = "/app/src/data/images/uploads";
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req: Request, file: any, cb: any) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".webp") {
      return cb(new Error("Only .jpg and .png images are allowed"), false);
    }
    cb(null, "uploadedImage-" + Date.now() + ".webp"); // Salva sempre come .webp
  },
});

const upload = multer({ storage: storage });

export default upload;
