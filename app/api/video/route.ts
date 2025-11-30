// app/api/video/route.ts  (really your video route)
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Replicate from "replicate";

export const runtime = "nodejs";

const replicateApiToken = process.env.REPLICATE_API_TOKEN;

const replicate = new Replicate({
  auth: replicateApiToken!,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    // 1) auth check
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2) key check
    if (!replicateApiToken) {
      console.error("Missing REPLICATE_API_TOKEN");
      return new NextResponse("Replicate key not configured", {
        status: 500,
      });
    }

    // 3) read prompt from body
    const body = (await req.json()) as { prompt?: string };
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // 4) call Zeroscope on Replicate
    const input = {
      fps: 24,
      width: 1024,
      height: 576,
      // 🔥 use the user prompt here instead of hard-coded clown fish
      prompt,
      guidance_scale: 17.5,
      negative_prompt:
        "very blue, dust, noisy, washed out, ugly, distorted, broken",
    };

    const output = (await replicate.run(
      "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
      { input }
    )) as any;

    console.log("[ZEROSCOPE_RAW_OUTPUT]", output);

    // According to docs: output is an array, each item has .url()
    let videoUrl: string | null = null;

    if (Array.isArray(output) && output.length > 0) {
      const item = output[0] as any;

      if (item && typeof item.url === "function") {
        // File-like object from Replicate SDK
        videoUrl = item.url();
      } else if (typeof item === "string") {
        // Just in case it’s already a URL string
        videoUrl = item;
      }
    }

    if (!videoUrl) {
      console.error("[VIDEO_ERROR_SERVER] No video URL in output", output);
      return NextResponse.json(
        { error: "No video returned from model" },
        { status: 500 }
      );
    }

    // 👈 Frontend expects { video: string }
    return NextResponse.json({ video: videoUrl });
  } catch (error: any) {
    console.error(
      "[VIDEO_ERROR_SERVER]",
      error?.response?.data || error?.message || error
    );
    return NextResponse.json(
      { error: "Internal error", detail: error?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
