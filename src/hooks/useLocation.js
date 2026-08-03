import { useState, useEffect, useCallback } from "react";

const parseWeatherCode = (code) => {
  let description = "Clear";
  let isRaining = false;
  let isSnowing = false;

  if (code === 0) {
    description = "Clear Sky";
  } else if (code >= 1 && code <= 3) {
    description = code === 1 ? "Mainly Clear" : code === 2 ? "Partly Cloudy" : "Overcast";
  } else if (code === 45 || code === 48) {
    description = "Foggy";
  } else if ((code >= 51 && code <= 57) || (code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    description = "Raining";
    isRaining = true;
  } else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    description = "Snowing";
    isSnowing = true;
  } else if (code >= 95 && code <= 99) {
    description = "Thunderstorm";
    isRaining = true;
  }
  return { description, isRaining, isSnowing };
};

export const useLocation = () => {
  const [locationText, setLocationText] = useState("Location Required");
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState({
    temperature: null,
    weatherCode: null,
    description: "Loading weather...",
    isRaining: false,
    isSnowing: false,
    isLoading: false,
    error: null
  });

  const fetchWeather = async (lat, lon) => {
    try {
      setWeather(prev => ({ ...prev, isLoading: true }));
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
      );
      if (response.ok) {
        const data = await response.json();
        const temp = data.current.temperature_2m;
        const code = data.current.weather_code;
        const parsed = parseWeatherCode(code);
        setWeather({
          temperature: temp,
          weatherCode: code,
          description: parsed.description,
          isRaining: parsed.isRaining,
          isSnowing: parsed.isSnowing,
          isLoading: false,
          error: null
        });
      } else {
        throw new Error("Failed to load weather data");
      }
    } catch (e) {
      console.warn("Weather fetch failed:", e);
      setWeather(prev => ({
        ...prev,
        isLoading: false,
        error: e.message || "Failed to fetch weather",
        description: "Weather unavailable"
      }));
    }
  };

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
      fetchWeather(28.4595, 77.0266); // Gurugram fallback weather
      return;
    }

    setLocationText("Fetching location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermissionGranted(true);
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        fetchAddress(latitude, longitude);
        fetchWeather(latitude, longitude);
      },
      (error) => {
        console.warn("Geolocation error:", error);
        setPermissionGranted(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationText("Location Required");
        } else {
          setLocationText("Please enable GPS");
        }
        fetchWeather(28.4595, 77.0266); // Gurugram fallback weather
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
    permissionGranted,
    coords,
    weather,
    requestLocation
  };
};
