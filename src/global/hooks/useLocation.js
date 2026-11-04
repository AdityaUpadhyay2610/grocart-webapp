import { useState, useEffect, useCallback } from "react";


export const INDIAN_LOCATIONS = [
  { city: "New Delhi", address: "Connaught Place, New Delhi 110001", lat: 28.6315, lon: 77.2167 },
  { city: "Bengaluru", address: "Koramangala, Bengaluru 560034", lat: 12.9352, lon: 77.6245 },
  { city: "Gurugram", address: "DLF Cyber City, Gurugram 122002", lat: 28.4950, lon: 77.0895 },
  { city: "Mumbai", address: "Bandra West, Mumbai 400050", lat: 19.0596, lon: 72.8295 },
  { city: "Hyderabad", address: "Jubilee Hills, Hyderabad 500033", lat: 17.4319, lon: 78.4073 },
  { city: "Pune", address: "Koregaon Park, Pune 411001", lat: 18.5362, lon: 73.8940 }
];

export const useLocation = () => {
  const [locationText, setLocationText] = useState(() => {
    return localStorage.getItem("grocart_local_address") || "Connaught Place, New Delhi 110001";
  });
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [coords, setCoords] = useState({ latitude: 28.6315, longitude: 77.2167 });
  const [weather, setWeather] = useState({
    temperature: 24,
    weatherCode: 0,
    description: "Clear Sky",
    isRaining: false,
    isSnowing: false,
    isLoading: false,
    error: null
  });

    const fetchAddress = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "GroCartApp-Web"
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        const address = data.address;
        const locality = address.suburb || address.neighbourhood || address.city_district || address.subdistrict || address.city || address.town || address.village || "Connaught Place";
        const state = address.state || "Delhi";
        const postcode = address.postcode ? ` ${address.postcode}` : "";
        const formatted = `${locality}, ${state}${postcode}`;
        setLocationText(formatted);
      }
    } catch (e) {
      console.warn("Reverse geocode failed:", e);
    }
  };

  const selectLocation = useCallback((loc) => {
    if (!loc) return;
    const address = typeof loc === 'string' ? loc : loc.address;
    const lat = loc.lat || 28.6315;
    const lon = loc.lon || 77.2167;
    setLocationText(address);
    setCoords({ latitude: lat, longitude: lon });
    localStorage.setItem("grocart_local_address", address);
    window.dispatchEvent(new Event("storage"));
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermissionGranted(true);
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        fetchAddress(latitude, longitude);
      },
      (error) => {
        console.warn("Geolocation fallback:", error);
        setPermissionGranted(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (locationText && 
        !locationText.includes("Fetching") && 
        !locationText.includes("Disabled") && 
        !locationText.includes("Unable") && 
        !locationText.includes("Permission") &&
        !locationText.includes("Required") &&
        !locationText.includes("GPS")) {
      localStorage.setItem("grocart_local_address", locationText);
      window.dispatchEvent(new Event("storage"));
    }
  }, [locationText]);

  return {
    locationText,
    setLocationText,
    permissionGranted,
    coords,
    weather,
    requestLocation,
    selectLocation,
    presetLocations: INDIAN_LOCATIONS
  };
};

export const useGPSLocation = useLocation;

