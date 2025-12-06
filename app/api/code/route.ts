import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";


const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey });

type ChatMessage = OpenAI.ChatCompletionMessageParam;

const instructionMessage: ChatMessage = {
  role: "system",
  content: [
    "You are a code generator.",
    "1. First, respond with a short plain-language explanation or description in normal Markdown (paragraphs, lists, headings).",
    "2. Then provide one or more fenced code blocks (```ts, ```js, etc.) only around the actual code.",
    "3. Do NOT wrap your entire response inside a single code block.",
  ].join(" "),
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!apiKey) {
      return new NextResponse("OpenAI key not configured", { status: 500 });
    }

    const body = await req.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();

    if(!freeTrial){
      return new NextResponse("Free trial has expired.", {status:403})
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [instructionMessage, ...messages],
    });

    const reply = completion.choices[0]?.message;
    
    await increaseApiLimit();

    return NextResponse.json(reply);
  } catch (error) {
    console.error("[CODE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}