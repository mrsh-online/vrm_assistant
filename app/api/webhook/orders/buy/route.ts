import { NextResponse } from 'next/server'
import Alpaca from '@alpacahq/alpaca-trade-api'

export async function POST(req: Request) {
  try {
    const { symbol, notional, side, type, time_in_force, limit_price } = await req.json()

    const alpaca = new Alpaca({
      keyId: process.env.ALPACA_API_KEY,
      secretKey: process.env.ALPACA_SECRET_KEY,
      paper: true, // change to false if live trading
    })

    // Create the order
    const orderParams: {
      symbol: string;
      notional: string | number;
      side: string;
      type: string;
      time_in_force: string;
      limit_price?: number;
    } = {
      symbol,
      notional,
      side,
      type,
      time_in_force,
    }

    if (type === 'limit' && limit_price) {
      orderParams.limit_price = limit_price
    }

    const order = await alpaca.createOrder(orderParams)

    return NextResponse.json({ ok: true, order })
  } catch (error: unknown) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed to place order' },
      { status: 500 }
    )
  }
}
