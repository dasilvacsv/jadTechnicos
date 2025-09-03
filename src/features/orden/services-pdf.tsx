import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
    // --- CONFIGURACIÓN GLOBAL MÁS PEQUEÑA ---
    page: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        fontFamily: 'Helvetica',
        fontSize: 7, // Tamaño de fuente base reducido
    },
    header: {
        marginBottom: 12,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#e8e8e8',
    },
    title: {
        fontSize: 16,
        marginBottom: 6,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 8,
        textAlign: 'center',
        color: '#6c6c6c',
    },
    // --- RESUMEN GENERAL AJUSTADO ---
    summaryContainer: {
        marginBottom: 14,
        padding: 10,
        backgroundColor: '#f8fafc',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#e8e8e8',
    },
    summaryTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    totalStats: {
        flexDirection: 'row',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        minWidth: '25%',
        marginBottom: 4,
    },
    statNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 1,
    },
    statLabel: {
        fontSize: 6,
        color: '#64748b',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    technicianDistribution: {
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#e8e8e8',
    },
    distributionTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    multiColumnContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    multiColumnItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '50%',
        paddingVertical: 1,
        paddingRight: 7,
    },
    technicianName: {
        fontSize: 7,
    },
    technicianCount: {
        fontSize: 7,
        fontWeight: 'bold',
    },
    // --- SECCIÓN DE TÉCNICO INDIVIDUAL AJUSTADA ---
    technicianSection: {
        marginBottom: 18,
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#e8e8e8',
    },
    technicianHeader: {
        fontSize: 11,
        paddingBottom: 3,
        marginBottom: 4,
        fontWeight: 'bold',
    },
    technicianStatsLine: {
        flexDirection: 'row',
        fontSize: 7,
        marginBottom: 5,
        paddingBottom: 3,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f1f1f1',
        flexWrap: 'wrap',
    },
    statText: {
        marginRight: 6,
        marginBottom: 2,
    },
    bold: {
        fontWeight: 'bold',
    },
    // Colores para diferentes status
    statusPending: { color: '#f59e0b', fontWeight: 'bold' },
    statusAssigned: { color: '#3b82f6', fontWeight: 'bold' },
    statusInProgress: { color: '#8b5cf6', fontWeight: 'bold' },
    statusCompleted: { color: '#10b981', fontWeight: 'bold' },
    statusDelivered: { color: '#059669', fontWeight: 'bold' },
    statusCancelled: { color: '#dc2626', fontWeight: 'bold' },
    statusPreorder: { color: '#7c3aed', fontWeight: 'bold' },
    statusAprobado: { color: '#059669', fontWeight: 'bold' },
    statusNoAprobado: { color: '#dc2626', fontWeight: 'bold' },
    statusPendienteAvisar: { color: '#f59e0b', fontWeight: 'bold' },
    statusFacturado: { color: '#0891b2', fontWeight: 'bold' },
    statusEntregaGenerada: { color: '#059669', fontWeight: 'bold' },
    statusGarantiaAplicada: { color: '#dc2626', fontWeight: 'bold' },
    statusReparando: { color: '#8b5cf6', fontWeight: 'bold' },
    // --- TABLA DE SERVICIOS ---
    serviceTableContainer: {
        marginTop: 6,
    },
    serviceTable: {
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 0.5,
        borderColor: '#e0e0e0',
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    serviceTableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderBottomColor: '#e0e0e0',
        borderBottomWidth: 0.5,
        fontWeight: 'bold',
        height: 18,
    },
    serviceTableRow: {
        flexDirection: 'row',
        borderBottomColor: '#e0e0e0',
        borderBottomWidth: 0.5,
        minHeight: 16,
    },
    serviceTableCellHeader: {
        fontSize: 6.5,
        padding: 2.5,
        borderStyle: 'solid',
        borderWidth: 0.5,
        borderColor: '#e0e0e0',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    serviceTableCell: {
        fontSize: 6,
        padding: 2.5,
        borderStyle: 'solid',
        borderWidth: 0.5,
        borderColor: '#e0e0e0',
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    // ANCHOS DE COLUMNAS
    colNumero: { width: '8%', textAlign: 'left' },
    colCliente: { width: '15%', textAlign: 'left' },
    colElectrodomestico: { width: '16%', textAlign: 'left' },
    colTelefono: { width: '10%', textAlign: 'left' },
    colStatus: { width: '12%', textAlign: 'center' },
    colFalla: { width: '20%', textAlign: 'left' },
    colMonto: { width: '10%', textAlign: 'right' },
    colFecha: { width: '9%', textAlign: 'center' },

    // --- FOOTER ---
    footer: {
        position: 'absolute',
        bottom: 15,
        left: 20,
        right: 20,
        fontSize: 6,
        textAlign: 'center',
        color: '#888',
    },
    pageNumber: {
        position: 'absolute',
        bottom: 15,
        right: 20,
        fontSize: 6,
    },
    noData: {
        padding: 8,
        textAlign: 'center',
        color: '#64748b',
        fontSize: 7,
        fontStyle: 'italic',
    },
});

