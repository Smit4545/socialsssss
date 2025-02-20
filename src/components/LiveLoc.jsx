"use client"; // ✅ Ensure client-side execution

import { useState, useEffect } from "react";
import dynamic from "next/dynamic"; // ✅ Dynamically import react-leaflet
import { useSocket } from "../../lib/socket";
import L from "leaflet";

// ✅ Dynamically import react-leaflet components (Prevents SSR issues)
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

export default function LiveLocation() {
  const { socket } = useSocket();
  const [userLocation, setUserLocation] = useState(null);
  const [allUsers, setAllUsers] = useState({});
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("You");
  const [isClient, setIsClient] = useState(false); // ✅ Ensures safe client-side rendering

  useEffect(() => {
    setIsClient(true); // ✅ Ensures `window`-dependent code runs only on client
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("userId") || null);
      setUsername(localStorage.getItem("username") || "You");
    }
  }, []);

  const defaultIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const userIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconSize: [30, 48],
    iconAnchor: [15, 48],
    popupAnchor: [1, -40],
  });

  useEffect(() => {
    if (!isClient || !userId || typeof window === "undefined") return;

    if ("geolocation" in navigator) {
      const updateLocation = (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        socket.emit("update-location", {
          userId,
          username,
          lat: latitude,
          lng: longitude,
        });
      };

      const errorHandler = (error) => {
        console.error("Geolocation Error:", error);
        setError("Failed to retrieve location.");
      };

      const watchId = navigator.geolocation.watchPosition(updateLocation, errorHandler, {
        enableHighAccuracy: true,
        maximumAge: 10000,
      });

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [socket, userId, username, isClient]);

  useEffect(() => {
    if (!socket) return;

    socket.on("location-updated", (users) => {
      setAllUsers(users);
    });

    return () => {
      socket.off("location-updated");
    };
  }, [socket]);

  // ✅ Prevent rendering on the server-side
  if (!isClient) {
    return <p className="text-center text-gray-600">Loading map...</p>;
  }

  return (
    <div className="h-screen w-full">
      <h1 className="text-2xl font-bold text-center p-4 bg-gray-800 text-white">
        Live Location Tracker
      </h1>

      {error && (
        <div className="bg-red-500 text-white text-center py-2">
          <p>{error}</p>
        </div>
      )}

      {userLocation ? (
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={5}
          className="h-full w-full"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <strong>{username} (You)</strong>
            </Popup>
          </Marker>

          {Object.values(allUsers).map(
            (user) =>
              user.userId !== userId && (
                <Marker key={user.userId} position={[user.lat, user.lng]} icon={defaultIcon}>
                  <Popup>
                    <strong>{user.username}</strong>
                  </Popup>
                </Marker>
              )
          )}
        </MapContainer>
      ) : (
        <p className="text-center text-gray-500 py-4">Fetching location...</p>
      )}
    </div>
  );
}
