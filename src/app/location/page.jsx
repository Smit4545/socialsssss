"use client";
import dynamic from "next/dynamic";
const LiveLocation = dynamic(() => import("../../components/LiveLoc"), { ssr: false });

export default function LocationPage() {
  return <LiveLocation />;
}
