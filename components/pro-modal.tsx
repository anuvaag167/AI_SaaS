// components/pro-modal.tsx
"use client";

import { Check, Code, ImageIcon, LayoutDashboard, MessageSquare, Music, Router, Settings, Video, Zap } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import axios from "axios";
import { useState } from "react";

type ProModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ProModal = ({ isOpen, onClose }: ProModalProps) => {
    const [loading, setLoading] = useState(false)
    const onSubscribe = async()=>{
      try {
        setLoading(true)
        const response = axios.get("/api/stripe")
        window.location.href = (await response).data.url
      } catch (error) {
        console.log(error,"STRIPE_CLIENT_ERROR")
      }finally{
        setLoading(false)
      }
    }
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
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center flex-col gap-y-4 pb-2">
            <div className="flex items-center gap-x-2 font-bold py-1">
                Upgrade to Genius
                <Badge variant="premium" className="uppercase text-sm py-1">
                    pro
                </Badge>
            </div>
          </DialogTitle>
          {/* <p > */}
            <div className="text-center pt-2 space-y-2 text-zinc-900 font-medium">
                {tools.map((tool)=>(
                <Card 
                    key={tool.label} 
                    className="p-3 border-black/5 flex items-center justify-between">
                        <div className="flex items-center gap-x-4">
                            <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                                <tool.icon className={cn("w-6 h-6", tool.color)}/>
                            </div>
                            <div className="font-semibold text-sm">
                                {tool.label}
                            </div>
                        </div>
                        <Check className="text-primary w-5 h-5" />
                </Card>
            ))}
            </div>
          {/* </p> */}
        </DialogHeader>
        <DialogFooter>
            <Button 
                onClick={onSubscribe} 
                size = "lg" 
                variant="premium" 
                className="w-full"
            >
                Upgrade
                <Zap className="w-4 h-4 ml-2 fill-white" />
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProModal;
