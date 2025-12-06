// app/(dashboard)/(routes)/conversation/page.tsx

"use client";

import * as z from "zod";
import axios from "axios";
import { Heading } from "@/components/heading";
import { MessageSquare } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import { useRouter } from "next/navigation";
import ProModal from "@/components/pro-modal"; // 👈 added

// 1) Simple UI message type
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const ConversationPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  //TODO: ProModal
  const [showProModal, setShowProModal] = useState(false); 

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;
  

  // const onSubmit = async (values: z.infer<typeof formSchema>) => {
  //   try {
  //     const userMessage: ChatMessage = {
  //       role: "user",
  //       content: values.prompt,
  //     };

  //     const response = await axios.post("/api/conversation", {
  //       messages: [...messages, userMessage],
  //     });

  //     const assistantMessage: ChatMessage = {
  //       role: "assistant",
  //       content: response.data.reply,
  //     };

  //     setMessages((current) => [...current, userMessage, assistantMessage]);
  //     form.reset();
  //   } catch (error: any) {
  //     console.error("CONVERSATION ERROR", error);

  //     const status =
  //       error?.response?.status ??
  //       error?.status ??
  //       (error?.code === "ERR_BAD_REQUEST"
  //         ? error?.response?.status
  //         : undefined);

  //     if (status === 403) {
  //       // 🟣 Open the upgrade modal
  //       setShowProModal(true);
  //     } else {
  //       console.log("Non-403 error", error);
  //     }
  //   } finally {
  //     router.refresh();
  //   }
  // };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
  try {
    const userMessage: ChatMessage = {
      role: "user",
      content: values.prompt,
    };

    const response = await axios.post("/api/conversation", {
      messages: [...messages, userMessage],
    });

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: response.data.reply,
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    form.reset();
  } 
  //TODO: ProModal
  catch (error: any) {
    const status = error?.response?.status;

    
    if (status === 403) {
      
      setShowProModal(true);
      // don’t log as an error, this is expected behavior
      return;
    }

    // Only log unexpected errors
    console.error("CONVERSATION ERROR", error);
  } finally {
    router.refresh();
  }
};


  return (
    <div>
      {/* TODO: ProModal */}
      <ProModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
      />

      <Heading
        title="Conversation"
        description="Our most advanced conversation model"
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />

      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-lg border w-full p-4 px-3 md:px-3 focus-within:shadow-sm grid grid-cols-12 gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="How do I calculate the area of a circle?"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                className="col-span-12 lg:col-span-2 w-full"
                disabled={isLoading}
              >
                Generate
              </Button>
            </form>
          </Form>
        </div>
      </div>

      <div className="space-y-4 mt-4">
        {isLoading && (
          <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
            <Loader />
          </div>
        )}
        {messages.length === 0 && !isLoading && (
          <div>
            <Empty label="No conversation started" />
          </div>
        )}
        <div className="flex flex-col-reverse gap-y-4">
          {messages.map((message) => (
            <div
              key={message.content}
              className={cn(
                "p-8 w-full flex items-start gap-x-8 rounded-lg",
                message.role === "user"
                  ? "bg-white border border-black/19"
                  : "bg-muted"
              )}
            >
              {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
              <p className="TEXT-SM">{message.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
