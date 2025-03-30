"use client"

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Eye, AlertCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion'; // Ensure framer-motion is imported
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ReportHistory= () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState([]);
  const [userId, setUserId] = useState(null);
  const [executiveId, setExecutiveId] = useState(null); // To store owner_id
  const [loading, setLoading] = useState(true);
  
  const ITEMS_PER_PAGE = 5;

  // Fetch authenticated user ID and owner_id from user_metadata on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to authenticate user. Please log in again.', { duration: 3000 });
      } else if (user) {
        const { data: publicUser, error: publicError } = await supabase.from("users").select("*").eq("id", user.id);
        if (publicError) {
          console.error('Error fetching user:', error);
        toast.error('Failed to authenticate user. Please log in again.', { duration: 3000 });
        }
        if (publicUser) {
          const ownerId = publicUser[0].executive_id;
        if (ownerId) {
          setExecutiveId(ownerId);
        } else {
          console.warn('No owner_id found in user_metadata');
          toast.warning('No executive ID found. Only your own reports will be shown.', { duration: 3000 });
          setExecutiveId(null);
        }
        }
        setUserId(user.id);
        
      } else {
        toast.error('No authenticated user found. Please log in.', { duration: 3000 });
      }
    };
    fetchUser();
  }, []);

  // Fetch reports based on user_id and executive_id
  useEffect(() => {
    const fetchReports = async () => {
      if (!userId) return;

      setLoading(true);
      let query = supabase
        .from('reports')
        .select('*')
        .eq('executive_id', userId); // Fetch reports where the user is the assistant

      // If executiveId exists, also fetch reports where the user is the executive
      if (executiveId) {
        query = query.or(`executive_id.eq.${executiveId}`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        toast.error('Failed to fetch report history.', { duration: 3000 });
      } else {
        setReports(data || []);
      }
      setLoading(false);
    };

    fetchReports();
  }, [userId, executiveId]);

  // Filter reports based on search term
  const filteredReports = reports
    .filter(report => 
      format(new Date(report.date), 'yyyy-MM-dd').includes(searchTerm) ||
      report.completed_task?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.status?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Check if there are any reports
  const hasReports = reports.length > 0;

  const viewReport = (report) => {
    setSelectedReport(report);
  };

  const closeReport = () => {
    setSelectedReport(null);
  };

  const getBusynessLabel = (level) => {
    const levelNum = parseInt(level);
    if (levelNum <= 3) return "Light day";
    if (levelNum <= 6) return "Moderate";
    return "Very busy";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
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
        className="text-center p-8 bg-background border border-border/40 rounded-xl shadow-sm"
      >
        <motion.div variants={itemVariants} className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground animate-pulse" />
        </motion.div>
        <motion.h3 variants={itemVariants} className="text-xl font-medium mb-2">Loading...</motion.h3>
        <motion.p variants={itemVariants} className="text-muted-foreground">
          Fetching your report history.
        </motion.p>
      </motion.div>
    );
  }

  if (!hasReports) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center p-8 bg-background border border-border/40 rounded-xl shadow-sm"
      >
        <motion.div variants={itemVariants} className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </motion.div>
        <motion.h3 variants={itemVariants} className="text-xl font-medium mb-2">No Reports Found</motion.h3>
        <motion.p variants={itemVariants} className="text-muted-foreground">
          Your assistant haven't submitted any reports yet. Create your first report to see it here.
        </motion.p>
      </motion.div>
    );
  }

  if (selectedReport) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 bg-white shadow-sm rounded-xl border border-border/40 p-6 md:p-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <motion.h3 variants={itemVariants} className="text-xl font-medium">
              Report Details
            </motion.h3>
            <motion.p variants={itemVariants} className="text-muted-foreground">
              {format(new Date(selectedReport.date), 'MMMM dd, yyyy')}
            </motion.p>
          </div>
          <motion.div variants={itemVariants}>
            <Button onClick={closeReport} variant="outline">
              Back to List
            </Button>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="space-y-2 mt-6">
          <h4 className="font-medium text-muted-foreground">Busyness Level</h4>
          <p className="text-lg">{getBusynessLabel(selectedReport.business_level?.toString() || '5')}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <h4 className="font-medium text-muted-foreground">Completed Tasks</h4>
          <p>{selectedReport.completed_task}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <h4 className="font-medium text-muted-foreground">Outstanding Tasks</h4>
          <p>{selectedReport.outstanding_task}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <h4 className="font-medium text-muted-foreground">Need from Manager</h4>
          <p>{selectedReport.need_from_manager}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <h4 className="font-medium text-muted-foreground">Tomorrow's Plans</h4>
          <p>{selectedReport.tomorrows_plan}</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div // Changed from div to motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white shadow-sm rounded-xl border border-border/40 overflow-hidden"
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Your Reports</CardTitle>
          <CardDescription>Your Assistant's Previously Generated Reports</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {/* <TableHead>Status</TableHead> */}
                <TableHead>Busyness</TableHead>
                {/* <TableHead className="text-right">Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReports.length > 0 ? (
                paginatedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {format(new Date(report.date), 'MMM dd, yyyy')}
                    </TableCell>
                    {/* <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'Reviewed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {report.status || 'Pending'}
                      </span>
                    </TableCell> */}
                    <TableCell>{getBusynessLabel(report.business_level?.toString() || '5')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => viewReport(report)}
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No reports match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
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
                    
                    if ((i === 1 && pageToShow !== 2) || (i === 3 && pageToShow !== totalPages - 1)) {
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
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReportHistory;