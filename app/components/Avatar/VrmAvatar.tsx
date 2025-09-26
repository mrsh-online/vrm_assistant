import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm"
import { useAnimations, useFBX, useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useControls } from "leva"
import { useEffect, useMemo, useRef } from "react"
import {remapMixamoAnimationToVrm} from "../../utils/remapMixamoAnimationToVrm"

export const VRMAvatar = ({avatar, brain,speaking, ...props}) =>{
    
    const {scene, userData} = useGLTF(`models/${avatar}`, undefined, undefined, (loader) => {
        loader.register((parser) =>{
            return new VRMLoaderPlugin(parser)
        })
    })

    

    const assetA = useFBX("animations/Happy.fbx")
    const assetB = useFBX("animations/Breathing Idle.fbx")
    const assetC = useFBX("animations/Thinking.fbx")

    const currnetVrm = userData.vrm

    const animationClipA = useMemo(()=>{
        const clip = remapMixamoAnimationToVrm(currnetVrm, assetA) 
        clip.name = "Happy";
        return clip

    }, [assetA, currnetVrm])

    const animationClipB = useMemo(()=>{
        const clip = remapMixamoAnimationToVrm(currnetVrm, assetB) 
        clip.name = "Breathing";
        return clip

    }, [assetB, currnetVrm])

    const animationClipC = useMemo(()=>{
        const clip = remapMixamoAnimationToVrm(currnetVrm, assetC) 
        clip.name = "Thinking";
        return clip

    }, [assetC, currnetVrm])

    const {actions } = useAnimations([animationClipA,animationClipB,animationClipC],currnetVrm.scene )



    useEffect(() => {
        const vrm = userData.vrm;

        // calling these functions greatly improves the performance
		VRMUtils.removeUnnecessaryVertices( scene );
		VRMUtils.combineSkeletons( scene );
		VRMUtils.combineMorphs( vrm );

        vrm.scene.traverse( ( obj ) => {

            obj.frustumCulled = false;

        } );

    }, [scene])


        const angry = 0 
        const sad = 0
        const happy = 0
        const aa = 0

        const animation = brain

        useEffect(()=>{
            if (animation === "None"){
                return;
            }

            actions[`${brain}`]?.play();
            return () =>{
                actions[`${brain}`]?.stop()
            }
        },[actions,animation, brain])

        // use for speaking animation
        const phonemes = ["aa", "ih", "ee", "oh", "ou"]
        const currentIndex = useRef(0)
        const tOffset = useRef(Math.random() * 100) // randomize start for natural variation

        useFrame((state,delta)=>{
            if(!userData.vrm){
                return;
            }
            const t = state.clock.getElapsedTime()
        
            userData.vrm.expressionManager.setValue("angry", angry)
            userData.vrm.expressionManager.setValue("sad", sad)
            userData.vrm.expressionManager.setValue("happy",happy )
        
        
            if(speaking === true){
            
            let speed=2.5
            const os = Math.sin(t * Math.PI * 2 * speed) // oscillates between -1 and 1
            const val = 0.5 - 0.5 * os   // maps to 0..1
        
            // Set current phoneme
            const currentPhoneme = phonemes[currentIndex.current]
            userData.vrm.expressionManager.setValue(currentPhoneme, val)
        
            // Reset previous phonemes to 0 (optional, for cleaner switching)
            phonemes.forEach((p, i) => {
            if (i !== currentIndex.current) userData.vrm.expressionManager.setValue(p, 0)
            })

            // When mouth closes, switch to next phoneme
            if (val < 0.01) {
            currentIndex.current = (currentIndex.current + 1) % phonemes.length
            }
            
        }else{
            // Reset previous phonemes to 0 (optional, for cleaner switching)
            phonemes.forEach((p, i) => {
            if (i !== currentIndex.current) userData.vrm.expressionManager.setValue(p, 0)
            })
            
        }

            userData.vrm.update(delta)
        })
    

    return (
        <group {...props}>

            <primitive 
                object={scene} 
                rotation-y={Math.PI}
            />
        </group>
    )

}
