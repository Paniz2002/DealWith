import fs from 'fs';
import { Express, Request } from 'express';
import path from 'path';
import multer from "multer";

export interface MulterRequest extends Request {
    files: any;
}

// soluzione un po' greedy con cast a any
const storage = multer.diskStorage({
    destination: (req: Request, file: any, cb: any) => {
        console.log('req.body', req.body)
        const dir = '/app/src/data/images/uploads'
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req: Request, file: any, cb: any) => {
        cb(null, 'uploadedImage-' + Date.now() + path.extname(file.originalname));
    }
});

// Inizializza multer con lo storage configurato
const upload = multer({ storage: storage });

export default upload;