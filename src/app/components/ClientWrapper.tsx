'use client'

import dynamic from "next/dynamic";

// Dynamic import untuk SpeedTest
const SpeedTest = dynamic(() => import("./SpeedTest"), {
  ssr: false,
});

export default function ClientWrapper() {
  return <SpeedTest />;
}
