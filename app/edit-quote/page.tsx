"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import React from "react";

type Client = { id: string; name: string };

type LineItem = {
  description: string;
  qty: string;
  unit: string;
  margin: string;
  total: string;
  category: "shared" | "solar" | "battery";
};

type SystemData = { solarCapacity: string; panelQTY: string; batteryCapacity: string };

type QuoteDetails = {
  selectedCustomer: string;
  lineItems: LineItem[];
  overallTotal: number;
  profit?: number;
  marginPercentage?: number;
  solarCapacity?: string;
  panelQTY?: string;
  batteryCapacity?: string;
};

type QuoteData = { quoteDetails: QuoteDetails; createdAt: any };

export default function EditQuote() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [quotes, setQuotes] = useState<{ id: string }[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<string>("");
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", qty: "", unit: "", margin: "0", total: "0", category: "shared" }
  ]);
  const [systemData, setSystemData] = useState<SystemData>({ solarCapacity: "", panelQTY: "", batteryCapacity: "" });

  useEffect(() => {
    (async () => {
      const qs = await getDocs(collection(db, "clients"));
      setClients(qs.docs.map(d => ({ id: d.id, name: (d.data() as any).name || d.id })));
    })();
  }, []);

  useEffect(() => {
    if (!selectedClient) return;
    (async () => {
      const qs = await getDocs(collection(db, "clients", selectedClient, "quotes"));
      setQuotes(qs.docs.map(d => ({ id: d.id })));
      setSelectedQuote("");
      setQuoteData(null);
    })();
  }, [selectedClient]);

  useEffect(() => {
    if (!selectedClient || !selectedQuote) return;
    (async () => {
      const ref = doc(db, "clients", selectedClient, "quotes", selectedQuote);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as QuoteData;
        setQuoteData(data);
        setLineItems(
          data.quoteDetails.lineItems.map(item => ({
            ...item,
            margin: item.margin || "0",
            total: item.total || "0",
            category: item.category || "shared"
          }))
        );
        setSystemData({
          solarCapacity: data.quoteDetails.solarCapacity || "",
          panelQTY: data.quoteDetails.panelQTY || "",
          batteryCapacity: data.quoteDetails.batteryCapacity || ""
        });
      }
    })();
  }, [selectedClient, selectedQuote]);

  const handleLineItemChange = (i: number, field: keyof LineItem, value: string) => {
    const items = [...lineItems];
    (items[i] as any)[field] = value;
    const q = Number(items[i].qty), u = Number(items[i].unit), m = Number(items[i].margin) / 100;
    items[i].total = !isNaN(q) && !isNaN(u) && !isNaN(m) ? (q * u * (1 + m)).toString() : "0";
    setLineItems(items);
  };

  const addLineItem = () =>
    setLineItems(prev => [...prev, { description: "", qty: "", unit: "", margin: "0", total: "0", category: "shared" }]);

  const removeLineItem = (i: number) => {
    if (lineItems.length > 1) setLineItems(prev => prev.filter((_, idx) => idx !== i));
    else alert("At least one line item is required.");
  };

  const rawTotal = lineItems.reduce((sum, it) => sum + Number(it.qty) * Number(it.unit), 0);
  const overallTotal = lineItems.reduce((sum, it) => sum + Number(it.total), 0);
  const profit = overallTotal - rawTotal;
  const marginPercentage = rawTotal > 0 ? (profit / rawTotal) * 100 : 0;

  const handleSystemChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSystemData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !selectedQuote) return alert("Select client and quote");
    await setDoc(
      doc(db, "clients", selectedClient, "quotes", selectedQuote),
      {
        quoteDetails: { selectedCustomer: selectedClient, lineItems, overallTotal, profit, marginPercentage, ...systemData },
        updatedAt: new Date()
      },
      { merge: true }
    );
    alert("Quote updated successfully!");
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 print-hidden">Edit Quote</h1>
      <div className="w-full max-w-4xl space-y-6 mb-8">
        <label className="block">
          <span className="text-gray-700">Select Client</span>
          <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="mt-1 w-full px-4 py-2 bg-gray-100 rounded-md">
            <option value="">Select a client</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        {selectedClient && (
          <label className="block">
            <span className="text-gray-700">Select Quote</span>
            <select value={selectedQuote} onChange={e => setSelectedQuote(e.target.value)} className="mt-1 w-full px-4 py-2 bg-gray-100 rounded-md">
              <option value="">Select a quote</option>
              {quotes.map(q => <option key={q.id} value={q.id}>{q.id}</option>)}
            </select>
          </label>
        )}
      </div>

      {quoteData && (
        <>
          <div id="printable" className="w-full max-w-6xl space-y-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Solar Capacity (kWp)', name: 'solarCapacity' },
                  { label: 'Panel QTY', name: 'panelQTY' },
                  { label: 'Battery Capacity (kWh)', name: 'batteryCapacity' }
                ].map(({ label, name }) => (
                  <label key={name} className="block">
                    <span className="text-gray-700">{label}</span>
                    <input type="text" name={name} value={(systemData as any)[name]} onChange={handleSystemChange}
                      className="mt-1 w-full px-4 py-2 bg-gray-100 rounded-md border-gray-300" />
                  </label>
                ))}
              </div>

              <div className="space-y-4 mt-6">
                <h2 className="text-2xl font-bold">Line Items</h2>
                {lineItems.map((item, i) => (
                  <div key={i} className="flex gap-2 border p-4 rounded-lg items-center">
                    <p className="font-bold">{i + 1}</p>
                    <label className="block w-full">
                      <span className="text-gray-700">Description</span>
                      <input type="text" value={item.description} onChange={e => handleLineItemChange(i, 'description', e.target.value)}
                        className="mt-1 w-full px-4 py-2 bg-gray-100 rounded-md border-gray-300" required />
                    </label>
                    <label className="block w-1/3 print-hidden">
                      <span className="text-gray-700">Allocation</span>
                      <select value={item.category} onChange={e => handleLineItemChange(i, 'category', e.target.value)}
                        className="mt-1 w-full px-4 py-2 bg-gray-100 rounded-md border-gray-300">
                        <option value="shared">Shared</option>
                        <option value="solar">Solar</option>
                        <option value="battery">Battery</option>
                      </select>
                    </label>
                    <label className="block w-1/3">
                      <span className="text-gray-700">Quantity</span>
                      <input type="number" value={item.qty} onChange={e => handleLineItemChange(i, 'qty', e.target.value)}
                        className="mt-1 w-full px-4 py-2 bg-gray-100 rounded-md border-gray-300" required />
                    </label>
                    <label className="block w-1/2 print-hidden">
                      <span className="text-gray-700">Unit Price</span>
                      <input type="number" value={item.unit} onChange={e => handleLineItemChange(i, 'unit', e.target.value)}
                        className="mt-1 w-full px-4 py-2 bg-gray-100 rounded-md border-gray-300" required />
                    </label>
                    <label className="block w-1/4 print-hidden">
                      <span className="text-gray-700">Markup %</span>
                      <input type="number" value={item.margin} onChange={e => handleLineItemChange(i, 'margin', e.target.value)}
                        className="mt-1 w-full px-4 py-2 bg-gray-100 rounded-md border-gray-300" required />
                    </label>
                    <label className="block w-1/2">
                      <span className="text-gray-700">Total</span>
                      <input readOnly value={Number(item.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        className="mt-1 w-full px-4 py-2 bg-gray-100 rounded-md border-gray-300" />
                    </label>
                    <button type="button" onClick={() => removeLineItem(i)} className="mt-2 text-red-600 print-hidden">
                      <MdDelete size={25} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addLineItem}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-full print-hidden">
                  Add Line Item
                </button>
              </div>

              <div className="text-right font-bold text-xl">Overall Total: R {overallTotal.toFixed(2)}</div>
              <div className="text-right font-bold text-md">Total Profit: R {profit.toFixed(2)}</div>
              <div className="text-right font-bold text-md">Profit Margin: {marginPercentage.toFixed(2)}%</div>

              <button type="submit"
                className="mt-8 bg-[#4c7380] hover:bg-[#FFA07A] text-white font-bold py-2 px-4 rounded-full print-hidden">
                Save Changes
              </button>
            </form>
          </div>
        </>
      )}

      <button onClick={() => router.push("/")}
        className="mt-8 bg-[#4c7380] hover:bg-[#FFA07A] text-white font-bold py-2 px-4 rounded-full print-hidden">
        Return Home
      </button>


    </div>
  );
}
