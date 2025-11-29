// app/page.tsx (or whatever your route file is)
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { ArrowRight, Code, ImageIcon, MessageSquare, Music, Video } from "lucide-react";
import { useRouter } from "next/navigation";

const tools = [
  {
    label: "Conversation",
    icon: MessageSquare,
    color: "text-violet-500",
    href: "/conversation",
    bgColor: "bg-violet-500/10",
  },
  {
    label: "Music Generation",
    icon: Music,
    color: "text-emerald-500",
    href: "/music",
    bgColor: "bg-emerald-500/10",
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    color: "text-pink-500",
    href: "/image",
    bgColor: "bg-pink-500/10",
  },
  {
    label: "Video Generation",
    icon: Video,
    color: "text-orange-500",
    href: "/video",
    bgColor: "bg-orange-500/10",
  },
  {
    label: "Code Generation",
    icon: Code,
    color: "text-green-500",
    href: "/code",
    bgColor: "bg-green-500/10",
  },
];

const DashboardPage = () => {

  const router = useRouter();

  return (
    <div>
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center">
          Explore the power of AI
        </h2>
        <p className="text-muted-foreground font-light text-sm md:text-lg text-center">
          Chat with the smartest AI - Experience the power of AI
        </p>
      </div>

      <div className="px-4 md:px-20 lg:px-32 space-y-4">
        {tools.map((tool) => (
          <Card 
            onClick={()=>router.push(tool.href)}
            key={tool.href}
            className="p-4 border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center gap-x-4">
              <tool.icon className={`h-6 w-6 ${tool.color}`} />
              <div className="font-semibold">{tool.label}</div>
            </div>
            {/* <div className="flex items-center gap-x-4">
              <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                <tool.icon className={cn("w-8 h-8",tool.color)}></tool.icon>
              </div>
              <div className="font-semibold">
                {tool.label}
              </div>
            </div> */}
            <ArrowRight />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
