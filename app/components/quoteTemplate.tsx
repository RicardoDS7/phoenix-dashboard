import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

interface LineItem {
  description: string;
  qty: string;
  unit: string;
  margin: string;
  total: string;
  category: "shared" | "solar" | "battery";
}

interface QuoteDetails {
  selectedCustomer: string;
  lineItems: LineItem[];
  overallTotal: number;
  profit: number;
  marginPercentage: number;
  solarCapacity: string;
  panelQTY: string;
  batteryCapacity: string;
}

interface QuoteData {
  quoteDetails: QuoteDetails;
  createdAt: Date;
}

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica" },
  section: { marginBottom: 10 },
  row: { flexDirection: "row", borderBottom: 1, borderBottomColor: '#ccc' },
  cell: { padding: 5 },
  description: { flex: 3 },
  qty: { flex: 0.8 },
  unitPrice: { flex: 1.2 },
  total: { flex: 1.2 },
  bold: { fontWeight: "bold" },
  totalText: { textAlign: "right", marginTop: 10, fontSize: 12 },
});

interface Props {
  data: QuoteData;
}

const formatNumber = (value: number | string) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(num)
    ? "0.00"
    : num.toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};

const QuoteTemplate = ({ data }: Props) => {
  const { quoteDetails } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>Quote Summary</Text>
        <View style={styles.section}>
          <Text>Client: {quoteDetails.selectedCustomer}</Text>
          <Text>Solar Capacity: {quoteDetails.solarCapacity} kWp</Text>
          <Text>Battery Capacity: {quoteDetails.batteryCapacity} kWh</Text>
          <Text>Panel QTY: {quoteDetails.panelQTY}</Text>
        </View>

        {/* Header */}
        <View style={[styles.row, styles.bold]}>
          <Text style={[styles.cell, styles.description]}>Description</Text>
          <Text style={[styles.cell, styles.qty]}>Qty</Text>
          <Text style={[styles.cell, styles.unitPrice]}>Unit Price</Text>
          <Text style={[styles.cell, styles.total]}>Total</Text>
        </View>

        {/* Line items */}
        {quoteDetails.lineItems.map((item, i) => (
          <View key={i} style={styles.row}>
            <Text style={[styles.cell, styles.description]}>{item.description}</Text>
            <Text style={[styles.cell, styles.qty]}>{item.qty}</Text>
            <Text style={[styles.cell, styles.unitPrice]}>$ {formatNumber(item.unit)}</Text>
            <Text style={[styles.cell, styles.total]}>$ {formatNumber(item.total)}</Text>
          </View>
        ))}

        {/* Totals */}
        <Text style={styles.totalText}>
          Overall Total: $ {formatNumber(quoteDetails.overallTotal)} excl. VAT
        </Text>

      </Page>
    </Document>
  );
};

export default QuoteTemplate;
