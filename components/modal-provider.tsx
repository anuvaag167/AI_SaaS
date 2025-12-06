// "use client";

// import { useEffect, useState } from "react";
// import ProModal from "./pro-modal";

// export const ModalProvider = () => {
//   const [isMounted, setIsMounted] = useState(false);
//   const [isOpen, setIsOpen] = useState(false); // 👈 add state

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   if (!isMounted) return null;

//   return (
//     <>
//       <ProModal
//         isOpen={isOpen}
//         onClose={() => setIsOpen(false)}
//       />
//     </>
//   );
// };
// components/modal-provider.tsx
"use client";

export const ModalProvider = () => null;
