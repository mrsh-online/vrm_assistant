"use client";
import { Canvas } from "@react-three/fiber";
import {  isBrowser, isMobile } from 'react-device-detect';
import { Suspense, useEffect, useRef, useState } from "react";
import {Mosaic} from "react-loading-indicators";
import Voice from "./Voice.tsx"
import Phrases from "./Dictonnary/Phrase.tsx"

export default function Chat({setBrain,setSpeaking}) {
  const [isAndroid, setIsAndroid] = useState(false);
  const [recording, setRecording] = useState(false);
  const [image, setImage] = useState(null)
  const [transcript, setTranscript] = useState("");
  const [lang, setLang] = useState("JP");
  const [chatMode, setChatMode] = useState("Chat");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string } | null>(null);
  const [chatVoice, setChatVoice] = useState("")
  const [userMessage, setUserMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const inputUserMessage = useRef()

  useEffect(() => {
    console.log(image)

  }, [image])
  
  useEffect(() => {
    console.log(chatMessages)

  }, [chatMessages])
  
  
  
  

  const startRecording = async () => {
    setBrain("Breathing")
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    // Choose a MIME type that works across mobile/desktop
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/mpeg",
      "audio/ogg;codecs=opus",
    ];
    let mimeType: string | undefined = undefined;
    if (typeof MediaRecorder !== "undefined") {
      for (const c of candidates) {
        if (MediaRecorder.isTypeSupported(c)) {
          mimeType = c;
          break;
        }
      }
    }

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: mimeType || "audio/webm" });
      if (!blob || blob.size === 0) {
        setTranscript("Error: No audio captured. Try again.");
        audioChunksRef.current = [];
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
        setRecording(false);
        return;
      }
      // Pick file extension based on blob type
      const ext = blob.type.includes("mp4")
        ? "mp4"
        : blob.type.includes("mpeg")
        ? "mp3"
        : blob.type.includes("ogg")
        ? "ogg"
        : "webm";
      const file = new File([blob], `recording.${ext}`, { type: blob.type });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("lang", lang);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      let data: { text?: string; error?: string; details?: unknown } | null = null;
      try {
        data = await res.json();
        console.log(data)
      } catch (e) {
        setTranscript(`Error: invalid JSON response (${(e as Error).message})`);
        return;
      }

      if (!res.ok) {
        setTranscript(`Error: ${(data && data.error) || res.statusText}`);
        console.error("/api/transcribe error", data);
      } else {
        const transcribed = (data && data.text) || "";
        const cleanTranscribed = transcribed.replace(/^\[\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}\]\s*/, '')
        setTranscript(cleanTranscribed);

        // Also send transcription to chat (as user message)
        if (cleanTranscribed) {
          const nextMessagesBase = [...chatMessages, { role: "user" as const, content: cleanTranscribed, image:image }];
          const nextMessages = nextMessagesBase.slice(-5);
          setChatMessages(nextMessages);

            const chatRes = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [
                  ...nextMessages,
                ],
              }),
            });
         // console.log(chatRes)
              setChatMessages({ role: "assistant" , content: message[0].content });
                setBrain("Happy")
              }
            }
      
      audioChunksRef.current = [];

      // release mic
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      mediaRecorderRef.current = null;
      setRecording(false);
    };

    // Use a small timeslice so mobile Safari/Chrome flush chunks
    recorder.start(250);
    setRecording(true);
  };

  const stopRecording = () => {
    setBrain("Thinking")
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    } else {
      setRecording(false);
    }
  };

