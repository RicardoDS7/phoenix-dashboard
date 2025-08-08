"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useRouter } from "next/navigation";

interface LoadProfileData {
  load_profile: {
    monday: number[];
    tuesday: number[];
    wednesday: number[];
    thursday: number[];
    friday: number[];
    saturday: number[];
    sunday: number[];
  };
}

export default function LoadProfile() {
  const router = useRouter();

  const [loadProfiles, setLoadProfiles] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [profileName, setProfileName] = useState<string>("");
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  const [profileData, setProfileData] = useState<LoadProfileData>({
    load_profile: {
      monday: Array(24).fill(0),
      tuesday: Array(24).fill(0),
      wednesday: Array(24).fill(0),
      thursday: Array(24).fill(0),
      friday: Array(24).fill(0),
      saturday: Array(24).fill(0),
      sunday: Array(24).fill(0),
    }
  });

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    async function fetchLoadProfiles() {
      try {
        const profilesSnap = await getDocs(collection(db, "load_profiles"));
        setLoadProfiles(profilesSnap.docs.map((doc) => doc.id));
      } catch (error) {
        console.error("Error fetching load profiles:", error);
      }
    }
    fetchLoadProfiles();
  }, []);

  useEffect(() => {
    async function loadProfileData() {
      if (!selectedProfile || isCreatingNew) return;
      try {
        const profileSnap = await getDoc(doc(db, "load_profiles", selectedProfile));
        if (profileSnap.exists()) {
          const data = profileSnap.data() as LoadProfileData;
          setProfileData(data);
          setProfileName(selectedProfile);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    }
    loadProfileData();
  }, [selectedProfile, isCreatingNew]);

  const handleProfileSelect = (profileId: string) => {
    if (profileId === "new") {
      setIsCreatingNew(true);
      setSelectedProfile("");
      setProfileName("");
      setProfileData({
        load_profile: {
          monday: Array(24).fill(0),
          tuesday: Array(24).fill(0),
          wednesday: Array(24).fill(0),
          thursday: Array(24).fill(0),
          friday: Array(24).fill(0),
          saturday: Array(24).fill(0),
          sunday: Array(24).fill(0),
        }
      });
    } else {
      setIsCreatingNew(false);
      setSelectedProfile(profileId);
    }
  };

  const handleHourlyValueChange = (day: keyof LoadProfileData['load_profile'], hour: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setProfileData(prev => ({
      ...prev,
      load_profile: {
        ...prev.load_profile,
        [day]: prev.load_profile[day].map((val, index) => 
          index === hour ? numValue : val
        )
      }
    }));
  };

  const copyDayToAll = (sourceDay: keyof LoadProfileData['load_profile']) => {
    const sourceData = profileData.load_profile[sourceDay];
    setProfileData(prev => ({
      ...prev,
      load_profile: {
        monday: [...sourceData],
        tuesday: [...sourceData],
        wednesday: [...sourceData],
        thursday: [...sourceData],
        friday: [...sourceData],
        saturday: [...sourceData],
        sunday: [...sourceData],
      }
    }));
  };

  const handleSave = async () => {
    const nameToUse = isCreatingNew ? profileName : selectedProfile;
    if (!nameToUse.trim()) {
      alert("Please enter a profile name");
      return;
    }

    try {
      await setDoc(doc(db, "load_profiles", nameToUse), {
        ...profileData,
        updatedAt: new Date(),
      });
      
      alert(`Load profile ${isCreatingNew ? 'created' : 'updated'} successfully!`);
      
      if (isCreatingNew) {
        // Refresh the profiles list
        const profilesSnap = await getDocs(collection(db, "load_profiles"));
        setLoadProfiles(profilesSnap.docs.map((doc) => doc.id));
        setSelectedProfile(nameToUse);
        setIsCreatingNew(false);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile");
    }
  };

  const generateHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return hours;
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <h1 className="text-6xl font-black mb-16">Load Profile Management</h1>

      <div className="w-full max-w-6xl mb-8">
        <label className="block">
          <span className="text-gray-700">Select Load Profile</span>
          <select
            value={isCreatingNew ? "new" : selectedProfile}
            onChange={(e) => handleProfileSelect(e.target.value)}
            className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md"
          >
            <option value="">Select a profile</option>
            <option value="new">+ Create New Profile</option>
            {loadProfiles.map((profileId) => (
              <option key={profileId} value={profileId}>{profileId}</option>
            ))}
          </select>
        </label>
      </div>

      {(selectedProfile || isCreatingNew) && (
        <div className="w-full max-w-6xl">
          {isCreatingNew && (
            <div className="mb-6">
              <label className="block">
                <span className="text-gray-700">Profile Name</span>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter profile name"
                  className="mt-1 px-4 py-2 bg-gray-100 block w-full rounded-md"
                />
              </label>
            </div>
          )}

          <div className="space-y-8">
            {daysOfWeek.map((day) => (
              <div key={day} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold capitalize">{day}</h3>
                  <button
                    onClick={() => copyDayToAll(day as keyof LoadProfileData['load_profile'])}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Copy to All Days
                  </button>
                </div>
                
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {generateHours().map((hour, index) => (
                    <div key={index} className="text-center">
                      <label className="block text-xs text-gray-600 mb-1">{hour}</label>
                      <input
                        type="number"
                        step="0.01"
                        value={profileData.load_profile[day as keyof LoadProfileData['load_profile']][index]}
                        onChange={(e) => handleHourlyValueChange(
                          day as keyof LoadProfileData['load_profile'], 
                          index, 
                          e.target.value
                        )}
                        className="w-full px-2 py-1 text-sm bg-gray-100 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-row gap-4 mt-8">
            <button 
              onClick={handleSave} 
              className="bg-[#4c7380] hover:bg-[#FFA07A] text-white font-bold py-2 px-4 rounded-full"
            >
              {isCreatingNew ? 'Create Profile' : 'Save Changes'}
            </button>
            <button 
              onClick={() => router.push("/")} 
              className="bg-[#4c7380] hover:bg-[#FFA07A] text-white font-bold py-2 px-4 rounded-full"
            >
              Return Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}