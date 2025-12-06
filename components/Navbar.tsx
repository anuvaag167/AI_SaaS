"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

const MobileSidebar = ({ apiLimitCount }: { apiLimitCount: number }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          // 👇 only change: move it to the right so it lines up with the sidebar icons
          className="md:hidden ml-2"
        >
          <Menu className="w-20 h-20" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0">
        <SheetHeader>
          {/* keep title empty so no 'Navigation' text */}
          <SheetTitle />
        </SheetHeader>

        <Sidebar apiLimitCount={apiLimitCount} />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
