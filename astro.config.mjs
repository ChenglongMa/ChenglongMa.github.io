import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://chenglongma.com',
  output: 'static',
  build: {
    format: 'directory'
  },
  redirects: {
    '/cv/': '/files/cv/chenglong-ma-cv.pdf',
    '/publication/': '/publications/',
    '/project/': '/projects/',
    '/talk/': '/talks/',
    '/publication/ma-www-2024/': '/publication/ma_www_2024/',
    '/publication/rejon-pina-classification-2023/': '/publication/rejon_pina_classification_2023/',
    '/publication/ma-cikm-2022/': '/publication/ma_cikm_2022/',
    '/publication/ma-sigir-2022/': '/publication/ma_sigir_2022/',
    '/publication/ma-simrec-2021/': '/publication/ma_simrec_2021/',
    '/event/cikm-22/': '/talks/cikm-2022/',
    '/event/sigir-22/': '/talks/sigir-2022/',
    '/uploads/cv.pdf': '/files/cv/chenglong-ma-cv.pdf',
    '/posters/www2024.pdf': '/files/posters/www2024.pdf'
  }
});
