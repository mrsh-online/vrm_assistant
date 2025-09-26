'use client'

import {  useState, useEffect} from 'react';
import { ThreeDot } from 'react-loading-indicators';
import TradingViewWidget from './Trading/tradingView.jsx';
import HeatMapWidget from "./Trading/heatMap"



export default function Trading({setBrain, setSpeaking}) {
  const [result, setResult] = useState(null);
  const [menu, setMenu] = useState("Initial")
  const [positions, setPositions] = useState(null)
  const [userAccount, setUserAccount]= useState({
      trading_blocked:"",
      buying_power: "",
      cash: "",
})
  const [frame, setFrame] = useState("")
  const [loading, setLoading] = useState(false)
  const [stock, setStock] = useState({view : "", news:""})
  const [sentiment, setSentiment] = useState("")


  const retriveData = async () => {
    setLoading(true)
    const response = await fetch('/api/webhook/getNews',{
      method: 'POST',
      body: JSON.stringify({
        message: stock.news
      })
    });


    const data = await response.json();
    setResult(data.data[0])
    setLoading(false)
    setSentiment(data.data[0].sentimentAnalysis.category)
    setSpeaking(true)
  }
  useEffect(() => {
    console.log(result)

  }, [result])
  

  const fetchPositions = async () => {
    const res = await fetch('/api/webhook/positions')
    const data = await res.json()
    setPositions(data)
    console.log(data)
  }

  const RetriveBalance =async () =>{
    const response = await fetch('api/webhook/getAccount',{
      method: 'GET'
    })
    const data= await response.json()
    //console.log(data)
    setUserAccount(data)
  }

  const buyApple = async () => {
    const res = await fetch('/api/webhook/orders/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: 'AAPL',
        notional: 100,
        side: 'buy',
        type: 'market',
        time_in_force: 'day',
      }),
    })
    const data = await res.json()
    //console.log(data)
  }

  const sellApple = async () => {
    const res = await fetch('/api/webhook/orders/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: 'AAPL',
        qty: 1,
        side: 'sell',
        type: 'market',
        time_in_force: 'day',
      }),
    })
    const data = await res.json()
    //console.log(data)
  }

  useEffect(() => {
    RetriveBalance(); 
    fetchPositions();
  }, [])

  useEffect(() => {
    if(stock.news !==""){
    retriveData();
            
          }
  }, [stock])

  useEffect(() => {
    console.log(menu)
  }, [menu])
  
  
  

  return (
    <section className='Trading w-[30%]' >
      <div className='w-[80%] h-[100%] m-auto flex flex-col gap-4'>

        {frame !=="" && menu === "News" ? <iframe className=" h-[400%]" src={frame}></iframe>  :""}
        
        <div className='flex gap-4'>
          <button className={`${stock.news === "BTCUSDT" ? 'text-white bg-black' : 'text-black bg-white'} border-1  p-2 rounded-lg`} 
            onClick={()=>setStock({view:"Binance:BTCUSD", news:"BTCUSDT"})}>BTC</button>
          <button className={`${stock.news === "Meta" ? 'text-white bg-black' : 'text-black bg-white'} border-1  p-2 rounded-lg`} 
onClick={()=>setStock({view:"NASDAQ:META", news:"Meta"})}>Meta</button>
          <button className={`${stock.news === "Appl" ? 'text-white bg-black' : 'text-black bg-white'} border-1  p-2 rounded-lg`} 
onClick={()=>setStock({view:"NASDAQ:AAPL", news:"Appl"})}>Apple</button>
        </div>
        
        <div className='flex gap-4'>
          <button className={`${menu === "News" ? 'text-white bg-black' : 'text-black bg-white'} border-1  p-2 rounded-lg`} 
            onClick={()=>setMenu("News")}>News</button>
          
          <button className={`${menu  === "Chart" ? 'text-white bg-black' : 'text-black bg-white'} border-1  p-2 rounded-lg`} 
            onClick={()=>setMenu("Chart")}>Chart</button>
          
          <button className={`${menu  === "HeatMap" ? 'text-white bg-black' : 'text-black bg-white'} border-1  p-2 rounded-lg`} 
            onClick={()=>setMenu("HeatMap")}>HeatMap</button>
          
          <button className={`${menu  === "Buy" ? 'text-white bg-black' : 'text-black bg-white'} border-1  p-2 rounded-lg`} 
            onClick={()=>setMenu("Buy")}>Buy</button>
        </div>

        {menu === "News" ? 
        <div className=' h-[200px]  '>
          <h1>News {stock.news}</h1>
           {result?.title.map((e,i)=>{return(
            <div key={`title${i}`}>
           <p className="text-sm" onClick={()=>{setFrame(result?.url[i])}}>{e}</p>
           </div>
           )})} 
          <p>{sentiment}</p>
        </div>
        : ""}
        
        {loading == true ? 
        <ThreeDot color={["#dd56e6", "#e683ec", "#efaff3", "#f8dbfa"]} />
        : null}
        
        {menu === "Buy" ? 
          
        <>
          <div className='flex gap-4'>
            <p>power {userAccount.buying_power}</p>
            <p>account balance = {userAccount.cash}</p>
          </div>
          <div className='flex gap-4 h-[300px]'>
            <button onClick={buyApple}>Buy</button>
            <button onClick={buyApple}>Sell</button>
          </div>
        </>
        : ""}

          
        {menu === "Chart" ? 
        <div className='w-[100%] h-[300px] m-auto overflow-hidden'>
          <TradingViewWidget stock={stock.view} key={stock.view}/>
        </div>
        : ""}
        {menu === "HeatMap" ? 
      <div className='w-[100%] h-[300px] m-auto overflow-hidden'>
        <HeatMapWidget />
      </div>
        : ""}
        
        {menu === "Initial" ? 
        <div className='w-[300px] h-[300px]  m-auto '>
        </div>
        : ""}

      </div>
    </section>
  );
}
