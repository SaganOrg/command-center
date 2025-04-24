"use client";
import React, { useState, useRef, useEffect } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function VoiceRecorder({ userId, userRole, assistantId, hasOpenAI }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("idle");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (userRole === null) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "Please log in to use voice features.",
      });
      router.push("/login");
    } else if (userRole !== "executive") {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Voice recording is only available for executives.",
      });
    } else if (assistantId === null) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Please add assistant first. Redirecting to settings page ...",
      });
      router.push("/settings");
    }
  }, [userRole, assistantId, toast, router]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setRecordingStatus("recorded");
        transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingStatus("recording");

      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });

      const timeoutId = setTimeout(() => {
        stopRecording();
        console.log("Auto-stopped after 45 seconds");
      }, 45000);

      mediaRecorderRef.current.addEventListener(
        "stop",
        () => clearTimeout(timeoutId),
        { once: true }
      );
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        variant: "destructive",
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);

      toast({
        title: "Recording stopped",
        description: "Processing your audio...",
      });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("userId", userId);

      const response = await fetch("/api/voice", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (
          result.error ===
          "Please add assistant first. Redirecting to settings page ..."
        ) {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: result.error,
          });
          router.push("/settings");
          return;
        }
        throw new Error(result.error || "Failed to process audio");
      }

      toast({
        title: "Task Added",
        description:
          "Your voice note has been transcribed and added to your project board.",
      });

      setRecordingStatus("idle");
    } catch (error) {
      console.error("Error in transcription or task creation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message || "Failed to transcribe or add task. Please try again.",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center items-center my-12"
    >
      <div className="bg-white rounded-lg shadow-sm border border-border/30 p-8 max-w-md w-full flex flex-col items-center">
        <h2 className="text-2xl font-medium mb-6">Voice Recorder</h2>

        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors
                ${isRecording ? "bg-red-600" : "bg-[#2D3B22]"}
                ${isTranscribing ? "animate-pulse" : ""}`}
            >
              {isRecording ? (
                <Square className="h-10 w-10 text-white" />
              ) : (
                <Mic className="h-10 w-10 text-white" />
              )}
            </div>
          </div>
        </div>

        <Button
          className={`w-full ${
            isRecording
              ? "bg-red-600 hover:bg-red-700"
              : "bg-[#2D3B22] hover:bg-[#3c4f2d]"
          } text-white mb-4`}
          onClick={toggleRecording}
          disabled={isTranscribing || userRole !== "executive" || !assistantId}
        >
          {isRecording ? (
            <Square className="mr-2 h-4 w-4" />
          ) : (
            <Mic className="mr-2 h-4 w-4" />
          )}
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>

        {isTranscribing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full mt-4 p-4 bg-gray-50 rounded-md border border-gray-200"
          >
            <p className="text-sm text-gray-500 italic">
              Transcribing and adding task...
            </p>
          </motion.div>
        )}

        <p className="text-center text-muted-foreground mt-4">
          {hasOpenAI
            ? "Tap to record a voice note. It will be transcribed and added as a task."
            : "Tap to record a voice note. Transcription and task creation are currently disabled."}
        </p>
      </div>
    </motion.div>
  );
}