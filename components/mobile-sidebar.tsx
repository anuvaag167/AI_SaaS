import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet'
import { Menu, Sidebar } from 'lucide-react'

const MobileSidebar = () => {
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
        <Sidebar/>
    </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar