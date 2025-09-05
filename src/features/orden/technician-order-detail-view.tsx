// src/features/orden/technician-order-detail-view.tsx

"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Phone, Wrench, Calendar, AlertTriangle, DollarSign, ShieldCheck, Clock, Info, 
    UserCheck, HardHat, MapPin, MessageSquare
} from "lucide-react";
import { Button } from '@/components/ui/button';

// Icono específico para WhatsApp
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    </svg>
);

// ============================================================================
// 1. LÓGICA DE ESTADO Y HELPERS
// ============================================================================
const statusConfig: { [key: string]: { text: string; icon: React.ElementType; bgColor?: string; color?: string; } } = {
    PREORDER: { text: "Pre-orden", icon: Clock, bgColor: "bg-gray-100", color: "text-gray-600" },
    PENDING: { text: "Pendiente", icon: Clock, bgColor: "bg-amber-100", color: "text-amber-600" },
    ASSIGNED: { text: "Asignada", icon: UserCheck, bgColor: "bg-sky-100", color: "text-sky-600" },
    IN_PROGRESS: { text: "En Progreso", icon: HardHat, bgColor: "bg-blue-100", color: "text-blue-600" },
    COMPLETED: { text: "Completada", icon: ShieldCheck, bgColor: "bg-green-100", color: "text-green-600" },
    DELIVERED: { text: "Entregada", icon: ShieldCheck, bgColor: "bg-emerald-100", color: "text-emerald-600" },
    CANCELLED: { text: "Cancelada", icon: AlertTriangle, bgColor: "bg-red-100", color: "text-red-600" },
    APROBADO: { text: "Aprobada", icon: ShieldCheck, bgColor: "bg-green-100", color: "text-green-600" },
    NO_APROBADO: { text: "No Aprobada", icon: AlertTriangle, bgColor: "bg-red-100", color: "text-red-600" },
    PENDIENTE_AVISAR: { text: "Pendiente Avisar", icon: MessageSquare, bgColor: "bg-yellow-100", color: "text-yellow-600" },
    FACTURADO: { text: "Presupuestado", icon: DollarSign, bgColor: "bg-indigo-100", color: "text-indigo-600" },
    REPARANDO: { text: "Reparando", icon: Wrench, bgColor: "bg-blue-100", color: "text-blue-600" },
};

const ClientFormattedDate = ({ dateString }: { dateString: string | null }) => {
    const [formattedDate, setFormattedDate] = React.useState<string | null>(null);
    React.useEffect(() => {
        if (dateString) {
            setFormattedDate(new Date(dateString).toLocaleString("es-VE", {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }));
        }
    }, [dateString]);
    return <>{formattedDate || "No especificada"}</>;
};

const formatCurrency = (amount: string | number | null) => new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(Number(amount || 0));

const formatPhoneNumberForWhatsApp = (phone: string | null): string => {
    if (!phone) return "";
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.startsWith('04')) {
        return `58${cleanedPhone.substring(1)}`;
    }
    if (cleanedPhone.startsWith('58')) {
        return cleanedPhone;
    }
    return phone;
};

// ============================================================================
// 2. COMPONENTES DE UI REFINADOS
// ============================================================================
const InfoRow = ({ icon: Icon, label, value, valueClass = "" }: { icon?: React.ElementType, label: string, value: React.ReactNode, valueClass?: string }) => (
    <div className="flex items-start gap-3">
        {Icon && <Icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />}
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`font-medium text-gray-900 dark:text-gray-100 ${valueClass}`}>{value || "N/A"}</p>
        </div>
    </div>
);

const ApplianceItem = ({ appliance, index }: { appliance: any, index: number }) => (
    <motion.div 
        className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
    >
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50">
            <h3 className="font-bold text-md text-gray-800 dark:text-gray-100">{appliance.clientAppliance.name}</h3>
            <p className="text-xs text-gray-500">{appliance.clientAppliance.brand.name} / {appliance.clientAppliance.applianceType.name}</p>
        </div>
        {appliance.falla && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-400 rounded-md">
                    <h4 className="font-semibold flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="h-5 w-5" /> Falla Reportada
                    </h4>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-200 italic">"{appliance.falla}"</p>
                </div>
            </div>
        )}
    </motion.div>
);

const StickyActionBar = ({ clientPhone }: { clientPhone: string }) => {
    const whatsappNumber = formatPhoneNumberForWhatsApp(clientPhone);

    return (
        <div className="sticky bottom-0 left-0 right-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm p-2 border-t dark:border-gray-800 lg:hidden">
            <div className="flex justify-between items-center gap-2">
                <div className="flex-1 flex gap-2">
                    <Button asChild size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <a href={`tel:${clientPhone}`} className="flex items-center justify-center gap-2"><Phone className="h-4 w-4" /> Llamar</a>
                    </Button>
                    <Button asChild size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                            <WhatsAppIcon className="h-4 w-4 fill-current" /> WhatsApp
                        </a>
                    </Button>
                </div>
                <Button size="sm" variant="outline">
                    <Wrench className="h-4 w-4 mr-1.5" /> Actualizar
                </Button>
            </div>
        </div>
    );
};

