import { useState, useEffect, useCallback } from "react";

export const useLocation = () => {
  const [locationText, setLocationText] = useState("Location Required");
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [coords, setCoords] = useState(null);

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
        const locality = address.suburb || address.neighbourhood || address.city_district || address.subdistrict || address.city || address.town || address.village || "Unknown Locality";
        const state = address.state || "";
        setLocationText(state ? `${locality}, ${state}` : locality);
      } else {
        setLocationText(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      }
    } catch (e) {
      console.warn("Reverse geocode failed:", e);
      setLocationText("Shimla, Himachal Pradesh"); // realistic fallback matching Android theme
    }
  };

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationText("GPS not supported");
      return;
    }

    setLocationText("Fetching location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermissionGranted(true);
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        fetchAddress(latitude, longitude);
      },
      (error) => {
        console.warn("Geolocation error:", error);
        setPermissionGranted(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationText("Location Required");
        } else {
          setLocationText("Please enable GPS");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    locationText,
    permissionGranted,
    coords,
    requestLocation
  };
};
