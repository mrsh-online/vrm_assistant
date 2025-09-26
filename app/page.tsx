"use client";
import { Stats } from "@react-three/drei"
import UILayout from "./components/UILayout";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect  } from "react";
import { Experience } from "./components/Experience";

export default function VoiceRecorder() {
    const [progress, setProgress] = useState(100);
  const [brain, setBrain] = useState("Breathing")
  const [speaking, setSpeaking] = useState(false)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(interval);
          return 100;
        }
        return old + 2; // speed of loading
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (progress < 100) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <p className="text-lg font-semibold mb-4">[MRSH OS]</p>
        <p className="text-lg font-semibold mb-4">Loading {progress}%</p>

        {/* Loading bar container */}
        <div className="w-64 h-4 bg-gray-300 rounded-full overflow-hidden">
          {/* Progress bar */}
          <div
            className="h-full bg-black transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <section>
      <UILayout setBrain={setBrain} setSpeaking={setSpeaking} />
      <div className="Avatar">
      <Canvas>
        <Stats />
        <Experience brain={brain} speaking={speaking}/>
        <Suspense />
      </Canvas>
      </div>
    </section>
    )
}
