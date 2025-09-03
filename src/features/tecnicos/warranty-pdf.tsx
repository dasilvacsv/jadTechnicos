// En /components/garantias/warranty-pdf.tsx

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
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 1,
    },
    statLabel: {
        fontSize: 6.5,
        color: '#64748b',
        textTransform: 'uppercase',
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
        fontSize: 7.5,
        marginBottom: 5,
        paddingBottom: 3,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f1f1f1',
    },
    statText: {
        marginRight: 8,
    },
    bold: {
        fontWeight: 'bold',
    },
    priorityCountBaja: { color: '#059669', fontWeight: 'bold' },
    priorityCountMedia: { color: '#d97706', fontWeight: 'bold' },
    priorityCountAlta: { color: '#dc2626', fontWeight: 'bold' },
    // --- TABLA DE ÓRDENES CON NUEVAS COLUMNAS ---
    orderTableContainer: {
        marginTop: 6,
    },
    orderTable: {
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 0.5,
        borderColor: '#e0e0e0',
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    orderTableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderBottomColor: '#e0e0e0',
        borderBottomWidth: 0.5,
        fontWeight: 'bold',
        height: 18,
    },
    orderTableRow: {
        flexDirection: 'row',
        borderBottomColor: '#e0e0e0',
        borderBottomWidth: 0.5,
        minHeight: 16,
    },
    orderTableCellHeader: {
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
    orderTableCell: {
        fontSize: 6,
        padding: 2.5,
        borderStyle: 'solid',
        borderWidth: 0.5,
        borderColor: '#e0e0e0',
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    // ANCHOS DE COLUMNAS ACTUALIZADOS
    colNumero: { width: '8%', textAlign: 'left' },
    colCliente: { width: '15%', textAlign: 'left' },
    colElectrodomestico: { width: '16%', textAlign: 'left' },
    colTelefono: { width: '10%', textAlign: 'left' },
    colFalla: { width: '20%', textAlign: 'left' }, // Nueva columna
    colPrioridad: { width: '9%', textAlign: 'center' },
    colObservaciones: { width: '22%' }, // Nuevo espacio para escribir

    // Estilos de celda de prioridad
    priorityCellBaja: { color: '#059669', fontWeight: 'bold' },
    priorityCellMedia: { color: '#d97706', fontWeight: 'bold' },
    priorityCellAlta: { color: '#dc2626', fontWeight: 'bold' },

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

// Interfaz actualizada para incluir la falla
interface WarrantyOrder {
    id: string | number;
    orderNumber: string;
    razonGarantia?: string; // Falla reportada por el cliente
    garantiaPrioridad?: 'ALTA' | 'MEDIA' | 'BAJA';
    client?: {
        name?: string;
        phone?: string;
        address?: string;
    };
    appliances: Array<{
        falla?: string; // Falla diagnosticada por el técnico
        clientAppliance?: {
            name: string;
            brand: {
                name: string;
            };
        };
    }>;
}

interface Technician {
    id: string | number;
    name: string;
    warrantyCount: number;
    priorityStats: {
        baja: number;
        media: number;
        alta: number;
    };
    warrantyOrders: WarrantyOrder[];
}

interface WarrantyPDFProps {
    technicians: Technician[];
}

const truncateText = (text: string | undefined, maxLength: number): string => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

const priorityOrderMap = { ALTA: 1, MEDIA: 2, BAJA: 3 };

export function WarrantyPDF({ technicians }: WarrantyPDFProps) {
    const totalWarranties = technicians.reduce((sum, tech) => sum + tech.warrantyCount, 0);
    const totalBaja = technicians.reduce((sum, tech) => sum + tech.priorityStats.baja, 0);
    const totalMedia = technicians.reduce((sum, tech) => sum + tech.priorityStats.media, 0);
    const totalAlta = technicians.reduce((sum, tech) => sum + tech.priorityStats.alta, 0);

    const sortedTechnicians = [...technicians].sort((a, b) => b.warrantyCount - a.warrantyCount);

    // Límites ajustados por el menor tamaño
    const MAX_CLIENT_LENGTH = 16;
    const MAX_APPLIANCE_LENGTH = 18;
    const MAX_FALLA_LENGTH = 25;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Reporte de Garantías</Text>
                    <Text style={styles.subtitle}>Generado el {format(new Date(), 'dd/MM/yyyy HH:mm')} hrs</Text>
                </View>

                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>Resumen General</Text>
                    <View style={styles.totalStats}>
                        <View style={styles.statBox}><Text style={styles.statNumber}>{totalWarranties}</Text><Text style={styles.statLabel}>Total</Text></View>
                        <View style={styles.statBox}><Text style={[styles.statNumber, { color: '#059669' }]}>{totalBaja}</Text><Text style={styles.statLabel}>Baja</Text></View>
                        <View style={styles.statBox}><Text style={[styles.statNumber, { color: '#d97706' }]}>{totalMedia}</Text><Text style={styles.statLabel}>Media</Text></View>
                        <View style={styles.statBox}><Text style={[styles.statNumber, { color: '#dc2626' }]}>{totalAlta}</Text><Text style={styles.statLabel}>Alta</Text></View>
                    </View>
                    <View style={styles.technicianDistribution}>
                        <Text style={styles.distributionTitle}>Distribución por Técnico</Text>
                        <View style={styles.multiColumnContainer}>
                            {sortedTechnicians.map(tech => (
                                <View key={tech.id} style={styles.multiColumnItem}>
                                    <Text style={styles.technicianName}>{truncateText(tech.name, 25)}</Text>
                                    <Text style={styles.technicianCount}>{tech.warrantyCount}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {sortedTechnicians.map(technician => {
                    const sortedOrders = [...technician.warrantyOrders].sort((a, b) => {
                        const priorityA = a.garantiaPrioridad ? priorityOrderMap[a.garantiaPrioridad] : 99;
                        const priorityB = b.garantiaPrioridad ? priorityOrderMap[b.garantiaPrioridad] : 99;
                        return priorityA - priorityB;
                    });

                    return (
                        <View key={technician.id} style={styles.technicianSection} wrap={false}>
                            <Text style={styles.technicianHeader}>{technician.name}</Text>
                            <View style={styles.technicianStatsLine}>
                                <Text style={styles.statText}><Text style={styles.bold}>Total:</Text> {technician.warrantyCount}</Text>
                                <Text style={styles.statText}><Text style={styles.bold}>Baja:</Text> <Text style={styles.priorityCountBaja}>{technician.priorityStats.baja}</Text></Text>
                                <Text style={styles.statText}><Text style={styles.bold}>Media:</Text> <Text style={styles.priorityCountMedia}>{technician.priorityStats.media}</Text></Text>
                                <Text style={styles.statText}><Text style={styles.bold}>Alta:</Text> <Text style={styles.priorityCountAlta}>{technician.priorityStats.alta}</Text></Text>
                            </View>

                            {sortedOrders.length > 0 ? (
                                <View style={styles.orderTableContainer}>
                                    <View style={styles.orderTable}>
                                        <View style={styles.orderTableHeader} fixed>
                                            <Text style={[styles.orderTableCellHeader, styles.colNumero]}>Número</Text>
                                            <Text style={[styles.orderTableCellHeader, styles.colCliente]}>Cliente</Text>
                                            <Text style={[styles.orderTableCellHeader, styles.colElectrodomestico]}>Electrodoméstico</Text>
                                            <Text style={[styles.orderTableCellHeader, styles.colTelefono]}>Teléfono</Text>
                                            <Text style={[styles.orderTableCellHeader, styles.colFalla]}>Falla Reportada</Text>
                                            <Text style={[styles.orderTableCellHeader, styles.colPrioridad]}>Prioridad</Text>
                                            <Text style={[styles.orderTableCellHeader, styles.colObservaciones]}>Observaciones</Text>
                                        </View>

                                        {sortedOrders.map((order) => {
                                            const priorityStyle =
                                                order.garantiaPrioridad === 'ALTA' ? styles.priorityCellAlta :
                                                order.garantiaPrioridad === 'MEDIA' ? styles.priorityCellMedia :
                                                order.garantiaPrioridad === 'BAJA' ? styles.priorityCellBaja : {};

                                            const fallaText = order.razonGarantia || order.appliances[0]?.falla || 'No especificada';

                                            return (
                                                <View key={order.id} style={styles.orderTableRow}>
                                                    <Text style={[styles.orderTableCell, styles.colNumero]}>{order.orderNumber}</Text>
                                                    <Text style={[styles.orderTableCell, styles.colCliente]}>{truncateText(order.client?.name, MAX_CLIENT_LENGTH)}</Text>
                                                    <Text style={[styles.orderTableCell, styles.colElectrodomestico]}>
                                                        {truncateText(order.appliances[0]?.clientAppliance
                                                            ? `${order.appliances[0].clientAppliance.name} - ${order.appliances[0].clientAppliance.brand.name}`
                                                            : undefined, MAX_APPLIANCE_LENGTH)}
                                                    </Text>
                                                    <Text style={[styles.orderTableCell, styles.colTelefono]}>{order.client?.phone || 'N/A'}</Text>
                                                    <Text style={[styles.orderTableCell, styles.colFalla]}>{truncateText(fallaText, MAX_FALLA_LENGTH)}</Text>
                                                    <Text style={[styles.orderTableCell, styles.colPrioridad, priorityStyle]}>{order.garantiaPrioridad || 'N/A'}</Text>
                                                    <Text style={[styles.orderTableCell, styles.colObservaciones]}></Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            ) : (
                                <Text style={styles.noData}>No hay órdenes asignadas.</Text>
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