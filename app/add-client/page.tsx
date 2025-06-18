"use client";
import { useEffect, useState, ChangeEvent } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase"; // Adjust path if needed
import { useRouter }  from "next/navigation";

// Type for the data we store in the form
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
  fractions : {
    offpeak: string,
    standard: string,
    peak: string,
}
}

// If your "eskom_tariffs" collection only has document IDs (no extra fields)
type EskomTariff = string;

export default function Home() {

  const router = useRouter();

  const [eskomTariffs, setEskomTariffs] = useState<EskomTariff[]>([]);
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
    fractions : {
        offpeak: "",
        standard: "",
        peak: "",
    }
  });

  type LoadProfile = string;

  const [loadProfiles, setLoadProfiles] = useState<LoadProfile[]>([]);
  const [selectedLoadProfile, setSelectedLoadProfile] = useState<string>("");


  // 1. Fetch document IDs from "eskom_tariffs" collection
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

  useEffect(() => {
  async function fetchData() {
    try {
      const tariffsSnap = await getDocs(collection(db, "eskom_tariffs"));
      const tariffIds = tariffsSnap.docs.map((doc) => doc.id);
      setEskomTariffs(tariffIds);

      const profileSnap = await getDocs(collection(db, "load_profiles"));
      const profileIds = profileSnap.docs.map((doc) => doc.id);
      setLoadProfiles(profileIds);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  fetchData();
  }, []);


  // 2. Handle form input changes
  // We use the 'name' attribute on inputs to update the correct field
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // For usage fields (e.g., "jan", "feb"), we check if the name is in formData.usage
    if (name in formData.usage) {
      setFormData((prev) => ({
        ...prev,
        usage: {
          ...prev.usage,
          [name]: value,
        },
      }));
    }
    else if (name in formData.fractions) {
        setFormData((prev) => ({
          ...prev,
          fractions: {
            ...prev.fractions,
            [name]: value,
          },
        }));

    } else {
      // Otherwise, it's a top-level field
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 3. Handle Save: create a new doc under "clients" where doc ID = projectName
  const handleSave = async () => {
    try {
      if (!formData.projectName) {
        alert("Project Name is required to save the document.");
        return;
      }

      await setDoc(doc(db, "clients", formData.projectName), {
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
          selectedLoadProfile,
          createdAt: new Date(),
        },
      });


      alert("Client saved successfully!");
      // Optionally reset the form or navigate away
    } catch (error) {
      console.error("Error saving client:", error);
      alert("Error saving client. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <h1 className="text-6xl font-black mb-16">New Client Details</h1>

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
            className="mt-1 px-4 py-2 bg-gray-100 block w-full 
                       rounded-md border-gray-300 shadow-sm 
                       focus:border-indigo-300 focus:ring focus:ring-indigo-200 
                       focus:ring-opacity-50"
            required
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Site Address</span>
          <input
            type="text"
            name="siteAddress"
            value={formData.siteAddress}
            onChange={handleChange}
            className="mt-1 px-4 py-2 bg-gray-100 block w-full 
                       rounded-md border-gray-300 shadow-sm 
                       focus:border-indigo-300 focus:ring focus:ring-indigo-200 
                       focus:ring-opacity-50"
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
              className="mt-1 px-4 py-2 bg-gray-100 block w-full 
                         rounded-md border-gray-300 shadow-sm 
                         focus:border-indigo-300 focus:ring focus:ring-indigo-200 
                         focus:ring-opacity-50"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Longitude</span>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="mt-1 px-4 py-2 bg-gray-100 block w-full 
                         rounded-md border-gray-300 shadow-sm 
                         focus:border-indigo-300 focus:ring focus:ring-indigo-200 
                         focus:ring-opacity-50"
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
            className="mt-1 px-4 py-2 bg-gray-100 block w-full 
                       rounded-md border-gray-300 shadow-sm 
                       focus:border-indigo-300 focus:ring focus:ring-indigo-200 
                       focus:ring-opacity-50"
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Project Details</span>
          <textarea
            name="projectDetails"
            value={formData.projectDetails}
            onChange={handleChange}
            className="mt-1 py-2 px-4 block w-full rounded-md 
                       bg-gray-100 border-gray-300 shadow-sm 
                       focus:border-indigo-300 focus:ring focus:ring-indigo-200 
                       focus:ring-opacity-50"
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
              className="mt-1 px-4 py-2 bg-gray-100 block w-full 
                         rounded-md border-gray-300 shadow-sm 
                         focus:border-indigo-300 focus:ring focus:ring-indigo-200 
                         focus:ring-opacity-50"
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
              className="mt-1 px-4 py-2 bg-gray-100 block w-full 
                         rounded-md border-gray-300 shadow-sm 
                         focus:border-indigo-300 focus:ring focus:ring-indigo-200 
                         focus:ring-opacity-50"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-gray-700">Select Load Profile</span>
          <select
            value={selectedLoadProfile}
            onChange={(e) => setSelectedLoadProfile(e.target.value)}
            className="mt-1 px-4 py-2 bg-gray-100 block w-full 
                      rounded-md border-gray-300 shadow-sm 
                      focus:border-indigo-300 focus:ring focus:ring-indigo-200 
                      focus:ring-opacity-50"
          >
            <option value="">Select a profile</option>
            {loadProfiles.map((profileId) => (
              <option key={profileId} value={profileId}>
                {profileId}
              </option>
            ))}
          </select>
        </label>
        
        <h3 className="text-2xl font-bold mt-6">Energy Consumption (Last 12 Months)</h3>
        <div className="grid grid-cols-3 gap-6">
          {Object.entries(formData.usage).map(([monthKey, monthValue]) => (
            <label key={monthKey} className="block">
              <span className="text-gray-700 capitalize">{monthKey} (kWh)</span>
              <input
                type="number"
                name={monthKey}
                value={monthValue}
                onChange={handleChange}
                className="mt-1 px-4 py-2 bg-gray-100 block w-full 
                           rounded-md border-gray-300 shadow-sm 
                           focus:border-indigo-300 focus:ring focus:ring-indigo-200 
                           focus:ring-opacity-50"
              />
            </label>
          ))}
        </div>

        <h3 className="text-2xl font-bold mt-6">Time-Of-Use Distribution (Estimate)</h3>
        <div className="grid grid-cols-3 gap-6">
          {Object.entries(formData.fractions).map(([periodKey, periodValue]) => (
            <label key={periodKey} className="block">
              <span className="text-gray-700 capitalize">{periodKey} (%)</span>
              <input
                type="number"
                name={periodKey}
                value={periodValue}
                onChange={handleChange}
                className="mt-1 px-4 py-2 bg-gray-100 block w-full 
                           rounded-md border-gray-300 shadow-sm 
                           focus:border-indigo-300 focus:ring focus:ring-indigo-200 
                           focus:ring-opacity-50"
              />
            </label>
          ))}
        </div>

      </form>

      {/* Save & Return Home Buttons */}
      <div className="flex flex-row gap-6">
        <button
          onClick={handleSave}
          className="mt-8 bg-[#4c7380] cursor-pointer hover:bg-[#FFA07A] 
                     text-white font-bold py-2 px-4 rounded-full"
        >
          Save
        </button>
        <button
          onClick={() => {
            router.push("/");
          }}
          className="mt-8 bg-[#4c7380] cursor-pointer hover:bg-[#FFA07A] 
                     text-white font-bold py-2 px-4 rounded-full"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}
