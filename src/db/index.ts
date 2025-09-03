import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

// Intenta acceder a la variable de entorno de múltiples formas
const databaseUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL

// Usa directamente la URL de la base de datos si las variables de entorno fallan
// Esta es una solución temporal para desarrollo
const fallbackUrl =
  "postgresql://multiservice_owner:npg_VqGSblvD24sc@ep-nameless-star-a4tnbi6d-pooler.us-east-1.aws.neon.tech/multiservice?sslmode=require"

// Usa la URL de la base de datos o el fallback
const connectionString = databaseUrl || fallbackUrl

// Crea la conexión a la base de datos
const sql = neon(connectionString)
export const db = drizzle(sql, { schema })
