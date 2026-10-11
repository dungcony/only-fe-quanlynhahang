import { fileURLToPath } from 'node:url';

export default {
  plugins: {
    // tailwind mặc định tìm config ở gốc project nên phải chỉ đường dẫn tới configs/
    tailwindcss: { config: fileURLToPath(new URL('./tailwind.config.js', import.meta.url)) },
    autoprefixer: {},
  },
};
