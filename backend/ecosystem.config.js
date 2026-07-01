/**
 * PM2 KONFIGURATSIYASI (backend uchun)
 * ------------------------------------
 * PM2 - Node.js ilovalarini ishlab chiqarishda (production) doimiy ishlatib
 * turuvchi "process manager". Server qayta yuklansa ham ilovani avtomatik
 * qayta ishga tushiradi.
 *
 * Ishlatish (VPS'da, backend papkasida):
 *   npm run build
 *   pm2 start ecosystem.config.js
 *   pm2 save
 */

module.exports = {
  apps: [
    {
      name: "ignite-api",
      script: "dist/server.js",
      instances: 1, // ko'p yadroli serverda "max" qilib cluster rejimiga o'tish mumkin
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "400M", // xotira oshib ketsa qayta ishga tushadi
      out_file: "./logs/pm2-out.log",
      error_file: "./logs/pm2-error.log",
      time: true,
    },
  ],
};
