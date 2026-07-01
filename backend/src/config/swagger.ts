/**
 * SWAGGER (OpenAPI) hujjati
 * -------------------------
 * /api/docs manzilida interaktiv API hujjatini ko'rsatadi.
 * Endpointlar tavsifi route fayllaridagi JSDoc (@openapi) izohlardan olinadi.
 */

import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ignite Blog CMS API",
      version: "1.0.0",
      description:
        "Gaming blog CMS uchun REST API. News, Guides, Opinions, Categories, Tags, Comments, Media.",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Login natijasida olingan JWT tokenni kiriting.",
        },
      },
    },
    tags: [
      { name: "Auth", description: "Autentifikatsiya" },
      { name: "Dashboard", description: "Statistika" },
      { name: "News", description: "Yangiliklar" },
      { name: "Guides", description: "Qo'llanmalar" },
      { name: "Opinions", description: "Fikr-mulohazalar" },
      { name: "Categories", description: "Kategoriyalar" },
      { name: "Tags", description: "Teglar" },
      { name: "Comments", description: "Izohlar" },
      { name: "Media", description: "Media kutubxona" },
    ],
  },
  // JSDoc izohlar qaysi fayllardan o'qilishi
  apis: ["./src/routes/*.ts", "./src/docs/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
