// components/QuotePDFExport.tsx
'use client';

import dynamic from 'next/dynamic';
import QuoteTemplate from './quoteTemplate';

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

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
);

interface Props {
  data: QuoteData;
  selectedQuote: string;
}

export default function QuotePDFExport({ data, selectedQuote }: Props) {
  return (
    <PDFDownloadLink
      document={<QuoteTemplate data={data} />}
      fileName={`Quote-${selectedQuote}.pdf`}
      className="print-hidden bg-blue-600 text-white py-2 px-4 rounded-full mt-4"
    >
      {({ loading }: any) => (loading ? 'Generating PDF...' : 'Export as PDF')}
    </PDFDownloadLink>
  );
}
