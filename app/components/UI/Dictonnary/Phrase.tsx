"use client";

import { useState } from "react";
import { greetings, common,commonTwo,travel } from "./phrase.js";
import { number,location, contact, time, accommodations} from "./phraseTwo.js";

function PhraseItem({ item, lang }) {
  return (
    <div className="flex justify-center gap-5 bg-gray-100 p-2 rounded mt-2">
      <p className="text-center text-black w-[49%]">{item[lang] || item.EN}</p>
      {lang !== "EN" && <p className="text-center text-black w-[49%]">{item.EN}</p>}
    </div>
  );
}

export default function Phrases({ lang }) {
  const [showGreetings, setShowGreetings] = useState(false);
  const [showCommon, setShowCommon] = useState(false);
  const [showCommonTwo, setShowCommonTwo] = useState(false);
  const [showTravel, setShowTravel] = useState(false);
  const [showNumber, setShowNumber] = useState(false);
  const [showLocation, setshowLocation] = useState(false);
  const [showContact, setshowContact] = useState(false);
  const [showTime, setshowTime] = useState(false);
  const [showAccomodation, setshowAccomodation] = useState(false);

  return (
    <div className="h-[200px] overflow-scroll mt-2 bg-white p-4">
      {/* Labels side by side */}
      <div className="flex gap-4 mb-2 overflow-x-scroll &::-webkit-scrollbar]:w-0">
        <button
          className="px-4 whitespace-nowrap py-2 bg-black text-white rounded"
          onClick={() => setShowGreetings(!showGreetings)}
        >
          Greetings
        </button>
        <button
          className="px-4 whitespace-nowrap py-2 bg-black text-white rounded"
          onClick={() => setShowCommon(!showCommon)}
        >
          Common
        </button>
        <button
          className="px-4  whitespace-nowrap py-2 bg-black text-white rounded"
          onClick={() => setShowCommonTwo(!showCommonTwo)}
        >
          Common 2
        </button>
        <button
          className="px-4  whitespace-nowrap py-2 bg-black text-white rounded"
          onClick={() => setShowTravel(!showTravel)}
        >
          Travel
        </button>
        <button
          className="px-4 py-2  whitespace-nowrap bg-black text-white rounded"
          onClick={() => setShowNumber(!showNumber)}
        >
         Numbers and money 
        </button>
        
        <button
          className="px-4 py-2  whitespace-nowrap bg-black text-white rounded"
          onClick={() => setshowLocation(!showLocation)}
        >
         Location 
        </button>
        
        <button
          className="px-4 py-2  whitespace-nowrap bg-black text-white rounded"
          onClick={() => setshowContact(!showContact)}
        >
         Contact 
        </button>
        
        <button
          className="px-4 py-2  whitespace-nowrap bg-black text-white rounded"
          onClick={() => setshowTime(!showTime)}
        >
          Time and Date
        </button>
        
        <button
          className="px-4 py-2  whitespace-nowrap bg-black text-white rounded"
          onClick={() => setshowAccomodation(!showAccomodation)}
        >
          Accomodations
        </button>
      </div>

      {/* Greetings phrases */}
      {showGreetings &&
        greetings.map((greeting, index) => (
          <PhraseItem key={index} item={greeting} lang={lang} />
        ))}

      {/* Common phrases */}
      {showCommon &&
        common.map((item, index) => (
          <PhraseItem key={index} item={item} lang={lang} />
        ))}
      
      {showCommonTwo &&
        commonTwo.map((item, index) => (
          <PhraseItem key={index} item={item} lang={lang} />
        ))}
      
      {showTravel &&
        travel.map((item, index) => (
          <PhraseItem key={index} item={item} lang={lang} />
        ))}
      
      {showNumber &&
        number.map((item, index) => (
          <PhraseItem key={index} item={item} lang={lang} />
        ))}
      
      {showLocation &&
        location.map((item, index) => (
          <PhraseItem key={index} item={item} lang={lang} />
        ))}
      
      {showContact &&
        contact.map((item, index) => (
          <PhraseItem key={index} item={item} lang={lang} />
        ))}
      
      {showTime &&
        time.map((item, index) => (
          <PhraseItem key={index} item={item} lang={lang} />
        ))}
      
      {showAccomodation &&
        accommodations.map((item, index) => (
          <PhraseItem key={index} item={item} lang={lang} />
        ))}
    </div>
  );
}
