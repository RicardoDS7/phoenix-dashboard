// pages/index.tsx
"use client";
import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { collection, doc, getDocs, getDoc } from 'firebase/firestore'
import { QuoteData } from '../types/types';

interface Fractions {
  offpeak: string;
  peak: string;
  standard: string;
}

interface Usage {
  apr: string;
  aug: string;
  dec: string;
  feb: string;
  jan: string;
  jul: string;
  jun: string;
  mar: string;
  may: string;
  nov: string;
  oct: string;
  sep: string;
}

interface ProjectData {
  projectDetails: {
    batteryCapacity: string;
    createdAt: string;
    fractions: Fractions;
    latitude: string;
    longitude: string;
    nmd: string;
    panelQTY: string;
    projectDetails: string;
    projectEPC: string;
    siteAddress: string;
    solarCapacity: string;
    tariffType: string;
    usage: Usage;
  }
}

const Home: NextPage = () => {
  // State declarations
  const [projects, setProjects] = useState<{ id: string; data: ProjectData }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [quotes, setQuotes] = useState<{ id: string; data: QuoteData }[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('');
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [loadingQuotes, setLoadingQuotes] = useState<boolean>(false);

  // Fetch all projects from the "clients" collection
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'clients'));
        const projectsList: { id: string; data: ProjectData }[] = [];
        querySnapshot.forEach((docSnap) => {
          projectsList.push({ id: docSnap.id, data: docSnap.data() as ProjectData });
        });
        setProjects(projectsList);
        setLoadingProjects(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // When a project is selected, fetch its details and its quotes
  useEffect(() => {
    if (selectedProjectId) {
      const fetchProjectDataAndQuotes = async () => {
        try {
          // Fetch project details
          const projectRef = doc(db, 'clients', selectedProjectId);
          const projectSnap = await getDoc(projectRef);
          if (projectSnap.exists()) {
            setProjectData(projectSnap.data() as ProjectData);
            console.log(projectSnap.data());
          } else {
            setProjectData(null);
          }

          // Fetch quotes for the selected project
          setLoadingQuotes(true);
          const quotesQuerySnapshot = await getDocs(collection(projectRef, 'quotes'));
          const quotesList: { id: string; data: QuoteData }[] = [];
          quotesQuerySnapshot.forEach((quoteDoc) => {
            quotesList.push({ id: quoteDoc.id, data: quoteDoc.data() as QuoteData });
          });
          setQuotes(quotesList);
          setLoadingQuotes(false);
        } catch (error) {
          console.error("Error fetching project data and quotes:", error);
        }
      };

      fetchProjectDataAndQuotes();
      // Reset any previously selected quote
      setSelectedQuoteId('');
      setQuoteData(null);
    }
  }, [selectedProjectId]);

  // When a quote is selected, fetch its data
  useEffect(() => {
    if (selectedProjectId && selectedQuoteId) {
      const fetchQuoteData = async () => {
        try {
          // Using "clients" collection name here
          const quoteRef = doc(db, 'clients', selectedProjectId, 'quotes', selectedQuoteId);
          const quoteSnap = await getDoc(quoteRef);
          if (quoteSnap.exists()) {
            setQuoteData(quoteSnap.data() as QuoteData);
          } else {
            setQuoteData(null);
          }
        } catch (error) {
          console.error("Error fetching quote data:", error);
        }
      };

      fetchQuoteData();
    }
  }, [selectedProjectId, selectedQuoteId]);

  // Function to handle printing the page
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Project Summary</h1>
      {/* Print Button */}
      <div className="mb-4 no-print">
        <button
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Print PDF
        </button>
      </div>

      {/* Project Dropdown */}
      {loadingProjects ? (
        <p>Loading projects...</p>
      ) : (
        <div className="mb-4 no-print">
          <label className="block text-gray-700 mb-2">Select Project:</label>
          <select
            className="p-2 border rounded w-full"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">-- Select Project --</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.id}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quote Dropdown (dependent on the selected project) */}
      {selectedProjectId && (
        <div className="mb-4 no-print">
          {loadingQuotes ? (
            <p>Loading quotes...</p>
          ) : (
            <>
              <label className="block text-gray-700 mb-2">Select Quote:</label>
              <select
                className="p-2 border rounded w-full"
                value={selectedQuoteId}
                onChange={(e) => setSelectedQuoteId(e.target.value)}
              >
                <option value="">-- Select Quote --</option>
                {quotes.map((quote) => (
                  <option key={quote.id} value={quote.id}>
                    {quote.id}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}

      {/* Display Project Details */}
      {projectData && (
        <div className="bg-white shadow rounded p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">{selectedProjectId}</h2>
          <p>
            <strong>Project Description:</strong> {projectData.projectDetails.projectDetails}
          </p>
          <p>
            <strong>Project EPC:</strong> {projectData.projectDetails.projectEPC}
          </p>
          <p>
            <strong>Site Address:</strong> {projectData.projectDetails.siteAddress}
          </p>
          <p>
            <strong>Latitude:</strong> {projectData.projectDetails.latitude}
          </p>
          <p>
            <strong>Longitude:</strong> {projectData.projectDetails.longitude}
          </p>
          <p>
            <strong>Panel QTY:</strong> {quoteData?.quoteDetails.panelQTY}
          </p>
          <p>
            <strong>Solar Capacity:</strong> {quoteData?.quoteDetails.solarCapacity} kWp
          </p>
          <p>
            <strong>Battery Capacity:</strong> {quoteData?.quoteDetails.batteryCapacity} kWh
          </p>
          <p>
            <strong>Tariff Type:</strong> {projectData.projectDetails.tariffType}
          </p>
          <p>
            <strong>NMD:</strong> {projectData.projectDetails.nmd} kVA
          </p>
          <div className="mt-4">
            <h3 className="text-xl font-semibold">Consumption Distribution</h3>
            <ul>
              <li>
                <strong>Offpeak:</strong> {projectData.projectDetails.fractions?.offpeak ?? 'N/A'} %
              </li>
              <li>
                <strong>Peak:</strong> {projectData.projectDetails.fractions?.peak ?? 'N/A'} %
              </li>
              <li>
                <strong>Standard:</strong> {projectData.projectDetails.fractions?.standard ?? 'N/A'} %
              </li>
            </ul>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-semibold">Usage (kWh)</h3>
            <table className="w-[100%] border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 bg-gray-200">Month</th>
                  <th className="border border-gray-300 px-4 py-2 bg-gray-200">Usage (kWh)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">January</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {Number(projectData.projectDetails.usage.jan).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">February</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {Number(projectData.projectDetails.usage.feb).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">March</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {Number(projectData.projectDetails.usage.mar).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">April</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {Number(projectData.projectDetails.usage.apr).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">May</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {Number(projectData.projectDetails.usage.may).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">June</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {Number(projectData.projectDetails.usage.jun).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">July</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {Number(projectData.projectDetails.usage.jul).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">August</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {Number(projectData.projectDetails.usage.aug).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">September</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {Number(projectData.projectDetails.usage.sep).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">October</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {Number(projectData.projectDetails.usage.oct).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">November</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {Number(projectData.projectDetails.usage.nov).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">December</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {Number(projectData.projectDetails.usage.dec).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Print Page Break Before Quote Section */}
      {/* <div className="page-break"></div> */}

      {/* Display Quote Details */}
      <h1 className="text-2xl font-bold mb-4">Quote Data</h1>
      {quoteData ? (
        <>
          <div className="mb-6 bg-white p-4 rounded shadow">
            <p>
              <strong>Quote Name:</strong> {selectedQuoteId}
            </p>
            <p>
              <strong>Project Total (excl. VAT):</strong>{" "}
              {quoteData.quoteDetails.overallTotal
                ? Number(quoteData.quoteDetails.overallTotal).toLocaleString('en-US', { style: 'currency', currency: 'ZAR' })
                : 'N/A'}
            </p>
          </div>
          {/* Insurance and Maintenance */}
          {quoteData.InsuranceAndMaintenance && (
            <div className="mb-6 bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Insurance & Maintenance</h2>
              <p>
                <strong>Yearly Insurance Costs:</strong>{" "}
                {Number(quoteData.InsuranceAndMaintenance.yearlyInsuranceCosts).toLocaleString('en-US', { style: 'currency', currency: 'ZAR' })}
              </p>
              <p>
                <strong>Yearly Maintenance Costs:</strong>{" "}
                {Number(quoteData.InsuranceAndMaintenance.yearlyMaintenanceCosts).toLocaleString('en-US', { style: 'currency', currency: 'ZAR' })}
              </p>
            </div>
          )}
          {/* Solar Performance */}
          {quoteData.solarPerformance && (
            <div className="mb-6 bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Solar Performance</h2>
              <p>
                <strong>Annual Solar Production (kWh):</strong>{" "}
                {Number(quoteData.solarPerformance.annual_solar_production_kwh).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} kWh
              </p>
              <p>
                <strong>Average Self Consumption (%):</strong>{" "}
                {Number(quoteData.solarPerformance.average_self_consumption_percent).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
              </p>
              <p>
                <strong>Total Exported to Grid (kWh):</strong>{" "}
                {Number(quoteData.solarPerformance.total_exported_to_grid_kwh).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} kWh
              </p>
              <p>
                <strong>Total Imported from Grid (kWh):</strong>{" "}
                {Number(quoteData.solarPerformance.total_imported_from_grid_kwh).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} kWh
              </p>
              <p>
                <strong>Total Self Consumed Energy (kWh):</strong>{" "}
                {Number(quoteData.solarPerformance.total_self_consumed_energy_kwh).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} kWh
              </p>

              {/* Monthly Solar Production */}
              <h3 className="font-semibold mt-4">Monthly Solar Production (kWh)</h3>
              <table className="w-[100%] border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 bg-gray-200">Month</th>
                    <th className="border border-gray-300 px-4 py-2 bg-gray-200">Production (kWh)</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.solarPerformance.monthly_solar_production_kwh?.map((val, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 px-4 py-2">Month {i + 1}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {Number(val).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Monthly Imported from Grid */}
              <h3 className="font-semibold mt-4">Monthly Imported from Grid (kWh)</h3>
              <table className="w-[100%] border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 bg-gray-200">Month</th>
                    <th className="border border-gray-300 px-4 py-2 bg-gray-200">Imported (kWh)</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.solarPerformance.monthly_imported_from_grid_kwh?.map((val, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 px-4 py-2">Month {i + 1}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {Number(val).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Monthly Exported to Grid */}
              <h3 className="font-semibold mt-4">Monthly Exported to  Grid (kWh)</h3>
              <table className="w-[100%] border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 bg-gray-200">Month</th>
                    <th className="border border-gray-300 px-4 py-2 bg-gray-200">Exported (kWh)</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.solarPerformance.monthly_exported_to_grid_kwh?.map((val, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 px-4 py-2">Month {i + 1}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {Number(val).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Monthly Battery Consumption */}
              <h3 className="font-semibold mt-4">Monthly Battery Consumption (kWh)</h3>
              <table className="w-[100%] border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 bg-gray-200">Month</th>
                    <th className="border border-gray-300 px-4 py-2 bg-gray-200">Battery Consumption (kWh)</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.solarPerformance.monthly_battery_usage_kwh?.map((val, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 px-4 py-2">Month {i + 1}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {Number(val).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Monthly Direct Solar Consumption */}
              <h3 className="font-semibold mt-4">Monthly Direct Solar Consumption (kWh)</h3>
              <table className="w-[100%] border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 bg-gray-200">Month</th>
                    <th className="border border-gray-300 px-4 py-2 bg-gray-200">Direct Consumption (kWh)</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.solarPerformance.monthly_direct_solar_usage_kwh?.map((val, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 px-4 py-2">Month {i + 1}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {Number(val).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <p>No quote data available</p>
      )}
    </div>
  );
};

export default Home;
