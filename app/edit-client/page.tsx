// Updated EditClient.tsx
"use client";
import { useEffect, useState, ChangeEvent } from "react";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useRouter } from "next/navigation";

interface FormData {
  projectName: string;
  siteAddress: string;
  latitude: string;
  longitude: string;
  projectEPC: string;
  projectDetails: string;
  tariffType: string;
  nmd: string;
  selectedLoadProfile: string; // ✅ NEW
  usage: {
    jan: string; feb: string; mar: string; apr: string;
    may: string; jun: string; jul: string; aug: string;
    sep: string; oct: string; nov: string; dec: string;
  };
  fractions: {
    offpeak: string;
    standard: string;
    peak: string;
  };
}

type EskomTariff = string;
type LoadProfile = string;

export default function EditClient() {
  const router = useRouter();

  const [eskomTariffs, setEskomTariffs] = useState<EskomTariff[]>([]);
  const [loadProfiles, setLoadProfiles] = useState<LoadProfile[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    projectName: "",
    siteAddress: "",
    latitude: "",
    longitude: "",
    projectEPC: "",
    projectDetails: "",
    tariffType: "",
    nmd: "",
    selectedLoadProfile: "",
    usage: { jan: "", feb: "", mar: "", apr: "", may: "", jun: "", jul: "", aug: "", sep: "", oct: "", nov: "", dec: "" },
    fractions: { offpeak: "", standard: "", peak: "" },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const tariffsSnap = await getDocs(collection(db, "eskom_tariffs"));
        const profilesSnap = await getDocs(collection(db, "load_profiles"));
        const clientsSnap = await getDocs(collection(db, "clients"));

        setEskomTariffs(tariffsSnap.docs.map((doc) => doc.id));
        setLoadProfiles(profilesSnap.docs.map((doc) => doc.id));
        setClients(clientsSnap.docs.map((doc) => doc.id));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function loadClientData() {
      if (!selectedClient) return;
      try {
        const clientSnap = await getDoc(doc(db, "clients", selectedClient));
        if (clientSnap.exists()) {
          const data = clientSnap.data();
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
            selectedLoadProfile: details.selectedLoadProfile || "",
            usage: { ...details.usage },
            fractions: { ...details.fractions },
          });
        }
      } catch (error) {
        console.error("Error loading client data:", error);
      }
    }
    loadClientData();
  }, [selectedClient]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name in formData.usage) {
      setFormData((prev) => ({ ...prev, usage: { ...prev.usage, [name]: value } }));
    } else if (name in formData.fractions) {
      setFormData((prev) => ({ ...prev, fractions: { ...prev.fractions, [name]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!selectedClient) return alert("Select a client first");
    try {
      await setDoc(doc(db, "clients", selectedClient), {
        projectDetails: {
          siteAddress: formData.siteAddress,
          latitude: formData.latitude,
          longitude: formData.longitude,
          projectEPC: formData.projectEPC,
          projectDetails: formData.projectDetails,
          tariffType: formData.tariffType,
          nmd: formData.nmd,
          selectedLoadProfile: formData.selectedLoadProfile,
          usage: { ...formData.usage },
          fractions: { ...formData.fractions },
          updatedAt: new Date(),
        },
      }, { merge: true });
      alert("Client updated successfully!");
    } catch (error) {
      console.error("Error updating client:", error);
      alert("Error updating client");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <h1 className="text-6xl font-black mb-16">Edit Client Details</h1>

      <div className="w-full max-w-4xl mb-8">
        <label className="block">
          <span className="text-gray-700">Select Client</span>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md"
          >
            <option value="">Select a client</option>
            {clients.map((clientId) => (
              <option key={clientId} value={clientId}>{clientId}</option>
            ))}
          </select>
        </label>
      </div>

      {selectedClient && (
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 gap-6 max-w-4xl w-full">
          <label className="block">
            <span className="text-gray-700">Project Name</span>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              disabled
              className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Site Address</span>
            <input
              type="text"
              name="siteAddress"
              value={formData.siteAddress}
              onChange={handleChange}
              className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md"
            />
          </label>

          <div className="grid grid-cols-2 gap-6">
            <label className="block">
              <span className="text-gray-700">Latitude</span>
              <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md" />
            </label>
            <label className="block">
              <span className="text-gray-700">Longitude</span>
              <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md" />
            </label>
          </div>

          <label className="block">
            <span className="text-gray-700">Project EPC</span>
            <input type="text" name="projectEPC" value={formData.projectEPC} onChange={handleChange} className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md" />
          </label>

          <label className="block">
            <span className="text-gray-700">Project Details</span>
            <textarea name="projectDetails" value={formData.projectDetails} onChange={handleChange} className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md" />
          </label>

          <label className="block">
            <span className="text-gray-700">Tariff Type</span>
            <select name="tariffType" value={formData.tariffType} onChange={handleChange} className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md">
              <option value="">Select a tariff</option>
              {eskomTariffs.map((tariffId) => (
                <option key={tariffId} value={tariffId}>{tariffId}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-gray-700">Load Profile</span>
            <select name="selectedLoadProfile" value={formData.selectedLoadProfile} onChange={handleChange} className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md">
              <option value="">Select a profile</option>
              {loadProfiles.map((profileId) => (
                <option key={profileId} value={profileId}>{profileId}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-gray-700">NMD (kVA)</span>
            <input type="number" name="nmd" value={formData.nmd} onChange={handleChange} className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md" />
          </label>

          <h3 className="text-2xl font-bold mt-6">Monthly Usage (kWh)</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(formData.usage).map(([month, val]) => (
              <label key={month} className="block">
                <span className="capitalize text-gray-700">{month}</span>
                <input type="number" name={month} value={val} onChange={handleChange} className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md" />
              </label>
            ))}
          </div>

          <h3 className="text-2xl font-bold mt-6">TOU Distribution (%)</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(formData.fractions).map(([key, val]) => (
              <label key={key} className="block">
                <span className="capitalize text-gray-700">{key}</span>
                <input type="number" name={key} value={val} onChange={handleChange} className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md" />
              </label>
            ))}
          </div>

          <div className="flex flex-row gap-4 mt-6">
            <button onClick={handleSave} className="bg-[#4c7380] hover:bg-[#FFA07A] text-white font-bold py-2 px-4 rounded-full">Save</button>
            <button onClick={() => router.push("/")} className="bg-[#4c7380] hover:bg-[#FFA07A] text-white font-bold py-2 px-4 rounded-full">Return Home</button>
          </div>
        </form>
      )}
    </div>
  );
}
