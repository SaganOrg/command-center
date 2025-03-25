"use client";
import React, { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const Settings = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [userRole, setUserRole] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Could not verify user. Please log in again.",
        });
        router.push("/login");
        return;
      }
      if (user) {
         const { data, error } = await supabase.from("users").select("*").eq("id", user.id);
                if (error) {
                  toast({
                    variant: "destructive",
                    title: "Not Logged In",
                    description: "Please log in to use voice features.",
                  });
                } if (data[0].role) {
                  setUserRole(data[0].role || null);
                }
      } else {
        toast({
          variant: "destructive",
          title: "Not Logged In",
          description: "Please log in to access reports.",
        });
        router.push("/login");
      }
    };
    fetchUserRole();
  }, [toast]);

  // Function to send email via Brevo REST API
  const sendInviteEmail = async (recipientEmail) => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error fetching user:", error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Could not verify user. Please log in again.",
      });
      return;
    }

    // Normalize the email to lowercase for case-insensitive comparison
    const normalizedEmail = recipientEmail.toLowerCase();

    // Query the users table with a case-insensitive match
    const { data: userFound, error: userFoundError } = await supabase
      .from("users")
      .select("*")
      .ilike("email", normalizedEmail); // Use ilike for case-insensitive matching

    if (userFoundError) {
      console.error("Error fetching user:", userFoundError);
      toast({
        variant: "destructive",
        title: "Error Checking Email",
        description:
          "Could not check if email is registered. Please try again.",
      });
      return;
    }

    // Ensure userFound is an array before checking length
    if (!Array.isArray(userFound)) {
      console.error("userFound is not an array:", userFound);
      toast({
        variant: "destructive",
        title: "Unexpected Error",
        description: "Invalid response from server. Please try again.",
      });
      return;
    }

    // Check if the email is already registered
    if (userFound.length > 0) {
      console.log("Email already registered:", userFound);
      toast({
        variant: "destructive",
        title: "Email Already Registered",
        description: `This email is already registered as an ${userFound[0].role}`,
      });
      return;
    } else {
      const apiKey = process.env.NEXT_PUBLIC_BREVO_API_KEY;
      const signupLink = `https://sagancommandcenter.vercel.app/assistant-signup/${user.id}`; // Replace with your actual signup URL

      const emailData = {
        sender: {
          name: "Sagan",
          email: "jon@getsagan.com", // Replace with your verified sender email
        },
        to: [{ email: recipientEmail, name: "Recipient Name" }],
        subject: "Invitation to Join as an Assistant",
        htmlContent: `
      <p>Hello,</p>
      <p>You’ve been invited to join as an assistant on our platform!</p>
      <p>Please click the link below to sign up:</p>
      <p><a href="${signupLink}">${signupLink}</a></p>
      <p>Best regards,<br>Your Team</p>
    `,
      };

      try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            accept: "application/json",
            "api-key": apiKey,
            "content-type": "application/json",
          },
          body: JSON.stringify(emailData),
        });

        if (response.ok) {
          toast({
            title: "Invitation Sent",
            description: `We've sent an invitation to ${email}`,
          });
          setEmail("");
          return true;
        } else {
          const errorData = await response.json();
          throw new Error(
            `Failed to send email: ${errorData.message || response.statusText}`
          );
        }
      } catch (error) {
        console.error("Error sending email:", error);
        throw error;
      }
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await sendInviteEmail(email);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send invitation. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const [userId, setUserId] = useState(null);


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 md:px-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>
      {userRole === "executive" && (
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <CardTitle>Share Account</CardTitle>
              </div>
              <CardDescription>
                Invite team members to collaborate with you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        placeholder="colleague@example.com"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting || !email}>
                      {isSubmitting ? "Sending..." : "Send Invite"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    The invited user will receive an email with instructions to
                    join your account.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
};

export default Settings;