// Interfaz para servicios
interface Service {
    id: string | number;
    orderNumber: string;
    status: string;
    receivedDate: Date;
    presupuestoAmount?: string | number;
    paymentStatus: string;
    client?: {
        name?: string;
        phone?: string;
    };
    appliances: Array<{
        falla?: string;
        solucion?: string;
        clientAppliance?: {
            name: string;
            brand: {
                name: string;
            };
        };
    }>;
}

interface TechnicianServices {
    id: string | number;
    name: string;
    totalServices: number;
    statusStats: { 
        pending: number; 
        assigned: number; 
        inProgress: number; 
        completed: number; 
        delivered: number; 
        cancelled: number;
        preorder: number;
        aprobado: number;
        noAprobado: number;
        pendienteAvisar: number;
        facturado: number;
        entregaGenerada: number;
        garantiaAplicada: number;
        reparando: number;
    };
    services: Service[];
}

interface ServicesPDFProps {
    technicians: TechnicianServices[];
}

const truncateText = (text: string | undefined, maxLength: number): string => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

// Orden de prioridad para status
const statusOrderMap = { 
    'PENDING': 1, 
    'ASSIGNED': 2, 
    'IN_PROGRESS': 3, 
    'REPARANDO': 4,
    'COMPLETED': 5, 
    'APROBADO': 6,
    'NO_APROBADO': 7,
    'PENDIENTE_AVISAR': 8,
    'FACTURADO': 9,
    'ENTREGA_GENERADA': 10,
    'DELIVERED': 11,
    'GARANTIA_APLICADA': 12,
    'PREORDER': 13,
    'CANCELLED': 14
};

// Función para obtener el estilo de color del status
const getStatusStyle = (status: string) => {
    switch (status) {
        case 'PENDING': return styles.statusPending;
        case 'ASSIGNED': return styles.statusAssigned;
        case 'IN_PROGRESS': return styles.statusInProgress;
        case 'COMPLETED': return styles.statusCompleted;
        case 'DELIVERED': return styles.statusDelivered;
        case 'CANCELLED': return styles.statusCancelled;
        case 'PREORDER': return styles.statusPreorder;
        case 'APROBADO': return styles.statusAprobado;
        case 'NO_APROBADO': return styles.statusNoAprobado;
        case 'PENDIENTE_AVISAR': return styles.statusPendienteAvisar;
        case 'FACTURADO': return styles.statusFacturado;
        case 'ENTREGA_GENERADA': return styles.statusEntregaGenerada;
        case 'GARANTIA_APLICADA': return styles.statusGarantiaAplicada;
        case 'REPARANDO': return styles.statusReparando;
        default: return {};
    }
};

// Función para formatear el status para mostrar
const formatStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        'PENDING': 'Pendiente',
        'ASSIGNED': 'Asignado',
        'IN_PROGRESS': 'En Progreso',
        'COMPLETED': 'Completado',
        'DELIVERED': 'Entregado',
        'CANCELLED': 'Cancelado',
        'PREORDER': 'Pre-orden',
        'APROBADO': 'Aprobado',
        'NO_APROBADO': 'No Aprobado',
        'PENDIENTE_AVISAR': 'Pend. Avisar',
        'FACTURADO': 'Facturado',
        'ENTREGA_GENERADA': 'Entrega Gen.',
        'GARANTIA_APLICADA': 'Garantía',
        'REPARANDO': 'Reparando'
    };
    return statusMap[status] || status;
};

