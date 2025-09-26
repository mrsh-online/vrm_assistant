import { CameraControls, Environment, Gltf } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useControls } from "leva";
import { useEffect, useRef } from "react";
import { VRMAvatar } from "./Avatar/VrmAvatar";

export const Experience = ({brain,speaking}) => {
  const controls = useRef();
  
  const avatar = "6493143135142452442.vrm"

  useEffect(() => {
    controls.current.setLookAt(0, 1 , 1, 0, 1, 0, true)

  }, [])
  
    

  return (
    <>
      <CameraControls
        ref={controls}
        position={[0,10,1]}
        maxPolarAngle={Math.PI / 2}
        minDistance={1}
        maxDistance={10}
      />
      <Environment preset="sunset" />
      <directionalLight intensity={2} position={[10, 10, 5]} />
      <directionalLight intensity={1} position={[-10, 10, 5]} />
      <VRMAvatar brain={brain} speaking={speaking} avatar={avatar}/> 
    </>
  );
};
