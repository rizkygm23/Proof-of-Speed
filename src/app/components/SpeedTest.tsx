"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import SpeedChartLive from "./SpeedChartLive";

export default function SpeedTest() {
  const [speed, setSpeed] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);
  const [proving, setProving] = useState<boolean>(false);
  const [proofResult, setProofResult] = useState<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [progressValue, setProgressValue] = useState<number>(0);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/speedtest/speedtest.js";
    script.onload = () => {
      setScriptLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  const startSpeedTest = () => {
    if (!scriptLoaded) return;

    const s = new (window as any).Speedtest();

    s.onupdate = (data: any) => {
      if (data.dlStatus) {
        setSpeed(parseFloat(data.dlStatus));
      }
    };

    s.onend = () => {
      setRunning(false);
    };

    s.start();
    setRunning(true);
    setProofResult(null);
  };

  const proveSpeed = async () => {
    if (speed === 0) return;

    setProving(true);
    setProgressValue(0);

    // Dummy loading animation
    const progressInterval = setInterval(() => {
      setProgressValue((prev) => {
        const next = prev + Math.random() * 15;
        return next >= 99 ? 99 : next;
      });
    }, 300);

    try {
      const res = await fetch("http://95.111.225.16:3001/prove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speed_mbps: speed, prove: true }),
      });

      const data = await res.json();
      setProofResult(data);
      setProgressValue(100);
    } catch (err) {
      console.error("Proving failed:", err);
      setProofResult({ error: "Failed to prove speed." });
    } finally {
      clearInterval(progressInterval);
      setProving(false);
    }
  };

  return (
    <div className="text-center w-full mt-10 text-gray-800 bg-white min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#FE11C5]">Proof of Speed</h1>

      <button
        className="bg-[#FE11C5] text-white px-6 py-2 rounded hover:opacity-90 disabled:bg-gray-300"
        onClick={startSpeedTest}
        disabled={running || !scriptLoaded}
      >
        {running ? "Testing..." : "Start Speed Test"}
      </button>

      <SpeedChartLive />

      <p className="mt-4 text-lg">
        {running || speed > 0
          ? `Download Speed: ${speed} Mbps`
          : "Click the button to begin test"}
      </p>

      <button
        className="bg-[#FE11C5] text-white px-6 py-2 mt-4 rounded hover:opacity-90 disabled:bg-gray-300"
        onClick={proveSpeed}
        disabled={speed === 0 || proving || running}
      >
        {proving ? "Proving..." : "Prove Speed"}
      </button>

      {proving && (
        <div className="max-w-xl mx-auto mt-4">
          <Progress value={progressValue} />
        </div>
      )}

      {proofResult && (
        <div className="mt-6 max-w-xl mx-auto bg-[#f9f9f9] border border-gray-200 p-6 rounded text-left shadow">
          <h2 className="text-md md:text-xl font-semibold mb-2">
            Proof Result
          </h2>
          <p className="mb-2 text-sm md:text-xl w-fit overflow-hidden">
            <strong>Speed Proof:</strong> {proofResult.speed_proof}
          </p>
          <p className="mb-4 text-sm md:text-xl">
            <strong>Verified Result:</strong> {proofResult.verified_result} Mbps
          </p>

          {/* Twitter Share CTA */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `🚀 I just completed a Proof of Speed on proof.mysite.com!\n\n🔒 Proof Hash:\n${proofResult.speed_proof}\n⚡ My download speed was ${proofResult.verified_result} Mbps\n\n#ProofOfSpeed #zkProofs #zkTech`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-blue-500 text-[#FE11C5] hover:bg-blue-600 transition h-4"
          >
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="h-4 w-4"
            >
              <path d="M23.954 4.569c-.885.392-1.83.656-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.949.564-2.005.974-3.127 1.195-.896-.957-2.178-1.555-3.594-1.555-2.719 0-4.924 2.205-4.924 4.924 0 .386.044.762.127 1.124C7.728 8.087 4.1 6.128 1.671 3.149c-.423.722-.666 1.561-.666 2.475 0 1.708.869 3.213 2.188 4.096-.807-.026-1.566-.248-2.229-.616v.063c0 2.385 1.693 4.374 3.946 4.827-.413.112-.848.171-1.296.171-.317 0-.626-.03-.928-.086.627 1.956 2.444 3.377 4.6 3.417-1.68 1.318-3.808 2.105-6.115 2.105-.397 0-.788-.023-1.174-.069 2.179 1.397 4.768 2.212 7.548 2.212 9.054 0 14-7.496 14-13.986 0-.21 0-.423-.015-.634.961-.694 1.8-1.562 2.46-2.549z" />
            </svg> */}
            Share on Twitter
          </a>
        </div>
      )}
    </div>
  );
}
