// app/(dashboard)/(routes)/code/page.tsx
"use client";

import React, { useState } from "react";
import * as z from "zod";
import axios from "axios";

import { Code, Divide } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Heading } from "@/components/heading";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import { cn } from "@/lib/utils";

import ReactMarkdown from "react-markdown";

import type OpenAI from "openai";

// -------- schema --------
const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

// messages type
type ChatMessage = OpenAI.ChatCompletionMessageParam;

const CodePage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: "" },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: ChatMessage = {
        role: "user",
        content: values.prompt,
      };

      const newMessages = [...messages, userMessage];

      const res = await axios.post<ChatMessage>("/api/code", {
        messages: newMessages,
      });

      const assistantMessage = res.data; // { role: 'assistant', content: '```...```' }

      setMessages([...newMessages, assistantMessage]);
      form.reset();
    } catch (error) {
      console.error("CODE_GENERATION_ERROR", error);
    }
  };

  return (
    <div>
      <Heading
        title="Code Generation"
        description="Generate code using descriptive text"
        icon={Code}
        iconColor="text-green-500"
        bgColor="bg-green-500/10"
      />

      {/* input form */}
      <div className="px-4 lg:px-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Input
                      disabled={isLoading}
                      placeholder="Simple toggle button using React hooks"
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="col-span-12 lg:col-span-2 w-full"
            >
              Generate
            </Button>
          </form>
        </Form>
      </div>

      {/* messages section */}
      <div className="space-y-4 mt-4 px-4 lg:px-8 pb-8">
        {/* loader bubble */}
        {isLoading && (
          <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
            <Loader />
          </div>
        )}

        {/* empty state */}
        {!isLoading && messages.length === 0 && (
          <Empty label="No code generated yet." />
        )}

        {/* chat bubbles */}
        <div className="flex flex-col-reverse gap-y-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "p-8 w-full flex items-start gap-x-8 rounded-lg border border-black/10",
                message.role === "user" ? "bg-white" : "bg-muted"
              )}
            >
              {/* avatar */}
              {message.role === "user" ? <UserAvatar /> : <BotAvatar />}

              {/* text content */}
              <div className="text-sm overflow-hidden leading-7 ">
              <ReactMarkdown components={{
                pre: ({node,...props})=>(
                  <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg">
                    <pre {...props}/>
                  </div>
                ),
                code:({node, ...props})=>(
                  <code className="bg-black/10 rounded-lg p-1" {...props} />
                )
              }} 
              >
                {typeof message.content === "string"
                  ? message.content
                  : JSON.stringify(message.content)}
              </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CodePage;
