import React, { useState, useRef, useEffect } from "react";


// Full romaji → kana mapping with dakuten, handakuten, small kana
const romajiToKana = {
  a: "あ", i: "い", u: "う", e: "え", o: "お",
  ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ",
  ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご",
  sa: "さ", shi: "し", su: "す", se: "せ", so: "そ",
  za: "ざ", ji: "じ", zu: "ず", ze: "ぜ", zo: "ぞ",
  ta: "た", chi: "ち", tsu: "つ", te: "て", to: "と",
  da: "だ", di: "ち", du: "つ", de: "で", do: "ど",
  na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の",
  ha: "は", hi: "ひ", fu: "ふ", he: "へ", ho: "ほ",
  ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ",
  pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
  ma: "ま", mi: "み", mu: "む", me: "め", mo: "も",
  ya: "や", yu: "ゆ", yo: "よ",
  ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ",
  wa: "わ", wo: "お",
  n: "ん",
  // Small kana combinations
  kya: "きゃ", kyu: "きゅ", kyo: "きょ",
  sha: "しゃ", shu: "しゅ", sho: "しょ",
  cha: "ちゃ", chu: "ちゅ", cho: "ちょ",
  nya: "にゃ", nyu: "にゅ", nyo: "にょ",
  hya: "ひゃ", hyu: "ひゅ", hyo: "ひょ",
  mya: "みゃ", myu: "みゅ", myo: "みょ",
  rya: "りゃ", ryu: "りゅ", ryo: "りょ",
  // Extend more if needed
  // // small kana combos expand into multiple base kana
  kya: ["き", "あ"],kyu: ["き", "う"],kyo: ["き", "お"],
  sha: ["し", "や"],shu: ["し", "ゆ"],sho: ["し", "よ"],
  cha: ["ち", "や"],chu: ["ち", "ゆ"],cho: ["ち", "よ"],
  nya: ["に", "や"],nyu: ["に", "ゆ"],nyo: ["に", "よ"],
  hya: ["ひ", "や"],hyu: ["ひ", "ゆ"],hyo: ["ひ", "よ"],
  mya: ["み", "や"],myu: ["み", "ゆ"],myo: ["み", "よ"],
  rya: ["り", "や"],ryu: ["り", "ゆ"],ryo: ["り", "よ"],
};

export default function Voice({chatVoice,setSpeaking}) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(3); // Default playback speed
  const audioRef = useRef(new Audio());

  // Convert English/romaji to kana
const convertToKana = (input) => {
  const kanaArray = [];
  let buffer = "";

  for (let i = 0; i < input.length; i++) {
    const char = input[i].toLowerCase();
    if (char.match(/[a-z]/)) {
      buffer += char;

      // check 3-letter combos
      if (i + 2 < input.length) {
        const nextThree = buffer + input[i+1].toLowerCase() + input[i+2].toLowerCase();
        if (romajiToKana[nextThree]) {
          kanaArray.push(...romajiToKana[nextThree]); // spread the array
          i += 2;
          buffer = "";
          continue;
        }
      }

      // check 2-letter combos
      if (i + 1 < input.length) {
        const nextTwo = buffer + input[i+1].toLowerCase();
        if (romajiToKana[nextTwo]) {
          kanaArray.push(...romajiToKana[nextTwo]); // spread the array
          i++;
          buffer = "";
          continue;
        }
      }

      // check 1-letter
      if (romajiToKana[buffer]) {
        kanaArray.push(...romajiToKana[buffer]); // spread
        buffer = "";
      }
    } else {
      if (buffer) buffer = "";
      kanaArray.push(char);
    }
  }

  return kanaArray;
};

  // Autoplay each kana
const playPhrase = async (phrase) => {
  const kanaArray = convertToKana(phrase);
  if (kanaArray.length === 0) return;
  
  setSpeaking(true)  
  setPlaying(true);
  for (let i = 0; i < kanaArray.length; i++) {
    let kana = kanaArray[i];
      
    if (kana === "ゃ") {
      kana = "や";
    } else if (kana === "ゅ") {
      kana = "ゆ";
    } else if (kana === "ょ") {
      kana = "よ";
    }

 // Skip spaces or non-letter characters
    if (!kana.match(/[ぁ-んァ-ンa-zA-Z]/)) continue;

    const fileName = encodeURIComponent(kana);
    //audioRef.current.src = `/voice/FLORET/01_A3/${fileName}.wav`;
    audioRef.current.src = `/voice/nyaa.mp3`;
    audioRef.current.playbackRate = speed;
    await audioRef.current.play();
    await new Promise((resolve) => {
      audioRef.current.onended = resolve;
    });
  }
  setSpeaking(false)  
  setPlaying(false);
};

  useEffect(() => {
    playPhrase(chatVoice)

  }, [chatVoice])
  

}
