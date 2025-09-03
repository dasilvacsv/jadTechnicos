import React from 'react';

// Este layout solo renderiza los hijos.
// Se aplicará a todas las rutas bajo /tecnico, incluyendo sign-in
// y las rutas dentro del grupo (protegido).
export default function TechnicianRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}