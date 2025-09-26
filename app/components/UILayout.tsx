import Chat from "./UI/Chat";
import Trading from "./UI/Trading.tsx"

export default function UILayout({setBrain,setSpeaking}){
  return(
    <>
      <Chat setBrain={setBrain} setSpeaking={setSpeaking}/>
      <Trading setBrain={setBrain} setSpeaking={setSpeaking}/>
    </>
  
  )

}
