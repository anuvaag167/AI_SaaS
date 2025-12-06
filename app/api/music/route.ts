// app/api/music/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Replicate from "replicate";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";

export const runtime = "nodejs"; // make sure we have Buffer, streams, etc.

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    // 1) auth check
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2) key check
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("Missing REPLICATE_API_TOKEN");
      return new NextResponse("Replicate key not configured", {
        status: 500,
      });
    }

    // 3) read prompt
    const body = (await req.json()) as { prompt?: string };
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // 4) call Riffusion on Replicate
    const output = (await replicate.run(
      "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
      {
        input: {
          prompt_a: prompt,
          prompt_b: prompt,
          alpha: 0.5,
          num_outputs: 1,
          num_inference_steps: 50,
          guidance: 7,
          seed_image_id: "vibes",
        },
      }
    )) as any;

    console.log("[RIFFUSION_RAW_TYPE]", typeof output, Array.isArray(output));
    console.log("[RIFFUSION_RAW_OUTPUT]", output);

    // 5) normalize output to something we can send to frontend
    let audio: any =
      (output && (output.audio || output.audio_url)) ||
      (Array.isArray(output) ? output[0] : undefined);

    if (!audio) {
      console.error("[MUSIC_ERROR_SERVER] No audio field in output");
      return NextResponse.json(
        { error: "No audio returned from model" },
        { status: 500 }
      );
    }

    const freeTrial = await checkApiLimit();

    if(!freeTrial){
      return new NextResponse("Free trial has expired.", {status:403})
    }

    let audioUrl: string | null = null;

    // Case 1: Replicate returns a direct URL string (old behaviour / REST API)
    if (typeof audio === "string") {
      audioUrl = audio;
    }

    // Case 2: Replicate returns a Web ReadableStream (what your log showed)
    else if (typeof audio.getReader === "function") {
      const reader = audio.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }

      const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
      const base64 = buffer.toString("base64");

      // riffusion is WAV on Replicate
      audioUrl = `data:audio/wav;base64,${base64}`;
    }

    // Case 3: Node Readable stream (just in case)
    else if (typeof (audio as any).pipe === "function") {
      const stream = audio as NodeJS.ReadableStream;
      const chunks: Buffer[] = [];

      for await (const chunk of stream as any) {
        chunks.push(
          Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array)
        );
      }

      const buffer = Buffer.concat(chunks);
      const base64 = buffer.toString("base64");
      audioUrl = `data:audio/wav;base64,${base64}`;
    }

    if (!audioUrl) {
      console.error(
        "[MUSIC_ERROR_SERVER] Could not normalize audio output",
        audio
      );
      return NextResponse.json(
        { error: "Could not read audio from model output" },
        { status: 500 }
      );
    }

    await increaseApiLimit();
    // 👈 frontend expects { audio: string }
    return NextResponse.json({ audio: audioUrl });
  } catch (error: any) {
    console.error(
      "[MUSIC_ERROR_SERVER]",
      error?.response?.data || error?.message || error
    );
    return NextResponse.json(
      { error: "Internal error", detail: error?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}



