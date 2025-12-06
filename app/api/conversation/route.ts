import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import OpenAI from "openai";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey, // will be undefined if env not set
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { messages } = body; // expect an array of { role, content }

    // 1) user must be logged in
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2) API key must be configured
    if (!apiKey) {
      return new NextResponse("OpenAI key not configured", { status: 500 });
    }

    // 3) messages must be provided
    if (!messages || !Array.isArray(messages)) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    //TODO: ProModal
    const freeTrial = await checkApiLimit();

    //TODO: ProModal
    if(!freeTrial){
      return new NextResponse("Free trial has expired.", {status:403})
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful AI assistant." },
        ...messages,
      ],
    });
    
    const reply = completion.choices[0]?.message?.content ?? "";

    //TODO: ProModal
    await increaseApiLimit();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
