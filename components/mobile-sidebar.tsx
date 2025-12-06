"use client";

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet'
import { Menu } from 'lucide-react';
import Sidebar from './sidebar';


interface MobileSidebarProps{
    apiLimitCount: number
}

const MobileSidebar = ({
    apiLimitCount
}: MobileSidebarProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(()=>{
        setIsMounted(true);
    },[]);

    
  return (
    <Sheet>
        <SheetTrigger>
    <Button variant = "ghost" size="icon" className='md:hidden'>
            <Menu />
        </Button>
    </SheetTrigger>
    <SheetContent side="left" className="p-0">
        <Sidebar apiLimitCount = {apiLimitCount}/>
    </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar