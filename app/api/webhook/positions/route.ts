import { NextResponse } from 'next/server'
import Alpaca from '@alpacahq/alpaca-trade-api'

interface Position {
  symbol: string
  qty: string
  side: string
  market_value: string
}

export async function GET() {
  try {
    const alpaca = new Alpaca({
      keyId: process.env.ALPACA_API_KEY,
      secretKey: process.env.ALPACA_SECRET_KEY,
      paper: true, // change to false for live account
    })

    // Get all positions
    const allPositions = await alpaca.getPositions()

    // Map positions to simple info
    const portfolio = allPositions.map((pos: Position) => ({
      symbol: pos.symbol,
      qty: pos.qty,
      side: pos.side,
      marketValue: pos.market_value,
    }))

    return NextResponse.json({
      portfolio:portfolio
    })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch positions' },
      { status: 500 }
    )
  }
}