const sendMessage = async () => {
  inputUserMessage.current.value = ""
  setBrain("Thinking")
  setLoading(true)
    
  const nextMessagesBase = [{ role: "user" as const, content: userMessage, image:image, lang:lang }];
  const nextMessages = nextMessagesBase.slice(-5);
    setChatMessages({role:"user", content:userMessage})

  try {
    const chatRes = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...nextMessages],
      }),
    });

    const data = await chatRes.json()

      console.log(data.data[0].voice)
      
    setChatMessages({role:"assistant", content: data.data[0].output})
    setChatVoice(data.data[0].voice)
    await setBrain("Happy");
      
  } catch (e) {
    setChatMessages((prev) =>
      [
        {
          role: "system" as const,
          content: `Error: ${(e as Error).message}`,
        },
      ]
    );
  }
    
    
  setLoading(false)
  setUserMessage("");
    
};


  
    const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const url = URL.createObjectURL(file)
      setImage(url)
    }
  }

  function noImage(){
    setImage(null)
    URL.revokeObjectURL(image) 
  }
  
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]); // Remove the data URL prefix
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
  



  return (
    <div className="Chat">
      {loading ? 
        <div className="flex justify-center mt-8" >
          <Mosaic size="small" color={["#32cd32", "#327fcd", "#cd32cd", "#cd8032"]} />
        </div>
      : ""}
      
      {chatMessages !== null ?
        <div className="mt-2 space-y-2">
            <div key={chatMessages.role} className={`appear p-2 rounded ${chatMessages.role === "user" ? "bg-blue-50" : "bg-gray-50"}`}>
              <span className="text-xs uppercase text-gray-500 mr-2">{chatMessages.role}</span>
              <span className="text-black">{chatMessages.content}</span>
            </div>
        </div>
        : ""}
      
      <div className="bg-white gap-2 flex mt-[20px] m-auto p-2">
        
        
      {isMobile ? 
      ""
      
        :
      <button
        onClick={recording ? stopRecording  : startRecording}
        className={` px-2 py-2 rounded ${
          recording ? "bg-red-500" : "bg-green-500"
        } text-white`}
      >
            <img src="/icons/voice.svg" />
      </button>
        }
            
          <button className="bg-black px-2 py-2 rounded" onClick={()=>sendMessage()}>
            <img src="/icons/send.svg" />
          </button>
        <input
            ref={inputUserMessage}
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()   // prevent form submit / new line
                sendMessage()
              }
            }}
            className="w-[70%] text-black m-4 p-1"
            type="text"
          />
        
        {/* Hidden file input */}
      <input
        type="file"
        id="fileInput"
        className="hidden"
        onChange={handleFileChange}
      />
      
          {image === null ? 
          <>
            {/* Label acts as the button */}
            <label
              htmlFor="fileInput"
              className="flex items-center gap-2 cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-600 transition"
            >
                  <img src="/icons/image.svg" />
            </label>
          </>
          :
            <img onClick={()=>{noImage()}}  className='h-[60px] ' src={image} />
          }

          
        </div>

      

      <div className="Lang mt-5 flex flex-row gap-3 justify-center">
        <button onClick={()=>{setChatMode("Chat")}} className={`${chatMode === "Chat" ? 'text-white bg-black' : 'text-black bg-white'} border-1 text-sm  p-2 rounded-lg`}>Chat</button>
        <button onClick={()=>{setChatMode("Agent")}} className={`${chatMode === "Agent" ? 'text-white bg-black' : 'text-black bg-white'} border-1 text-sm p-2 rounded-lg`}>Agent</button>
      </div>
      
      
      {chatMode === "Chat" ? 
        
      <div className="Lang h-[35px] mt-2 flex flex-row gap-3 justify-center">
        <button onClick={()=>{setLang("EN")}} className={`${lang === "EN" ? 'text-white bg-black' : 'text-black bg-white'} border-1 text-sm p-2 rounded-lg`}>🇬🇧</button>
        <button onClick={()=>{setLang("JP")}} className={`${lang === "JP" ? 'text-white bg-black' : 'text-black bg-white'} border-1 text-sm p-2 rounded-lg`}>🇯🇵 </button>
        <button onClick={()=>{setLang("CH")}} className={`${lang === "CH" ? 'text-white bg-black' : 'text-black bg-white'} border-1 text-sm p-2 rounded-lg`}>🇨🇳</button>
        <button onClick={()=>{setLang("KO")}} className={`${lang === "KO" ? 'text-white bg-black' : 'text-black bg-white'} border-1 text-sm p-2 rounded-lg`}>🇰🇷</button>
        <button onClick={()=>{setLang("ES")}} className={`${lang === "ES" ? 'text-white bg-black' : 'text-black bg-white'} border-1 text-sm p-2 rounded-lg`}>🇪🇸</button>
        <button onClick={()=>{setLang("DE")}} className={`${lang === "DE" ? 'text-white bg-black' : 'text-black bg-white'} border-1 text-sm p-2 rounded-lg`}>🇩🇪</button>
      </div>
      :
      <div className="Lang h-[35px] mt-2 flex flex-row gap-3 justify-center">
          
      </div>
        }
        
     <Phrases lang={lang} />
 
      {/* <Voice chatVoice={chatVoice} setSpeaking={setSpeaking}/> */}
    </div>
  );
}
