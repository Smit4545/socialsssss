"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useSocket } from "../../lib/socket";
import L from "leaflet";

export default function LiveLocation() {
  const { socket, isConnected } = useSocket();
  const [userLocation, setUserLocation] = useState(null);
  const [allUsers, setAllUsers] = useState({});
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("You");

  useEffect(() => {
    setUserId(localStorage.getItem("userId"));
    setUsername(localStorage.getItem("username") || "You");
  }, []);

  const defaultIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const userIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png", // Different icon for user
    iconSize: [30, 48],
    iconAnchor: [15, 48],
    popupAnchor: [1, -40],
  });

  useEffect(() => {
    if (!userId || !navigator.geolocation) return;

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
  }, [socket, userId, username]);

  useEffect(() => {
    if (!socket) return;

    socket.on("location-updated", (users) => {
      setAllUsers(users);
    });

    return () => {
      socket.off("location-updated");
    };
  }, [socket]);

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

      <MapContainer
        center={userLocation ? [userLocation.lat, userLocation.lng] : [19, 70]}
        zoom={5}
        className="h-full w-full"
        style={{ height: "calc(100vh - 64px)" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <strong>{username} (You)</strong>
            </Popup>
          </Marker>
        )}

        {Object.values(allUsers).map(
          (user) =>
            user.userId !== userId && (
              <Marker key={user.userId} position={[user.lat, user.lng]} icon={defaultIcon}>
                <Popup>
                  {console.log(user.username)}
                  <strong>{user.username}</strong>
                </Popup>
              </Marker>
            )
        )}
      </MapContainer>
    </div>
  );
}
