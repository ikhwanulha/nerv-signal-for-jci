import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // In production, look up user in DB and send reset email
    // For now, always return success to prevent email enumeration
    console.log(`[Forgot Password] Request for: ${email.toLowerCase().trim()}`)

    return NextResponse.json({
      message: "If an account exists, reset instructions have been sent.",
    })
  } catch (error) {
    console.error("Forgot-password error:", error)
    return NextResponse.json({
      message: "If an account exists, reset instructions have been sent.",
    })
  }
}
