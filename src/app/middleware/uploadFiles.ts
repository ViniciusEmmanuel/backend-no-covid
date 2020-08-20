import crypto from 'crypto';
import path from 'path';
import multer, { contentParser } from 'fastify-multer';

const destination = path.resolve(__dirname, '..', '..', '..', 'tmp');

const configMulter = {
  storage: multer.diskStorage({
    destination,
    filename(request, file, callback) {
      const hash = crypto.randomBytes(10).toString('hex');
      const fileName = `${hash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};

const uploadFiles = multer(configMulter);

export { uploadFiles, contentParser, destination };
