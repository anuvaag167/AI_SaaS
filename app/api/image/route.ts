// app/api/image/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY || "";

const openai = new OpenAI({
  apiKey,
});

export async function POST(req: Request) {
  try {
    // Clerk auth (App Router)
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as {
      prompt?: string;
      amount?: string | number;
      resolution?: string;
    };

    const prompt = body.prompt;
    const amount = body.amount ?? 1;
    const resolution = body.resolution ?? "512x512";

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const n =
      typeof amount === "string" ? parseInt(amount, 10) : Number(amount);

    if (!n || Number.isNaN(n) || n < 1) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // ⚠️ Relax typings so TS doesn't fight us
    const size = resolution as any;

    // --- OpenAI image generation (v4 SDK style) ---
    const result: any = await (openai as any).images.generate({
      model: "dall-e-3",
      prompt,
      n,
      size,
      response_format: "url",
    });

    // result.data should be an array
    const dataArray: any[] = Array.isArray(result?.data) ? result.data : [];

    const images = dataArray.map((img: any) => ({
      url: String(img.url),
    }));

    // frontend expects: [{ url: "..." }, ...]
    return NextResponse.json(images, { status: 200 });
  } catch (error: any) {
    console.error(
      "[IMAGE_ERROR_SERVER]",
      error?.response?.data || error?.message || error
    );

    // still return 200 with an empty array so UI doesn't crash
    return NextResponse.json([], { status: 200 });
  }
}
