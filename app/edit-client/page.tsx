"use client";
import { useEffect, useState, ChangeEvent } from "react";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase"; // Adjust path if needed
import { useRouter } from "next/navigation";

// Type for the client form data
interface FormData {
  projectName: string;
  siteAddress: string;
  latitude: string;
  longitude: string;
  projectEPC: string;
  projectDetails: string;
  tariffType: string;
  nmd: string;
  usage: {
    jan: string;
    feb: string;
    mar: string;
    apr: string;
    may: string;
    jun: string;
    jul: string;
    aug: string;
    sep: string;
    oct: string;
    nov: string;
    dec: string;
  };
  fractions: {
    offpeak: string;
    standard: string;
    peak: string;
  };
}

// If your "eskom_tariffs" collection only has document IDs (no extra fields)
type EskomTariff = string;

export default function EditClient() {
  const router = useRouter();

  // State for eskom tariffs (for the tariff type dropdown)
  const [eskomTariffs, setEskomTariffs] = useState<EskomTariff[]>([]);
  // State for all clients in the "clients" collection
  const [clients, setClients] = useState<string[]>([]);
  // State for the currently selected client (document ID)
  const [selectedClient, setSelectedClient] = useState<string>("");

  // Form state that holds client details.
  const [formData, setFormData] = useState<FormData>({
    projectName: "",
    siteAddress: "",
    latitude: "",
    longitude: "",
    projectEPC: "",
    projectDetails: "",
    tariffType: "",
    nmd: "",
    usage: {
      jan: "",
      feb: "",
      mar: "",
      apr: "",
      may: "",
      jun: "",
      jul: "",
      aug: "",
      sep: "",
      oct: "",
      nov: "",
      dec: "",
    },
    fractions: {
      offpeak: "",
      standard: "",
      peak: "",
    },
  });

  // 1. Fetch document IDs from "eskom_tariffs" collection.
  useEffect(() => {
    async function fetchEskomTariffs() {
      try {
        const querySnapshot = await getDocs(collection(db, "eskom_tariffs"));
        const docIds = querySnapshot.docs.map((doc) => doc.id);
        setEskomTariffs(docIds);
      } catch (error) {
        console.error("Error fetching eskom_tariffs:", error);
      }
    }
    fetchEskomTariffs();
  }, []);

  // 2. Fetch all clients from the "clients" collection.
  useEffect(() => {
    async function fetchClients() {
      try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        // Assuming the doc id is the projectName
        const clientIds = querySnapshot.docs.map((doc) => doc.id);
        setClients(clientIds);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    }
    fetchClients();
  }, []);

  // 3. When a client is selected, load its data into the form.
  useEffect(() => {
    async function loadClientData() {
      if (!selectedClient) return;
      try {
        const clientRef = doc(db, "clients", selectedClient);
        const clientSnap = await getDoc(clientRef);
        if (clientSnap.exists()) {
          const data = clientSnap.data();
          // Expecting the stored data structure to have a "projectDetails" field
          const details = data.projectDetails;
          setFormData({
            projectName: selectedClient,
            siteAddress: details.siteAddress || "",
            latitude: details.latitude || "",
            longitude: details.longitude || "",
            projectEPC: details.projectEPC || "",
            projectDetails: details.projectDetails || "",
            tariffType: details.tariffType || "",
            nmd: details.nmd || "",
            usage: { ...details.usage },
            fractions: { ...details.fractions },
          });
        } else {
          console.error("No such client document!");
        }
      } catch (error) {
        console.error("Error loading client data:", error);
      }
    }
    loadClientData();
  }, [selectedClient]);

  // 4. Handle form input changes.
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // For usage fields (e.g., "jan", "feb"), check if name exists in formData.usage
    if (name in formData.usage) {
      setFormData((prev) => ({
        ...prev,
        usage: {
          ...prev.usage,
          [name]: value,
        },
      }));
    } else if (name in formData.fractions) {
      setFormData((prev) => ({
        ...prev,
        fractions: {
          ...prev.fractions,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 5. Handle Save: update the existing client document.
  const handleSave = async () => {
    try {
      if (!selectedClient) {
        alert("Please select a client to edit.");
        return;
      }
      await setDoc(
        doc(db, "clients", selectedClient),
        {
          projectDetails: {
            siteAddress: formData.siteAddress,
            latitude: formData.latitude,
            longitude: formData.longitude,
            projectEPC: formData.projectEPC,
            projectDetails: formData.projectDetails,
            tariffType: formData.tariffType,
            nmd: formData.nmd,
            usage: { ...formData.usage },
            fractions: { ...formData.fractions },
            updatedAt: new Date(),
          },
        },
        { merge: true }
      );
      alert("Client updated successfully!");
    } catch (error) {
      console.error("Error updating client:", error);
      alert("Error updating client. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <h1 className="text-6xl font-black mb-16">Edit Client Details</h1>

      {/* Client Selection */}
      <div className="w-full max-w-4xl mb-8">
        <label className="block">
          <span className="text-gray-700">Select Client (Project Name)</span>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          >
            <option value="">Select a client</option>
            {clients.map((clientId) => (
              <option key={clientId} value={clientId}>
                {clientId}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Form: Only display once a client is selected */}
      {selectedClient && (
        <form
          className="grid grid-cols-1 gap-6 max-w-4xl w-full"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="block">
            <span className="text-gray-700">Project Name</span>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              disabled
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Site Address</span>
            <input
              type="text"
              name="siteAddress"
              value={formData.siteAddress}
              onChange={handleChange}
              className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>

          <div className="grid grid-cols-2 gap-6">
            <label className="block">
              <span className="text-gray-700">Latitude</span>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>

            <label className="block">
              <span className="text-gray-700">Longitude</span>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-gray-700">Project EPC</span>
            <input
              type="text"
              name="projectEPC"
              value={formData.projectEPC}
              onChange={handleChange}
              className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Project Details</span>
            <textarea
              name="projectDetails"
              value={formData.projectDetails}
              onChange={handleChange}
              className="mt-1 py-2 px-4 block w-full rounded-md bg-gray-100 border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>

          <h3 className="text-2xl font-bold mt-6">Tariff Details</h3>
          <div className="grid grid-cols-2 gap-6">
            <label className="block">
              <span className="text-gray-700">Tariff Type</span>
              <select
                name="tariffType"
                value={formData.tariffType}
                onChange={handleChange}
                className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="">Select a Tariff</option>
                {eskomTariffs.map((tariffId) => (
                  <option key={tariffId} value={tariffId}>
                    {tariffId}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-gray-700">NMD (kVA)</span>
              <input
                type="number"
                name="nmd"
                value={formData.nmd}
                onChange={handleChange}
                className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
          </div>

          <h3 className="text-2xl font-bold mt-6">
            Energy Consumption (Last 12 Months)
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {Object.entries(formData.usage).map(([monthKey, monthValue]) => (
              <label key={monthKey} className="block">
                <span className="text-gray-700 capitalize">
                  {monthKey} (kWh)
                </span>
                <input
                  type="number"
                  name={monthKey}
                  value={monthValue}
                  onChange={handleChange}
                  className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </label>
            ))}
          </div>

          <h3 className="text-2xl font-bold mt-6">
            Time-Of-Use Distribution (Estimate)
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {Object.entries(formData.fractions).map(
              ([periodKey, periodValue]) => (
                <label key={periodKey} className="block">
                  <span className="text-gray-700 capitalize">
                    {periodKey} (%)
                  </span>
                  <input
                    type="number"
                    name={periodKey}
                    value={periodValue}
                    onChange={handleChange}
                    className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </label>
              )
            )}
          </div>

          {/* Save & Return Buttons */}
          <div className="flex flex-row gap-6">
            <button
              onClick={handleSave}
              className="mt-8 bg-[#4c7380] cursor-pointer hover:bg-[#FFA07A] text-white font-bold py-2 px-4 rounded-full"
            >
              Save
            </button>
            <button
              onClick={() => router.push("/")}
              className="mt-8 bg-[#4c7380] cursor-pointer hover:bg-[#FFA07A] text-white font-bold py-2 px-4 rounded-full"
            >
              Return Home
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
