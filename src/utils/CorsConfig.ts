export const allowedOrigins: string[] = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

export const corsConfigs = {
  origin: (origin: string, callback?: (args?: any) => void) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
    } else {
      if (callback) callback(new Error('Origin not allowed by Cors'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
