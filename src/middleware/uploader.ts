import { Request } from "express";
import multer from "multer";

export const uploaderMemory = () => {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req: Request, file: Express.Multer.File, callback) => {
      const allowedExt = /\.(jpeg|jpg|png|gif)$/;

      const isValid = allowedExt.test(file.originalname.toLowerCase());

      if (!isValid) {
        const error = new Error(
          "Only image files are allowed (jpeg, jpg, png, gif)"
        );
        error.name = "EXTENSION_VALIDATION";
        return callback(error);
      }

      callback(null, true);
    },
  });
};