export function ServicesPDF({ technicians }: ServicesPDFProps) {
    const totalServices = technicians.reduce((sum, tech) => sum + tech.totalServices, 0);
    const totalPending = technicians.reduce((sum, tech) => sum + tech.statusStats.pending, 0);
    const totalInProgress = technicians.reduce((sum, tech) => sum + tech.statusStats.inProgress + tech.statusStats.reparando, 0);
    const totalCompleted = technicians.reduce((sum, tech) => sum + tech.statusStats.completed + tech.statusStats.aprobado, 0);
    const totalDelivered = technicians.reduce((sum, tech) => sum + tech.statusStats.delivered + tech.statusStats.entregaGenerada, 0);

    const sortedTechnicians = [...technicians].sort((a, b) => b.totalServices - a.totalServices);

    // Límites ajustados por el menor tamaño
    const MAX_CLIENT_LENGTH = 16;
    const MAX_APPLIANCE_LENGTH = 18;
    const MAX_FALLA_LENGTH = 25;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Reporte de Servicios por Técnico</Text>
                    <Text style={styles.subtitle}>Generado el {format(new Date(), 'dd/MM/yyyy HH:mm')} hrs</Text>
                </View>

                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>Resumen General</Text>
                    <View style={styles.totalStats}>
                        <View style={styles.statBox}><Text style={styles.statNumber}>{totalServices}</Text><Text style={styles.statLabel}>Total</Text></View>
                        <View style={styles.statBox}><Text style={[styles.statNumber, styles.statusPending]}>{totalPending}</Text><Text style={styles.statLabel}>Pendientes</Text></View>
                        <View style={styles.statBox}><Text style={[styles.statNumber, styles.statusInProgress]}>{totalInProgress}</Text><Text style={styles.statLabel}>En Progreso</Text></View>
                        <View style={styles.statBox}><Text style={[styles.statNumber, styles.statusCompleted]}>{totalCompleted}</Text><Text style={styles.statLabel}>Completados</Text></View>
                        <View style={styles.statBox}><Text style={[styles.statNumber, styles.statusDelivered]}>{totalDelivered}</Text><Text style={styles.statLabel}>Entregados</Text></View>
                    </View>
                    <View style={styles.technicianDistribution}>
                        <Text style={styles.distributionTitle}>Distribución por Técnico</Text>
                        <View style={styles.multiColumnContainer}>
                            {sortedTechnicians.map(tech => (
                                <View key={tech.id} style={styles.multiColumnItem}>
                                    <Text style={styles.technicianName}>{truncateText(tech.name, 25)}</Text>
                                    <Text style={styles.technicianCount}>{tech.totalServices}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {sortedTechnicians.map(technician => {
                    const sortedServices = [...technician.services].sort((a, b) => {
                        const statusA = statusOrderMap[a.status as keyof typeof statusOrderMap] || 99;
                        const statusB = statusOrderMap[b.status as keyof typeof statusOrderMap] || 99;
                        return statusA - statusB;
                    });

                    return (
                        <View key={technician.id} style={styles.technicianSection} wrap={false}>
                            <Text style={styles.technicianHeader}>{technician.name}</Text>
                            <View style={styles.technicianStatsLine}>
                                <Text style={styles.statText}><Text style={styles.bold}>Total:</Text> {technician.totalServices}</Text>
                                <Text style={styles.statText}><Text style={styles.bold}>Pendientes:</Text> <Text style={styles.statusPending}>{technician.statusStats.pending}</Text></Text>
                                <Text style={styles.statText}><Text style={styles.bold}>Asignados:</Text> <Text style={styles.statusAssigned}>{technician.statusStats.assigned}</Text></Text>
                                <Text style={styles.statText}><Text style={styles.bold}>En Progreso:</Text> <Text style={styles.statusInProgress}>{technician.statusStats.inProgress + technician.statusStats.reparando}</Text></Text>
                                <Text style={styles.statText}><Text style={styles.bold}>Completados:</Text> <Text style={styles.statusCompleted}>{technician.statusStats.completed + technician.statusStats.aprobado}</Text></Text>
                                <Text style={styles.statText}><Text style={styles.bold}>Facturados:</Text> <Text style={styles.statusFacturado}>{technician.statusStats.facturado}</Text></Text>
                                <Text style={styles.statText}><Text style={styles.bold}>Entregados:</Text> <Text style={styles.statusDelivered}>{technician.statusStats.delivered + technician.statusStats.entregaGenerada}</Text></Text>
                                <Text style={styles.statText}><Text style={styles.bold}>Cancelados:</Text> <Text style={styles.statusCancelled}>{technician.statusStats.cancelled}</Text></Text>
                            </View>

                            {sortedServices.length > 0 ? (
                                <View style={styles.serviceTableContainer}>
                                    <View style={styles.serviceTable}>
                                        <View style={styles.serviceTableHeader} fixed>
                                            <Text style={[styles.serviceTableCellHeader, styles.colNumero]}>Número</Text>
                                            <Text style={[styles.serviceTableCellHeader, styles.colCliente]}>Cliente</Text>
                                            <Text style={[styles.serviceTableCellHeader, styles.colElectrodomestico]}>Electrodoméstico</Text>
                                            <Text style={[styles.serviceTableCellHeader, styles.colTelefono]}>Teléfono</Text>
                                            <Text style={[styles.serviceTableCellHeader, styles.colStatus]}>Status</Text>
                                            <Text style={[styles.serviceTableCellHeader, styles.colFalla]}>Falla</Text>
                                            <Text style={[styles.serviceTableCellHeader, styles.colMonto]}>Monto</Text>
                                            <Text style={[styles.serviceTableCellHeader, styles.colFecha]}>Fecha</Text>
                                        </View>

                                        {sortedServices.map((service) => {
                                            const statusStyle = getStatusStyle(service.status);
                                            const fallaText = service.appliances[0]?.falla || 'No especificada';
                                            const formattedAmount = typeof service.presupuestoAmount === 'number' 
                                                ? `$${service.presupuestoAmount.toFixed(2)}` 
                                                : service.presupuestoAmount;

                                            return (
                                                <View key={service.id} style={styles.serviceTableRow}>
                                                    <Text style={[styles.serviceTableCell, styles.colNumero]}>{service.orderNumber}</Text>
                                                    <Text style={[styles.serviceTableCell, styles.colCliente]}>{truncateText(service.client?.name, MAX_CLIENT_LENGTH)}</Text>
                                                    <Text style={[styles.serviceTableCell, styles.colElectrodomestico]}>
                                                        {truncateText(service.appliances[0]?.clientAppliance
                                                            ? `${service.appliances[0].clientAppliance.name} - ${service.appliances[0].clientAppliance.brand.name}`
                                                            : undefined, MAX_APPLIANCE_LENGTH)}
                                                    </Text>
                                                    <Text style={[styles.serviceTableCell, styles.colTelefono]}>{service.client?.phone || 'N/A'}</Text>
                                                    <Text style={[styles.serviceTableCell, styles.colStatus, statusStyle]}>{formatStatus(service.status)}</Text>
                                                    <Text style={[styles.serviceTableCell, styles.colFalla]}>{truncateText(fallaText, MAX_FALLA_LENGTH)}</Text>
                                                    <Text style={[styles.serviceTableCell, styles.colMonto]}>{formattedAmount}</Text>
                                                    <Text style={[styles.serviceTableCell, styles.colFecha]}>
                                                        {service.receivedDate ? format(new Date(service.receivedDate), 'dd/MM') : 'N/A'}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            ) : (
                                <Text style={styles.noData}>No hay servicios asignados.</Text>
                            )}
                        </View>
                    );
                })}

                <Text style={styles.footer} fixed>Reporte generado automáticamente.</Text>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Pág ${pageNumber}/${totalPages}`} fixed />
            </Page>
        </Document>
    );
}
