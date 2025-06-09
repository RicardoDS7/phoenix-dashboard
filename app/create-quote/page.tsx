"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";

// Types

interface Customer {
  id: string;
  name: string;
}

interface LineItem {
  description: string;
  qty: string;
  unit: string;
  margin: string;
  total: string;
  category: "shared" | "solar" | "battery";
}

interface SystemData {
  solarCapacity: string;
  inverterCapacity: string;
  batteryCapacity: string;
}

export default function AddQuote() {
  const router = useRouter();

  // Customer state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [quoteName, setQuoteName] = useState<string>("");

  // Line items state
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      description: "",
      qty: "",
      unit: "",
      margin: "0",
      total: "",
      category: "shared",
    },
  ]);

  // Fetch customers once
  useEffect(() => {
    async function fetchCustomers() {
      try {
        const snap = await getDocs(collection(db, "clients"));
        const list: Customer[] = snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name || d.id,
        }));
        setCustomers(list);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    }
    fetchCustomers();
  }, []);

  // Typed handler for line item fields
  const handleLineItemChange = <K extends keyof LineItem>(
    index: number,
    field: K,
    value: LineItem[K]
  ) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
    } as LineItem;

    // Recalculate total when numeric fields change
    if (field === "qty" || field === "unit" || field === "margin") {
      const qty = Number(updated[index].qty);
      const unit = Number(updated[index].unit);
      const margin = Number(updated[index].margin) / 100;
      updated[index].total = (qty * unit * (1 + margin)).toString();
    }

    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "", qty: "", unit: "", margin: "0", total: "", category: "shared" },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) {
      alert("At least one line item is required.");
      return;
    }
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Totals
  const rawTotal = lineItems.reduce((sum, itm) => sum + Number(itm.qty) * Number(itm.unit), 0);
  const overallTotal = lineItems.reduce(
    (sum, itm) => sum + Number(itm.qty) * Number(itm.unit) * (1 + Number(itm.margin) / 100),
    0
  );
  const profit = overallTotal - rawTotal;
  const marginPercentage = rawTotal > 0 ? (profit / rawTotal) * 100 : 0;

  // System data state
  const [systemData, setSystemData] = useState<SystemData>({
    solarCapacity: "",
    inverterCapacity: "",
    batteryCapacity: "",
  });

  const handleSystemChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSystemData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit quote
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !quoteName) {
      alert("Please select a customer and provide a quote name.");
      return;
    }
    try {
      await setDoc(
        doc(db, "clients", selectedCustomer, "quotes", quoteName),
        {
          quoteDetails: {
            selectedCustomer,
            quoteName,
            lineItems,
            overallTotal,
            profit,
            marginPercentage,
            batteryCapacity: systemData.batteryCapacity,
            solarCapacity: systemData.solarCapacity,
            panelQTY: systemData.inverterCapacity,
          },
          createdAt: new Date(),
        }
      );
      alert("Quote saved successfully!");
      router.push("/");
    } catch (err) {
      console.error("Error saving quote:", err);
      alert("Error saving quote. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8">Add Quote</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-6xl space-y-6">
        {/* Customer & Quote Name */}
        <div className="grid grid-cols-1 gap-4">
          <label className="block">
            <span className="text-gray-700">Select Customer</span>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-gray-100 rounded-md border-gray-300"
              required
            >
              <option value="">Select a customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-gray-700">Quote Name</span>
            <input
              type="text"
              value={quoteName}
              onChange={(e) => setQuoteName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-gray-100 rounded-md border-gray-300"
              required
            />
          </label>
        </div>

        {/* System Data */}
        <div className="grid grid-cols-3 gap-6">
          <label className="block">
            <span className="text-gray-700">Solar Capacity (kWp)</span>
            <input
              type="text"
              name="solarCapacity"
              value={systemData.solarCapacity}
              onChange={handleSystemChange}
              className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md border-gray-300"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Inverter Capacity (kW)</span>
            <input
              type="text"
              name="panelQTY"
              value={systemData.inverterCapacity}
              onChange={handleSystemChange}
              className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md border-gray-300"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Battery Capacity (kWh)</span>
            <input
              type="text"
              name="batteryCapacity"
              value={systemData.batteryCapacity}
              onChange={handleSystemChange}
              className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md border-gray-300"
            />
          </label>
        </div>

        {/* Line Items */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Items</h2>
          {lineItems.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-row gap-2 border rounded-lg border-gray-300 p-4 items-center"
            >
              <p className="font-bold">{idx + 1}</p>
              <label className="block w-full">
                <span className="text-gray-700">Description</span>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    handleLineItemChange(idx, "description", e.target.value)
                  }
                  className="mt-1 block w-[360px] px-4 py-2 bg-gray-100 rounded-md border-gray-300"
                  required
                />
              </label>
              <label className="block w-1/3">
                <span className="text-gray-700">Allocation</span>
                <select
                  value={item.category}
                  onChange={(e) =>
                    handleLineItemChange(idx, "category", e.target.value as LineItem["category"] )
                  }
                  className="mt-1 block w-[180px] px-4 py-2 bg-gray-100 rounded-md border-gray-300"
                >
                  <option value="shared">Shared</option>
                  <option value="solar">Solar</option>
                  <option value="battery">Battery</option>
                </select>
              </label>
              <label className="block w-1/3">
                <span className="text-gray-700">Quantity</span>
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) =>
                    handleLineItemChange(idx, "qty", e.target.value)
                  }
                  className="mt-1 block w-full px-4 py-2 bg-gray-100 rounded-md border-gray-300"
                  required
                />
              </label>
              <label className="block w-1/2">
                <span className="text-gray-700">Unit Price</span>
                <input
                  type="number"
                  value={item.unit}
                  onChange={(e) =>
                    handleLineItemChange(idx, "unit", e.target.value)
                  }
                  className="mt-1 block w-full px-4 py-2 bg-gray-100 rounded-md border-gray-300"
                  required
                />
              </label>
              <label className="block w-1/4">
                <span className="text-gray-700">Markup %</span>
                <input
                  type="number"
                  defaultValue={10}
                  value={item.margin}
                  onChange={(e) =>
                    handleLineItemChange(idx, "margin", e.target.value)
                  }
                  className="mt-1 block w-full px-4 py-2 bg-gray-100 rounded-md border-gray-300"
                  required
                />
              </label>
              <label className="block w-1/2">
                <span className="text-gray-700">Total</span>
                <input
                  readOnly
                  value={Number(item.total).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  className="mt-1 block w-full px-4 py-2 bg-gray-100 rounded-md border-gray-300"
                />
              </label>
              <button
                type="button"
                onClick={() => removeLineItem(idx)}
                className="mt-2 cursor-pointer font-bold py-1 px-2"
              >
                <MdDelete size={25} color="red" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLineItem}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
          >
            Add Line Item
          </button>
        </div>

        {/* Summary */}
        <div className="text-right font-bold text-xl mt-4">
          Overall Total: R {overallTotal.toFixed(2)}
        </div>
        <div className="text-right font-bold text-md">
          Total Profit: R {profit.toFixed(2)}
        </div>
        <div className="text-right font-bold text-md">
          Profit Margin: {marginPercentage.toFixed(2)}%
        </div>

        <button
          type="submit"
          className="mt-8 bg-[#4c7380] hover:bg-[#FFA07A] text-white font-bold py-2 px-4 rounded-full"
        >
          Save Quote
        </button>
      </form>

      <button
        onClick={() => router.push("/")}
        className="mt-8 bg-[#4c7380] hover:bg-[#FFA07A] text-white font-bold py-2 px-4 rounded-full"
      >
        Return Home
      </button>
    </div>
  );
}