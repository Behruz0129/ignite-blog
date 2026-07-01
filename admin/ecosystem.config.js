/**
 * PM2 KONFIGURATSIYASI (admin panel uchun)
 * ----------------------------------------
 * Next.js ilovasini production rejimida ishlatadi.
 *
 * Ishlatish (VPS'da, admin papkasida):
 *   npm run build
 *   pm2 start ecosystem.config.js
 *   pm2 save
 */

module.exports = {
  apps: [
    {
      name: "ignite-admin",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "400M",
      time: true,
    },
  ],
};
