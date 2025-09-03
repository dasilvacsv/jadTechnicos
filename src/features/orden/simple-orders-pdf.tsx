import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ServiceOrder } from './service-order';
import { OrderTableCell } from './order-table-cell';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 8, color: '#333' },
  header: { marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', textAlign: 'center' },
  title: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { fontSize: 10, color: '#6c6c6c', marginTop: 4 },
  table: { width: '100%', borderStyle: 'solid', borderWidth: 0.5, borderColor: '#ccc' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f2f2f2', borderBottomWidth: 1, borderBottomColor: '#ccc', fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#ccc' },
  tableCellHeader: { padding: 5, borderRightWidth: 0.5, borderRightColor: '#ccc', fontWeight: 'bold', textAlign: 'center' },
  tableCell: { padding: 5, borderRightWidth: 0.5, borderRightColor: '#ccc' },
  // Anchos de columnas
  colNumero: { width: '10%' },
  colCliente: { width: '20%' },
  colTecnico: { width: '15%' },
  colFecha: { width: '12%', textAlign: 'center' },
  colStatus: { width: '13%', textAlign: 'center' },
  colFalla: { width: '30%' },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, fontSize: 8, textAlign: 'center', color: '#aaa' },
  pageNumber: { position: 'absolute', bottom: 20, right: 30, fontSize: 8 },
});

// ✅ FIX: Añadimos la función para truncar texto y evitar errores de layout
const truncateText = (text: string | undefined | null, maxLength: number): string => {
  if (!text) return 'N/A';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export function SimpleOrdersPDF({ orders }: { orders: ServiceOrder[] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.header}>
          <Text style={styles.title}>Reporte de Órdenes de Servicio</Text>
          <Text style={styles.subtitle}>Generado el {format(new Date(), 'dd/MM/yyyy HH:mm')} hrs | {orders.length} órdenes filtradas</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.tableCellHeader, styles.colNumero]}>Número</Text>
            <Text style={[styles.tableCellHeader, styles.colCliente]}>Cliente</Text>
            <Text style={[styles.tableCellHeader, styles.colTecnico]}>Técnico</Text>
            <Text style={[styles.tableCellHeader, styles.colFecha]}>Recepción</Text>
            <Text style={[styles.tableCellHeader, styles.colStatus]}>Estado</Text>
            <Text style={[styles.tableCellHeader, styles.colFalla]}>Falla Reportada</Text>
          </View>
          {(orders || []).map(order => {
             const activeTechnicians = (order.technicianAssignments || []).filter(a => a.isActive).map(a => a.technician.name).join(', ');
             const firstAppliance = (order.appliances && order.appliances.length > 0) ? order.appliances[0] : null;
             const fallaText = firstAppliance?.falla || (typeof order.conceptoOrden === 'string' ? order.conceptoOrden : null) || 'No especificada';

            return (
              <View key={order.id} style={styles.tableRow} wrap={false}>
                <Text style={[styles.tableCell, styles.colNumero]}>#{order.orderNumber}</Text>
                {/* ✅ FIX: Truncamos los campos de texto largos */}
                <Text style={[styles.tableCell, styles.colCliente]}>{truncateText(order.client.name, 30)}</Text>
                <Text style={[styles.tableCell, styles.colTecnico]}>{truncateText(activeTechnicians, 25) || 'Sin asignar'}</Text>
                <Text style={[styles.tableCell, styles.colFecha]}>{format(new Date(order.receivedDate), 'dd/MM/yy')}</Text>
                <Text style={[styles.tableCell, styles.colStatus]}>{OrderTableCell.getStatusText(order.status)}</Text>
                <Text style={[styles.tableCell, styles.colFalla]}>{truncateText(fallaText, 60)}</Text>
              </View>
            )
          })}
        </View>
        <Text style={styles.footer} fixed>Reporte generado automáticamente.</Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Pág ${pageNumber}/${totalPages}`} fixed />
      </Page>
    </Document>
  );
}
