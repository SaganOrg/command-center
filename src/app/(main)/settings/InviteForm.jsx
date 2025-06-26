"use client";
import React, { useState } from "react";
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
import { UserPlus, Mail, User, MailIcon, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function InviteForm({ userRole, userId, assistant }) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/send-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send invitation");
      }

      toast({
        title: "Invitation Sent",
        description: `We've sent an invitation to ${email}`,
      });
      setEmail("");
    } catch (error) {
      console.error("Error sending invite:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send invitation. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssistant = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch("/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ executive_id: userId, assistant_id: assistant.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete assistant");
      }

      toast({
        title: "Assistant Removed",
        description: "The assistant has been successfully removed.",
      });
      setOpenDialog(false);
    } catch (error) {
      console.error("Error deleting assistant:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete assistant. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
            {assistant ? (
              <>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle>Your Assistant</CardTitle>
                  </div>
                  <CardDescription>
                    Details of your assigned assistant
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium">
                          {assistant.full_name || "Assistant"}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MailIcon className="h-4 w-4" />
                          <span>{assistant.email}</span>
                        </div>
                      </div>
                    </div>
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" disabled={isDeleting}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isDeleting ? "Deleting..." : "Delete Assistant"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Assistant Deletion</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this assistant? This action will remove the assistant's access and clear their ID from associated tasks and reports.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setOpenDialog(false)}
                            disabled={isDeleting}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteAssistant}
                            disabled={isDeleting}
                          >
                            {isDeleting ? "Deleting..." : "Confirm"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    <CardTitle>Share Account</CardTitle>
                  </div>
                  <CardDescription>
                    Invite your Executive Assistant to collaborate with you
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
                        The invited user will receive an email with instructions
                        to join your account.
                      </p>
                    </div>
                  </form>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      )}
    </motion.div>
  );
}