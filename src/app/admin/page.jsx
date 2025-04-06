"use client";
import React, { useState, useEffect } from "react";
import AnimatedTransition from "@/components/AnimatedTransition";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AlertCircle, Search, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const Reports = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [reports, setReports] = useState([]);
  const [userId, setUserId] = useState(null);
  const [executiveId, setExecutiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const { toast } = useToast();
  const router = useRouter();

  const ITEMS_PER_PAGE = 10;
  const apiKey = process.env.NEXT_PUBLIC_BREVO_API_KEY;

  // Function to send status update email
  const sendStatusUpdateEmail = async (recipientEmail, newStatus, userId) => {
    const signupLink = `https://commandcenter.getsagan.com/login`;

    const emailData = {
      sender: {
        name: "Sagan",
        email: "jon@getsagan.com",
      },
      to: [{ email: recipientEmail, name: "User" }],
      subject: `Welcome to the Executive Command Center`,
      htmlContent: `
        <p>Hello,</p>
        <p>Your account is now <strong>${newStatus}</strong>.</p>
        ${
          newStatus === "approved"
            ? `<p>Please click the link below to start:</p>
               <p><a href="${signupLink}">${signupLink}</a></p>`
            : ""
        }
        <p>The Command Center is your dedicated workspace for collaborating with your Executive Assistant. Everything you need is in one place - from projects to EOD reports.</p>
<p>If you have any questions or need help, let us know! </p> </br></br>
        <p>Best regards,<br>Sagan Team</p>
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
          title: "Notification Sent",
          description: `Status update email sent to ${recipientEmail}`,
        });
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(
          `Failed to send email: ${errorData.message || response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        variant: "destructive",
        title: "Email Error",
        description: "Failed to send status update email",
      });
      return false;
    }
  };

  // Fetch authenticated user ID and executive_id
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to authenticate user. Please log in again.", {
          duration: 3000,
        });
      } else if (user) {
        const { data: publicUser, error: publicError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id);
        if (publicError) {
          console.error("Error fetching user:", publicError);
          toast.error("Failed to authenticate user. Please log in again.", {
            duration: 3000,
          });
        }
        if (publicUser) {
          const ownerId = publicUser[0].executive_id;
          setExecutiveId(ownerId || null);
          setUserRole(publicUser[0].role);
        }
        setUserId(user.id);
      } else {
        toast.error("No authenticated user found. Please log in.", {
          duration: 3000,
        });
      }
    };
    fetchUser();
  }, []);

  // Fetch users with role "executive" or "admin"
  useEffect(() => {
    const fetchReports = async () => {
      if (!userId) return;

      setLoading(true);
      let query = supabase
        .from("users")
        .select("*")
        .in("role", ["executive", "admin"]);

      if (executiveId) {
        query = query.or(`executive_id.eq.${executiveId}`);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error fetching reports:", error);
        toast.error("Failed to fetch users.", { duration: 3000 });
      } else {
        setReports(data || []);
      }
      setLoading(false);
    };

    fetchReports();
  }, [userId, executiveId]);

  // Handle status update with email notification
  const updateStatus = async (userId, newStatus) => {
    if (userRole !== "executive" && userRole !== "admin") {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Only executives and admins can update status.",
      });
      return;
    }

    const currentReport = reports.find((report) => report.id === userId);
    const currentStatus = currentReport.status || "pending";
    const shouldSendEmail =
      (currentStatus === "pending" &&
        (newStatus === "approved" || newStatus === "rejected")) ||
      (currentStatus === "rejected" && newStatus === "approved");

    const { data, error } = await supabase
      .from("users")
      .update({ status: newStatus })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status",
      });
    } else {
      toast({
        title: "Success",
        description: `User status updated to ${newStatus}`,
      });
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === userId ? { ...report, status: newStatus } : report
        )
      );
      setEditingId(null);

      if (shouldSendEmail) {
        await sendStatusUpdateEmail(currentReport.email, newStatus, userId);
      }
    }
  };

  // Handle role update
  const updateRole = async (userId, newRole) => {
    if (userRole !== "admin") {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Only admins can update roles.",
      });
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update role",
      });
    } else {
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === userId ? { ...report, role: newRole } : report
        )
      );
      setEditingId(null);
    }
  };

  // Filter reports based on search term and active tab
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.full_name &&
        report.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && (report.status || "pending") === activeTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = filteredReports.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center p-8 bg-white border border-border/40 rounded-xl shadow-sm"
      >
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-4"
        >
          <AlertCircle className="h-12 w-12 text-muted-foreground animate-pulse" />
        </motion.div>
        <motion.h3 variants={itemVariants} className="text-xl font-medium mb-2">
          Loading...
        </motion.h3>
        <motion.p variants={itemVariants} className="text-muted-foreground">
          Fetching users...
        </motion.p>
      </motion.div>
    );
  }

  if (!reports.length) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center p-8 bg-background border border-border/40 rounded-xl shadow-sm"
      >
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-4"
        >
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </motion.div>
        <motion.h3 variants={itemVariants} className="text-xl font-medium mb-2">
          No Users Found
        </motion.h3>
        <motion.p variants={itemVariants} className="text-muted-foreground">
          No executive or admin users found in the system.
        </motion.p>
      </motion.div>
    );
  }

  return (
    <AnimatedTransition>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h1 className="mb-4 text-4xl font-medium tracking-tight">
            Dashboard
          </h1>
        </div>

        <div className="max-w-full mx-auto mt-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white shadow-sm rounded-xl border border-border/40 overflow-hidden"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Users</CardTitle>
                <CardDescription>Search users by email or name</CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or name..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue="all"
                  className="w-full"
                  onValueChange={setActiveTab}
                >
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>
                  <TabsContent value={activeTab}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Created At</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedReports.length > 0 ? (
                          paginatedReports.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell className="font-medium">
                                {format(
                                  new Date(report.created_at),
                                  "MMM dd, yyyy"
                                )}
                              </TableCell>
                              <TableCell>{report.email}</TableCell>
                              <TableCell>{report.full_name || "N/A"}</TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    (report.status || "pending") === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : (report.status || "pending") ===
                                        "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {report.status || "pending"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    report.role === "admin"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-purple-100 text-purple-800"
                                  }`}
                                >
                                  {report.role || "executive"}
                                </span>
                              </TableCell>
                              <TableCell>
                                {(userRole === "executive" ||
                                  userRole === "admin") && (
                                  <>
                                    {(report.status || "pending") ===
                                      "pending" && editingId !== report.id ? (
                                      <div className="flex gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            updateStatus(report.id, "approved")
                                          }
                                        >
                                          Approve
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            updateStatus(report.id, "rejected")
                                          }
                                          className="text-red-600 border-red-600 hover:bg-red-50"
                                        >
                                          Reject
                                        </Button>
                                      </div>
                                    ) : editingId === report.id ? (
                                      <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              updateStatus(
                                                report.id,
                                                "approved"
                                              )
                                            }
                                          >
                                            Approve
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              updateStatus(
                                                report.id,
                                                "rejected"
                                              )
                                            }
                                            className="text-red-600 border-red-600 hover:bg-red-50"
                                          >
                                            Reject
                                          </Button>
                                        </div>
                                        {userRole === "admin" && (
                                          <div className="flex gap-2">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                updateRole(report.id, "admin")
                                              }
                                              disabled={report.role === "admin"}
                                            >
                                              Set Admin
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                updateRole(
                                                  report.id,
                                                  "executive"
                                                )
                                              }
                                              disabled={
                                                report.role === "executive"
                                              }
                                            >
                                              Set Executive
                                            </Button>
                                          </div>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setEditingId(null)}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center gap-1"
                                        onClick={() => setEditingId(report.id)}
                                      >
                                        <Edit className="h-4 w-4" />
                                        <span>Edit</span>
                                      </Button>
                                    )}
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center py-4 text-muted-foreground"
                            >
                              No users match your search criteria.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>

                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              currentPage > 1 &&
                              handlePageChange(currentPage - 1)
                            }
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>

                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageToShow;

                            if (totalPages <= 5) {
                              pageToShow = i + 1;
                            } else if (currentPage <= 3) {
                              if (i < 4) {
                                pageToShow = i + 1;
                              } else {
                                pageToShow = totalPages;
                              }
                            } else if (currentPage >= totalPages - 2) {
                              if (i === 0) {
                                pageToShow = 1;
                              } else {
                                pageToShow = totalPages - (4 - i);
                              }
                            } else {
                              if (i === 0) {
                                pageToShow = 1;
                              } else if (i === 4) {
                                pageToShow = totalPages;
                              } else {
                                pageToShow = currentPage + (i - 2);
                              }
                            }

                            if (
                              (i === 1 && pageToShow !== 2) ||
                              (i === 3 && pageToShow !== totalPages - 1)
                            ) {
                              return (
                                <PaginationItem key={`ellipsis-${i}`}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }

                            return (
                              <PaginationItem key={pageToShow}>
                                <PaginationLink
                                  isActive={currentPage === pageToShow}
                                  onClick={() => handlePageChange(pageToShow)}
                                >
                                  {pageToShow}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                        )}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              currentPage < totalPages &&
                              handlePageChange(currentPage + 1)
                            }
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default Reports;
