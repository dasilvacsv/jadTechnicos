import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ServiceOrder } from '../orden/service-order';
import { OrderTableCell } from '../orden/order-table-cell';

// Registrar fuentes (opcional, pero recomendado para negritas)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: `https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf`, fontWeight: 'normal' },
    { src: `https://fonts.gstatic.com/s/oswald/v13/bH7276GfdCjMjApa_dkG6w.ttf`, fontWeight: 'bold' },
  ],
});


const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 8, color: '#333' },
  header: { marginBottom: 15, textAlign: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 9, color: '#6c6c6c' },
  
  statusSection: { marginBottom: 16, pageBreakBefore: 'auto' },
  statusHeader: { fontSize: 12, fontWeight: 'bold', color: '#1d4ed8', paddingBottom: 4, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#dbeafe' },
  
  technicianAccordion: { marginLeft: 10, marginBottom: 10, borderLeftWidth: 2, borderLeftColor: '#e0e0e0', paddingLeft: 8 },
  technicianHeader: { fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  
  table: { width: '100%', borderStyle: 'solid', borderWidth: 0.5, borderColor: '#ccc' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f2f2f2', borderBottomWidth: 1, borderBottomColor: '#ccc' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#e0e0e0' },
  tableCellHeader: { padding: 4, fontWeight: 'bold' },
  tableCell: { padding: 4 },

  colNumero: { width: '12%' },
  colCliente: { width: '30%' },
  colEquipo: { width: '30%' },
  colFecha: { width: '16%', textAlign: 'center' },
  colMonto: { width: '12%', textAlign: 'right' },
  
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, fontSize: 8, textAlign: 'center', color: '#aaa' },
  pageNumber: { position: 'absolute', bottom: 20, right: 30, fontSize: 8 },
});

// Tipos para los datos agrupados que recibirá el PDF
interface ServiceData extends ServiceOrder {}

interface TechnicianGroup {
  name: string;
  services: ServiceData[];
}

interface StatusGroup {
  status: string;
  technicians: TechnicianGroup[];
}

interface ReportesPDFProps {
  data: StatusGroup[];
  totalServices: number;
}

// Interfaz para la nueva estructura de datos agrupados
interface AggregatedStatusGroup {
    name: string;
    technicians: TechnicianGroup[];
}

export function ReportesPDF({ data, totalServices }: ReportesPDFProps) {
    // Lógica para agregar los estados en grupos lógicos
    const aggregatedData = [
        { name: "Pendientes", technicians: [] as TechnicianGroup[] },
        { name: "Presupuestados", technicians: [] as TechnicianGroup[] },
        { name: "Reparando", technicians: [] as TechnicianGroup[] },
        { name: "Finalizados", technicians: [] as TechnicianGroup[] }, // Nombre actualizado
        { name: "Cancelados", technicians: [] as TechnicianGroup[] },
    ];

    data.forEach(statusGroup => {
        const { status, technicians } = statusGroup;
        
        // Determinar a qué grupo agregado pertenece el estado
        let targetGroup: AggregatedStatusGroup | undefined;
        if (["PENDING", "ASSIGNED", "PENDIENTE_AVISAR"].includes(status)) {
            targetGroup = aggregatedData[0]; // Pendientes
        } else if (["PRESUPUESTADO", "FACTURADO"].includes(status)) {
            targetGroup = aggregatedData[1]; // Presupuestos
        } else if (status === "REPARANDO") {
            targetGroup = aggregatedData[2]; // Reparando
        } else if (["COMPLETED", "DELIVERED", "APROBADO", "GARANTIA_APLICADA"].includes(status)) {
            targetGroup = aggregatedData[3]; // Finalizados
        } else if (["CANCELLED", "NO_APROBADO"].includes(status)) {
            targetGroup = aggregatedData[4]; // Cancelados
        }

        if (targetGroup) {
            // Unir los técnicos del estado actual con los del grupo agregado
            technicians.forEach(tech => {
                const existingTech = targetGroup.technicians.find(t => t.name === tech.name);
                if (existingTech) {
                    existingTech.services.push(...tech.services);
                } else {
                    targetGroup.technicians.push({ ...tech });
                }
            });
        }
    });

    // Limpiar grupos vacíos y ordenar por nombre del técnico
    const finalData = aggregatedData.filter(group => group.technicians.length > 0);
    finalData.forEach(group => {
        group.technicians.sort((a, b) => a.name.localeCompare(b.name));
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header} fixed>
                    <Text style={styles.title}>Reporte de Servicios por Estado y Técnico</Text>
                    <Text style={styles.subtitle}>Generado el {format(new Date(), 'dd/MM/yyyy HH:mm')} hrs | {totalServices} servicios filtrados</Text>
                </View>

                {finalData.map((statusGroup, index) => (
                    <View key={statusGroup.name} style={styles.statusSection} break={index > 0}>
                        <Text style={styles.statusHeader}>{statusGroup.name} ({statusGroup.technicians.reduce((sum, tech) => sum + tech.services.length, 0)} servicios)</Text>
                        
                        {statusGroup.technicians.map(techGroup => (
                            <View key={techGroup.name} style={styles.technicianAccordion}>
                                <Text style={styles.technicianHeader}>{techGroup.name} ({techGroup.services.length} servicio(s))</Text>
                                
                                <View style={styles.table}>
                                    <View style={styles.tableHeader} fixed>
                                        <Text style={[styles.tableCellHeader, styles.colNumero]}>Número</Text>
                                        <Text style={[styles.tableCellHeader, styles.colCliente]}>Cliente</Text>
                                        <Text style={[styles.tableCellHeader, styles.colEquipo]}>Equipo</Text>
                                        <Text style={[styles.tableCellHeader, styles.colFecha]}>F. Captación</Text>
                                        <Text style={[styles.tableCellHeader, styles.colMonto]}>Monto</Text>
                                    </View>
                                    {techGroup.services.map(service => {
                                        const applianceText = service.appliances.length > 0
                                            ? `${service.appliances[0].clientAppliance.applianceType.name} - ${service.appliances[0].clientAppliance.brand.name}`
                                            : 'N/A';
                                        
                                        return (
                                            <View key={service.id} style={styles.tableRow} wrap={false}>
                                                <Text style={[styles.tableCell, styles.colNumero]}>#{service.orderNumber}</Text>
                                                <Text style={[styles.tableCell, styles.colCliente]}>{service.client.name}</Text>
                                                <Text style={[styles.tableCell, styles.colEquipo]}>{applianceText}</Text>
                                                <Text style={[styles.tableCell, styles.colFecha]}>{service.fechaCaptacion ? format(new Date(service.fechaCaptacion), 'dd/MM/yy') : '-'}</Text>
                                                <Text style={[styles.tableCell, styles.colMonto]}>{Number(service.totalAmount).toFixed(2)}</Text>
                                            </View>
                                        )
                                    })}
                                </View>
                            </View>
                        ))}
                    </View>
                ))}

                <Text style={styles.footer} fixed>Reporte generado automáticamente.</Text>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Pág ${pageNumber}/${totalPages}`} fixed />
            </Page>
        </Document>
    );
}
