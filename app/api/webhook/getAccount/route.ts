import { NextResponse } from 'next/server'
import Alpaca from '@alpacahq/alpaca-trade-api'

export async function GET() {
  try {
    const alpaca = new Alpaca({
      keyId: process.env.ALPACA_API_KEY,
      secretKey: process.env.ALPACA_SECRET_KEY,
      paper: true, // set to false if using live account
    })

    // Get account info
    const account = await alpaca.getAccount()
    //console.log(account)

    const formatted = (amount: string) => parseFloat(amount).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })


    return NextResponse.json({
      trading_blocked: account.trading_blocked,
      buying_power: formatted(account.buying_power),
      cash: formatted(account.cash),
    })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    )
  }
}
