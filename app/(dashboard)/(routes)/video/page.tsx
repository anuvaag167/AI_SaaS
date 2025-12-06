"use client";

import * as z from "zod";
import axios from "axios";
import { Heading } from "@/components/heading";
import { VideoIcon } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { useRouter } from "next/navigation";
import ProModal from "@/components/pro-modal";

const VideoPage = () => {
  const [video, setVideo] = useState<string>();

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
  try {
    setVideo(undefined);

    const response = await axios.post("/api/video", values);

    console.log("API response:", response.data); 
    setVideo(response.data.video);   
    form.reset();
  } //TODO: ProModal
  catch (error: any) {
    const status = error?.response?.status;

    
    if (status === 403) {
      
      setShowProModal(true);
      // don’t log as an error, this is expected behavior
      return;
    }

    // Only log unexpected errors
    console.error("VIDEO GENERATION ERROR", error);
  } finally {
    router.refresh();
  }
};


  return (
    <div>
      
      <ProModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
      />
      <Heading
        title="Video Generation"
        description="Turn your prompt into video"
        icon={VideoIcon}
        iconColor="text-orange-700"
        bgColor="text-orange-700/10"
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
                        placeholder="Clownfish swimming around a coral reef"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
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

        {!video && !isLoading && (
          <div>
            <Empty label="No video generated" />
          </div>
        )}

        {video ?  (
          <video
            className="w-full aspect-video rounded-lg border bg-black mt-8" controls>
            <source src={video} />
          </video>
        ): (
  <p className="text-muted-foreground mt-4">No video generated</p>)}
      </div>
    </div>
  );
}; // ✅ FIXED — closes component properly

export default VideoPage;