// ============================================================================
// 3. COMPONENTE PRINCIPAL
// ============================================================================
export function TechnicianOrderDetailView({ order }: { order: any }) {

    if (!order) return <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-black"><p>Cargando...</p></div>;

    const { client, appliances, status, orderNumber, fechaAgendado, totalAmount, paidAmount, paymentStatus, createdByUser, statusHistory } = order;
    const saldoPendiente = Math.max(0, Number(totalAmount || 0) - Number(paidAmount || 0));
    const pagoPorcentaje = totalAmount > 0 ? (Number(paidAmount || 0) / Number(totalAmount)) * 100 : 0;
    const currentStatus = statusConfig[status] || { text: status, icon: Info };
    const StatusIcon = currentStatus.icon;
    const whatsappNumber = formatPhoneNumberForWhatsApp(client.phone);

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen">
            <main className="max-w-4xl mx-auto pb-20 md:pb-6">
                
                <motion.header 
                    className="p-4 rounded-b-2xl shadow-lg text-white bg-gradient-to-br from-gray-950 via-black to-blue-800"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-sm font-medium opacity-80">Orden de Servicio</p>
                            <h1 className="text-2xl md:text-3xl font-bold">#{orderNumber}</h1>
                        </div>
                        <Badge variant="secondary" className="bg-black/20 border-white/30 text-white backdrop-blur-sm text-sm">
                            <StatusIcon className="h-4 w-4 mr-1.5" /> {currentStatus.text}
                        </Badge>
                    </div>
                    <div className="bg-black/25 p-3 rounded-lg space-y-2">
                        <InfoRow 
                            icon={User} 
                            label="Cliente" 
                            value={client.name}
                            valueClass="!text-white text-md"
                        />
                        <InfoRow 
                            icon={Calendar} 
                            label="Próxima Cita" 
                            value={<ClientFormattedDate dateString={fechaAgendado} />}
                            valueClass="!text-white text-md"
                        />
                    </div>
                </motion.header>

                <div className="p-3 md:p-6">
                    <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full space-y-3">

                        <AccordionItem value="item-1" className="bg-white dark:bg-gray-900 rounded-xl shadow-md border-none">
                            <AccordionTrigger className="p-4 text-md font-semibold hover:no-underline">
                                <div className="flex items-center gap-3"><User className="h-5 w-5 text-blue-500"/> Información del Cliente</div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                                <div className="space-y-3">
                                    <InfoRow icon={MapPin} label="Dirección" value={client.address} />
                                    <InfoRow icon={Phone} label="Teléfono" value={client.phone} />
                                    <div className="hidden lg:flex gap-2 pt-2">
                                        <Button asChild size="sm"><a href={`tel:${client.phone}`}><Phone className="mr-2 h-4 w-4"/>Llamar</a></Button>
                                        <Button asChild size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-600 dark:hover:bg-gray-800">
                                            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                                               <WhatsAppIcon className="mr-2 h-4 w-4 fill-current"/> WhatsApp
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2" className="bg-white dark:bg-gray-900 rounded-xl shadow-md border-none">
                            <AccordionTrigger className="p-4 text-md font-semibold hover:no-underline">
                                 <div className="flex items-center gap-3"><Wrench className="h-5 w-5 text-blue-500"/> Equipo(s) a Revisar ({appliances.length})</div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                               <div className="space-y-3">
                                    {appliances.map((app: any, index: number) => (
                                        <ApplianceItem key={index} appliance={app} index={index} />
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3" className="bg-white dark:bg-gray-900 rounded-xl shadow-md border-none">
                            <AccordionTrigger className="p-4 text-md font-semibold hover:no-underline">
                                 <div className="flex items-center gap-3"><DollarSign className="h-5 w-5 text-green-500"/> Finanzas y Garantía</div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Estado de Pago</h3>
                                        <div className="space-y-2 mb-4">
                                            <InfoRow label="Monto Total" value={formatCurrency(totalAmount)} />
                                            <InfoRow label="Monto Pagado" value={formatCurrency(paidAmount)} valueClass="text-green-600 dark:text-green-500" />
                                            <InfoRow label="Saldo Pendiente" value={formatCurrency(saldoPendiente)} valueClass={`font-bold ${saldoPendiente > 0 ? 'text-red-600 dark:text-red-500' : ''}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">{paymentStatus} ({pagoPorcentaje.toFixed(0)}%)</p>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                <motion.div 
                                                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-2.5 rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pagoPorcentaje}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {(order.garantiaIlimitada || order.garantiaEndDate) && (
                                        <div>
                                          <Separator className="my-4" />
                                            <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-200"><ShieldCheck className="text-green-500"/> Garantía del Servicio</h3>
                                            <InfoRow 
                                                label="Cobertura" 
                                                value={order.garantiaIlimitada ? 'Garantía Ilimitada' : <>Vence el <ClientFormattedDate dateString={order.garantiaEndDate}/></>}
                                                valueClass="font-bold text-green-600 dark:text-green-400"
                                            />
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-4" className="bg-white dark:bg-gray-900 rounded-xl shadow-md border-none">
                            <AccordionTrigger className="p-4 text-md font-semibold hover:no-underline">
                                <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-gray-500"/> Historial y Creación</div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                                 <ul className="space-y-4 text-sm">
                                    <li className="flex gap-4 items-center">
                                        <UserCheck className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">Orden creada por {createdByUser?.fullName}</p>
                                            <p className="text-xs text-gray-500"><ClientFormattedDate dateString={order.createdAt} /></p>
                                        </div>
                                    </li>
                                     {statusHistory?.slice(0, 5).map((h: any) => (
                                        <li key={h.id} className="flex gap-4 items-center">
                                            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${statusConfig[h.status]?.bgColor || 'bg-gray-100'}`}>
                                                {React.createElement(statusConfig[h.status]?.icon || Info, { className: `h-4 w-4 ${statusConfig[h.status]?.color || 'text-gray-500'}` })}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-gray-200">{statusConfig[h.status]?.text || h.status}</p>
                                                <p className="text-xs text-gray-500"><ClientFormattedDate dateString={h.timestamp} /></p>
                                            </div>
                                        </li>
                                    ))}
                                 </ul>
                            </AccordionContent>
                        </AccordionItem>
                        
                    </Accordion>
                </div>
            </main>

            <AnimatePresence>
                {client?.phone && <StickyActionBar clientPhone={client.phone} />}
            </AnimatePresence>
        </div>
    );
}