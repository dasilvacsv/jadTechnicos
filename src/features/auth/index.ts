import NextAuth, { type User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { db } from "@/db"
import { users, technicians } from "@/db/schema" // Se importa la tabla 'technicians'
import { eq } from "drizzle-orm"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    // --- Proveedor para USUARIOS/ADMINS ---
    CredentialsProvider({
      id: "credentials", // ID explícito para diferenciarlo
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.select().from(users).where(eq(users.email, credentials.email.toString())).limit(1)

        if (user.length === 0) return null

        const isPasswordValid = await compare(credentials.password.toString(), user[0].password)

        if (!isPasswordValid) return null

        return {
          id: user[0].id.toString(),
          email: user[0].email,
          name: user[0].fullName,
          role: user[0].role,
        } as User
      },
    }),

    // --- NUEVO: Proveedor para TÉCNICOS con contraseña ---
    CredentialsProvider({
      id: "credentials-technician",
      async authorize(credentials) {
        const { phone, password } = credentials
        if (!phone || !password) return null

        const tech = await db.query.technicians.findFirst({
          where: eq(technicians.phone, phone.toString()),
        })

        // El técnico no existe o aún no ha configurado una contraseña
        if (!tech || !tech.password) return null

        const isPasswordValid = await compare(password.toString(), tech.password)
        if (!isPasswordValid) return null

        return {
          id: tech.id.toString(),
          name: tech.name,
          role: tech.role, // "TECHNICIAN"
          // @ts-ignore - Se agrega 'phone' al objeto de usuario
          phone: tech.phone,
        } as User
      },
    }),

    // --- NUEVO: Proveedor para el primer login del técnico (sin contraseña) ---
    CredentialsProvider({
      id: "credentials-technician-setup",
      async authorize(credentials) {
        const { phone } = credentials
        if (!phone) return null

        const tech = await db.query.technicians.findFirst({
          where: eq(technicians.phone, phone.toString()),
        })

        // Solo autoriza si el técnico existe y AÚN NO tiene contraseña
        if (!tech || tech.password) return null

        return {
          id: tech.id.toString(),
          name: tech.name,
          role: "SETUP", // Rol temporal para indicar que necesita configurar la cuenta
          // @ts-ignore - Se agrega 'phone' al objeto de usuario
          phone: tech.phone,
        } as User
      },
    }),
  ],
  pages: {
  signIn: "/tecnico/sign-in",
},
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.role = user.role
        // @ts-ignore - Se agrega 'phone' al token si existe en el usuario
        if (user.phone) {
          token.phone = user.phone
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.role = token.role as string
        // @ts-ignore - Se agrega 'phone' a la sesión si existe en el token
        if (token.phone) {
          session.user.phone = token.phone as string
        }
      }
      return session
    },
  },
})