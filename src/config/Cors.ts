import { FastifyCorsOptions } from 'fastify-cors';

const optionsCors: FastifyCorsOptions = {
  origin: process.env.URL_ENABLE_CORS,

  methods: ['GET', 'PUT', 'OPTIONS', 'PATCH', 'POST', 'DELETE'],

  allowedHeaders: ['Content-Type', 'Authorization'],

  credentials: true,

  maxAge: 90,
};

export default optionsCors;
