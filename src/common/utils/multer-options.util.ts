import { diskStorage } from 'multer';
import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';

export const multerOptions = {
  // Check the mimetypes to allow only images, videos and pdfs
  fileFilter: (req: any, file: any, cb: any) => {
    // Define allowed file types (extensions and mimetypes)
    const allowedPattern = /\.(jpg|jpeg|png|gif|webp|mp4|mpeg|quicktime|x-matroska|webm|pdf)$/i;
    const allowedMimePattern = /\/(jpg|jpeg|png|gif|webp|mp4|mpeg|quicktime|x-matroska|webm|pdf)$/i;

    if (
      (file.mimetype && file.mimetype.match(allowedMimePattern)) ||
      (file.originalname && file.originalname.match(allowedPattern))
    ) {
      // Allow storage of file
      cb(null, true);
    } else {
      // Reject file
      const extension = extname(file.originalname);
      cb(new HttpException(`Unsupported file type ${extension}. Only images, videos and PDFs are allowed.`, HttpStatus.BAD_REQUEST), false);
    }
  },
  // Storage properties
  storage: diskStorage({
    // Destination folder
    destination: (req: any, file: any, cb: any) => {
      const uploadPath = './uploads';
      // Create folder if doesn't exist
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    // File modification details
    filename: (req: any, file: any, cb: any) => {
      // Calling the callback passing the random name generated with the original extension name
      const name = file.originalname.split('.')[0];
      const fileExtName = extname(file.originalname);
      const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      cb(null, `${name}-${randomName}${fileExtName}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};
