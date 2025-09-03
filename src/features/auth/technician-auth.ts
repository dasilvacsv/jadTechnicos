"use server";

import { db } from "@/db";
import { technicians } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { auth, signIn, signOut } from "@/features/auth";
import { redirect } from "next/navigation"; // <-- CAMBIO: Importar redirect

// CAMBIO: La firma vuelve a ser simple, solo con formData
export async function signInTechnician(formData: FormData) {
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  if (!phone) {
    // CAMBIO: Redirigimos con el error en la URL
    redirect("/tecnico/sign-in?error=El número de teléfono es requerido.");
  }

  const tech = await db.query.technicians.findFirst({
    where: eq(technicians.phone, phone),
  });

  if (!tech) {
    redirect("/tecnico/sign-in?error=Técnico no encontrado.");
  }

  // 1. Si el técnico NO tiene contraseña (primer inicio de sesión)
  if (!tech.password) {
    // CAMBIO: Redirigimos a la página para crear contraseña
    redirect(`/tecnico/set-password?id=${tech.id}`);
  }
  
  // 2. Si el técnico YA tiene contraseña
  if (!password) {
    redirect("/tecnico/sign-in?error=La contraseña es requerida.");
  }

  const isPasswordValid = await compare(password, tech.password);
  if (!isPasswordValid) {
    redirect("/tecnico/sign-in?error=Credenciales inválidas.");
  }

  // Intentamos iniciar sesión
  await signIn("credentials-technician", {
    phone,
    password,
    redirectTo: "/tecnico/ordenes", // En caso de éxito, redirige aquí
  });
}

// Acción para establecer la contraseña (sin cambios necesarios aquí)
export async function setTechnicianPassword(technicianId: string, password: string) {
  if (password.length < 6) {
    return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
  }
  
  const hashedPassword = await hash(password, 10);

  await db
    .update(technicians)
    .set({ password: hashedPassword })
    .where(eq(technicians.id, technicianId));

  return { success: true };
}

export async function signOutTechnician() {
  // CAMBIO: Corregir la ruta de redirección
  await signOut({ redirectTo: '/tecnico/sign-in' });
}

export async function updateTechnicianPassword(password: string) {
  const session = await auth();
  const technicianId = session?.user?.id;
  
  if (!technicianId) {
    return { success: false, error: "No autenticado." };
  }

  if (password.length < 6) {
    return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
  }
  
  const hashedPassword = await hash(password, 10);
  
  // Encontramos el teléfono del técnico logueado
  const currentTech = await db.query.technicians.findFirst({
    where: eq(technicians.id, technicianId)
  });
  
  if (!currentTech?.phone) {
    return { success: false, error: "No se pudo encontrar al técnico." };
  }

  // Actualizamos la contraseña para TODOS los registros con el mismo número de teléfono
  await db
    .update(technicians)
    .set({ password: hashedPassword })
    .where(eq(technicians.phone, currentTech.phone));

  return { success: true, message: "Contraseña actualizada con éxito." };
}