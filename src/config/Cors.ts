interface OriginCallback {
  (err: Error | null, allow: boolean): void;
}

const workOrigin = (currentOrigin: string, cb: OriginCallback): void => {
  if (process.env.NODE_ENV === 'development') {
    cb(null, true);
    return;
  }
  if (
    currentOrigin === process.env.APP_URL ||
    currentOrigin === process.env.URL_ENABLE_CORS
  ) {
    cb(null, true);
    return;
  }

  cb(new Error('Not allowed'), false);
};

export default {
  origin: workOrigin,

  methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],

  allowedHeaders: ['Content-Type', 'Authorization'],

  credentials: true,

  maxAge: 90,
};
