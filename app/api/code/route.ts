// // app/api/code/route.ts
// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import OpenAI from "openai";

// // ---------- OpenAI setup ----------
// const apiKey = process.env.OPENAI_API_KEY;

// // Optional: warn in dev if missing
// if (!apiKey) {
//   console.warn("⚠️ OPENAI_API_KEY is not set in the environment.");
// }

// const openai = new OpenAI({
//   apiKey, // if undefined, we’ll catch it below
// });

// // define a very simple message type – no need to import types from openai
// type ChatMessage = {
//   role: "system" | "user" | "assistant";
//   content: string;
// };

// // System instruction used for every request
// const systemMessage: ChatMessage = {
//   role: "system",
//   content:
//     "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanation.",
// };

// // ---------- POST /api/code ----------
// export async function POST(req: Request) {
//   try {
//     // 1) user must be logged in
//     const { userId } = await auth(); // same pattern as your conversation route
//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     // 2) API key must be configured
//     if (!apiKey) {
//       return new NextResponse("OpenAI key not configured", { status: 500 });
//     }

//     // 3) get and validate body
//     const body = await req.json();
//     const { messages } = body as { messages: ChatMessage[] };

//     if (!messages || !Array.isArray(messages) || messages.length === 0) {
//       return new NextResponse("Messages are required", { status: 400 });
//     }

//     // 4) Call OpenAI with system + user messages
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [systemMessage, ...messages],
//     });

//     const reply = completion.choices[0]?.message;

//     // normalize reply to our ChatMessage type
//     const normalizedReply: ChatMessage = {
//       role: reply?.role ?? "assistant",
//       content:
//         typeof reply?.content === "string"
//           ? reply.content
//           : JSON.stringify(reply?.content ?? ""),
//     };

//     return NextResponse.json(normalizedReply);
//   } catch (error: any) {
//     console.error("[CODE_ERROR]", error);

//     // send the error message back so you can see it in devtools
//     return NextResponse.json(
//       { error: error?.message ?? "Internal error" },
//       { status: 500 },
//     );
//   }
// }

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [instructionMessage, ...messages],
    });

    const reply = completion.choices[0]?.message;
    return NextResponse.json(reply);
  } catch (error) {
    console.error("[CODE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}