'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Send, Calendar as CalendarIcon, ArrowLeft, ArrowRight, Info, Eye, AlertCircle, Search } from 'lucide-react';
import { format, isAfter, isBefore, subDays, startOfDay, isEqual } from 'date-fns';
import AnimatedTransition from '@/components/AnimatedTransition';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { checkExistingReport, submitReport } from './reports-actions';

export default function ReportsClient({
  userRole,
  userId,
  executiveId,
  initialReportData,
  initialReportDates,
  initialReports,
}) {
  // ReportForm Logic
  const today = format(new Date(), 'yyyy-MM-dd');
  const sanitizeBusynessLevel = (value) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? '5' : parsed.toString();
  };

  const [formData, setFormData] = useState({
    date: today,
    completedTasks: '',
    outstandingTasks: '',
    needFromManager: '',
    tomorrowPlans: '',
    busynessLevel: '5',
  });
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('form');
  const [reportExists, setReportExists] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasShownRangeDialog, setHasShownRangeDialog] = useState(false);
  const [errors, setErrors] = useState({});
  const [reportDates, setReportDates] = useState(new Set(initialReportDates));

  const sevenDaysAgo = subDays(startOfDay(new Date()), 7);

  useEffect(() => {
    if (initialReportData) {
      setReportExists(true);
      setViewMode('view');
      setFormData({
        date: initialReportData.date,
        completedTasks: initialReportData.completed_task || '',
        outstandingTasks: initialReportData.outstanding_task || '',
        needFromManager: initialReportData.need_from_manager || '',
        tomorrowPlans: initialReportData.tomorrows_plan || '',
        busynessLevel: sanitizeBusynessLevel(initialReportData.business_level),
      });
    }
  }, [initialReportData]);

  useEffect(() => {
    const checkExistingReportAsync = async () => {
      if (selectedDate && userId) {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        try {
          const existingReport = await checkExistingReport(formattedDate, userId);
          setReportExists(!!existingReport);

          if (existingReport) {
            setViewMode('view');
            setFormData({
              date: existingReport.date,
              completedTasks: existingReport.completed_task || '',
              outstandingTasks: existingReport.outstanding_task || '',
              needFromManager: existingReport.need_from_manager || '',
              tomorrowPlans: existingReport.tomorrows_plan || '',
              busynessLevel: sanitizeBusynessLevel(existingReport.business_level),
            });
          } else {
            setViewMode('form');
            resetFormData(formattedDate);
          }
        } catch (error) {
          console.error('Error checking existing report:', error);
          toast.error('Failed to check existing report.', { duration: 3000 });
        }
      }
    };
    checkExistingReportAsync();
  }, [selectedDate, userId]);

  const resetFormData = (date) => {
    setFormData({
      date: date,
      completedTasks: '',
      outstandingTasks: '',
      needFromManager: '',
      tomorrowPlans: '',
      busynessLevel: '5',
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSliderChange = (value) => {
    let selectedValue = value[0];
    if (selectedValue === 7) {
      const previousValue = parseInt(formData.busynessLevel);
      selectedValue = previousValue < 7 ? 6 : 8;
    }
    setFormData((prev) => ({ ...prev, busynessLevel: selectedValue.toString() }));
  };

  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
      setShowCalendar(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.completedTasks.trim())
      newErrors.completedTasks = 'Completed tasks is required';
    if (!formData.outstandingTasks.trim())
      newErrors.outstandingTasks = 'Outstanding tasks is required';
    if (!formData.needFromManager.trim())
      newErrors.needFromManager = 'Need from manager is required';
    if (!formData.tomorrowPlans.trim())
      newErrors.tomorrowPlans = "Tomorrow's plans is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields', { duration: 3000 });
      return;
    }
    if (!userId) {
      toast.error('No authenticated user found. Please log in.', {
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    const currentDate = format(selectedDate, 'yyyy-MM-dd');

    try {
      const data = await submitReport(formData, userId, executiveId, reportExists);

      toast.success(reportExists ? 'Report updated successfully' : 'Report submitted successfully', { duration: 3000 });
      setReportExists(true);
      setViewMode('view');
      setFormData({
        date: data.date,
        completedTasks: data.completed_task,
        outstandingTasks: data.outstanding_task,
        needFromManager: data.need_from_manager,
        tomorrowPlans: data.tomorrows_plan,
        busynessLevel: sanitizeBusynessLevel(data.business_level),
      });
      if (!reportExists) {
        setReportDates((prev) => new Set(prev).add(currentDate));
      }
    } catch (error) {
      console.error(`Error ${reportExists ? 'updating' : 'submitting'} report:`, error);
      toast.error(`Failed to ${reportExists ? 'update' : 'submit'} report: ${error.message}`, {
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const goToToday = () => {
    const nowDate = new Date();
    setSelectedDate(nowDate);
  };

  const moveDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const dayContent = (day) => {
    const hasReport = reportDates.has(format(day, 'yyyy-MM-dd'));
    return (
      <div className={`${hasReport ? 'font-bold' : 'font-normal'}`}>
        {day.getDate()}
      </div>
    );
  };

  const getBusynessLabel = (level) => {
    const levelNum = parseInt(level);
    if (levelNum <= 3) return 'Light day';
    if (levelNum <= 6) return 'Moderate';
    if (levelNum === 7) return null;
    return 'Very busy';
  };

  const formVariants = {
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

  const isDateWithinSubmissionRange =
    !isBefore(selectedDate, sevenDaysAgo) && !isAfter(selectedDate, new Date());
  const isToday = isEqual(startOfDay(selectedDate), startOfDay(new Date()));
  const showFormattedDate = format(selectedDate, 'MMM dd, yyyy');

  // ReportHistory Logic
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState(initialReports);
  const [historyLoading, setHistoryLoading] = useState(false);

  const ITEMS_PER_PAGE = 5;

  const filteredReports = reports
    .filter(
      (report) =>
        format(new Date(report.date), 'yyyy-MM-dd').includes(searchTerm) ||
        report.completed_task?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.status?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = filteredReports.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const hasReports = reports.length > 0;

  const viewReport = (report) => {
    setSelectedReport(report);
  };

  const closeReport = () => {
    setSelectedReport(null);
  };

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderReportForm = () => (
    <motion.form
      initial="hidden"
      animate="visible"
      variants={formVariants}
      onSubmit={handleSubmit}
      className="space-y-6 bg-white shadow-sm rounded-xl border border-border/40 p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center justify-between">
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-medium">End-of-Day Report</h3>
          <p className="text-muted-foreground mt-1">
            {viewMode === 'view'
              ? 'Viewing report for'
              : 'Creating report for'}{' '}
            {showFormattedDate}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-2 items-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => moveDate(-1)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Previous day</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCalendar(true)}
            className="flex items-center gap-2 h-9"
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="h-9"
          >
            Today
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => moveDate(1)}
            className="h-9 w-9"
          >
            <ArrowRight className="h-4 w-4" />
            <span className="sr-only">Next day</span>
          </Button>
        </motion.div>
      </div>

      {viewMode === 'view' && reportExists ? (
        <div className="space-y-6">
          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="text-muted-foreground">Busyness Level</Label>
            <p className="text-lg font-medium">
              {getBusynessLabel(formData.busynessLevel) || 'Moderate'}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="text-muted-foreground">Completed Tasks</Label>
            <p className="text-base">{formData.completedTasks}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="text-muted-foreground">Outstanding Tasks</Label>
            <p className="text-base">{formData.outstandingTasks}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="text-muted-foreground">Need from Manager</Label>
            <p className="text-base">{formData.needFromManager}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="text-muted-foreground">Tomorrow's Plans</Label>
            <p className="text-base">{formData.tomorrowPlans}</p>
          </motion.div>

          {isDateWithinSubmissionRange && (
            <motion.div variants={itemVariants} className="flex justify-end pt-2">
              <Button type="button" onClick={() => setViewMode('form')}>
                Edit Report
              </Button>
            </motion.div>
          )}
        </div>
      ) : (
        <>
          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="completedTasks" className="flex items-center">
              Completed Tasks <span className="text-destructive ml-1">*</span>
            </Label>
            <Textarea
              id="completedTasks"
              name="completedTasks"
              value={formData.completedTasks}
              onChange={handleChange}
              placeholder="What did you accomplish today?"
              className={`min-h-24 resize-none ${
                errors.completedTasks ? 'border-destructive' : ''
              }`}
              disabled={viewMode === 'view'}
              required
            />
            {errors.completedTasks && (
              <p className="text-destructive text-sm">
                {errors.completedTasks}
              </p>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="outstandingTasks" className="flex items-center">
              Outstanding Tasks <span className="text-destructive ml-1">*</span>
            </Label>
            <Textarea
              id="outstandingTasks"
              name="outstandingTasks"
              value={formData.outstandingTasks}
              onChange={handleChange}
              placeholder="What tasks are still in progress or pending?"
              className={`min-h-24 resize-none ${
                errors.outstandingTasks ? 'border-destructive' : ''
              }`}
              disabled={viewMode === 'view'}
              required
            />
            {errors.outstandingTasks && (
              <p className="text-destructive text-sm">
                {errors.outstandingTasks}
              </p>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="needFromManager" className="flex items-center">
              Need from Manager <span className="text-destructive ml-1">*</span>
            </Label>
            <Textarea
              id="needFromManager"
              name="needFromManager"
              value={formData.needFromManager}
              onChange={handleChange}
              placeholder="What do you need from your manager to move forward?"
              className={`min-h-24 resize-none ${
                errors.needFromManager ? 'border-destructive' : ''
              }`}
              disabled={viewMode === 'view'}
              required
            />
            {errors.needFromManager && (
              <p className="text-destructive text-sm">
                {errors.needFromManager}
              </p>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="tomorrowPlans" className="flex items-center">
              Tomorrow's Plans <span className="text-destructive ml-1">*</span>
            </Label>
            <Textarea
              id="tomorrowPlans"
              name="tomorrowPlans"
              value={formData.tomorrowPlans}
              onChange={handleChange}
              placeholder="What are your priorities for tomorrow?"
              className={`min-h-24 resize-none ${
                errors.tomorrowPlans ? 'border-destructive' : ''
              }`}
              disabled={viewMode === 'view'}
              required
            />
            {errors.tomorrowPlans && (
              <p className="text-destructive text-sm">{errors.tomorrowPlans}</p>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <div className="space-y-2">
              <Label>Busyness Level: {formData.busynessLevel}</Label>
              <Slider
                defaultValue={[5]}
                value={[parseInt(formData.busynessLevel) || 5]}
                onValueChange={handleSliderChange}
                max={10}
                min={1}
                step={1}
                className="py-4"
                disabled={viewMode === 'view'}
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>Light day (1)</span>
                <span>Very busy (10)</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex justify-end pt-2"
          >
            <div className="flex flex-col gap-2 w-full">
              {!isDateWithinSubmissionRange && (
                <div className="flex items-center gap-2 text-muted-foreground bg-accent p-2 rounded mb-2 w-full">
                  <Info className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">
                    Reports can only be submitted or edited for dates within the
                    last 7 days
                  </span>
                </div>
              )}
              <div className="flex justify-end gap-2">
                {reportExists && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setViewMode('view')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={loading || !isDateWithinSubmissionRange || !userId}
                >
                  <Send className="w-4 h-4" />
                  {reportExists ? 'Save Changes' : 'Submit Report'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </motion.form>
  );

  const renderReportHistory = () => {
    if (historyLoading) {
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
          <motion.h3 variants={itemVariants} className="text-xl font-medium mb-2">
            Loading...
          </motion.h3>
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
          <motion.h3 variants={itemVariants} className="text-xl font-medium mb-2">
            No Reports Found
          </motion.h3>
          <motion.p variants={itemVariants} className="text-muted-foreground">
            Your assistant hasn't submitted any reports yet. Create your first
            report to see it here.
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
              <motion.h3
                variants={itemVariants}
                className="text-xl font-medium"
              >
                Report Details
              </motion.h3>
              <motion.p
                variants={itemVariants}
                className="text-muted-foreground"
              >
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
            <p className="text-lg">
              {getBusynessLabel(selectedReport.business_level?.toString() || '5')}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <h4 className="font-medium text-muted-foreground">Completed Tasks</h4>
            <p>{selectedReport.completed_task}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <h4 className="font-medium text-muted-foreground">
              Outstanding Tasks
            </h4>
            <p>{selectedReport.outstanding_task}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <h4 className="font-medium text-muted-foreground">
              Need from Manager
            </h4>
            <p>{selectedReport.need_from_manager}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <h4 className="font-medium text-muted-foreground">
              Tomorrow's Plans
            </h4>
            <p>{selectedReport.tomorrows_plan}</p>
          </motion.div>
        </motion.div>
      );
    }

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white shadow-sm rounded-xl border border-border/40 overflow-hidden"
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Your Reports</CardTitle>
            <CardDescription>
              Your Assistant's Previously Generated Reports
            </CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Busyness</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReports.length > 0 ? (
                  paginatedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {format(new Date(report.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {getBusynessLabel(
                          report.business_level?.toString() || '5'
                        )}
                      </TableCell>
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
                    <TableCell
                      colSpan={4}
                      className="text-center py-4 text-muted-foreground"
                    >
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
                        onClick={() =>
                          currentPage > 1 && handlePageChange(currentPage - 1)
                        }
                        className={
                          currentPage === 1
                            ? 'pointer-events-none opacity-50'
                            : ''
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
                            ? 'pointer-events-none opacity-50'
                            : ''
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
    );
  };

  return (
    <AnimatedTransition>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h1 className="mb-4 text-4xl font-medium tracking-tight">
            End-of-Day Reports
          </h1>
          {userRole === 'assistant' && (
            <p className="text-muted-foreground text-lg">
              Summarize your day, stay aligned, and plan effectively.
              <br />
              <span className="text-sm font-medium mt-1 inline-block">
                Reports can be viewed for any date but can only be submitted for
                the current day and up to 7 days in the past.
                <span className="text-destructive ml-1">
                  All fields are required.
                </span>
              </span>
            </p>
          )}
        </div>

        <div className="max-w-3xl mx-auto mt-8">
          {userRole === null ? (
            <p className="text-center text-muted-foreground">
              Loading user role...
            </p>
          ) : (
            <>
              {userRole === 'assistant' && renderReportForm()}
              {userRole === 'executive' && renderReportHistory()}
            </>
          )}
        </div>

        <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Select Date</DialogTitle>
              <DialogDescription>
                Choose a date to view or create a report
              </DialogDescription>
            </DialogHeader>
            <div className="p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border pointer-events-auto mx-auto"
                components={{
                  DayContent: ({ date }) => dayContent(date),
                }}
              />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setHasShownRangeDialog(true);
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Date Out of Range</DialogTitle>
              <DialogDescription>
                Reports can only be submitted or edited for dates within the last
                7 days
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-center">
              <p className="text-muted-foreground mb-4">
                You can view reports for any date, but new reports or edits can
                only be made for dates within the last 7 days.
              </p>
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  setHasShownRangeDialog(true);
                }}
              >
                I Understand
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedTransition>
  );
}