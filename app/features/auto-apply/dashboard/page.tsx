"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  auth,
  getUserProfile,
  saveUserProfile,
} from "@/lib/firebaseConfig/firebaseConfig";
import {
  Play,
  Pause,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Target,
  Zap,
  BarChart3,
} from "lucide-react";
import Head from "next/head";
import Link from "next/link";

interface AutoApplyStats {
  totalApplications: number;
  todayApplications: number;
  successRate: number;
  pendingApplications: number;
  rejectedApplications: number;
  interviewRequests: number;
  lastRunTime: string;
  isRunning: boolean;
}

interface RecentApplication {
  id: string;
  jobTitle: string;
  company: string;
  platform: string;
  appliedAt: string;
  status: "pending" | "success" | "failed";
  salary?: string;
  location?: string;
}

export default function AutoApplyDashboard() {
  const [autoApplySettings, setAutoApplySettings] = useState<any>(null);
  const [stats, setStats] = useState<AutoApplyStats>({
    totalApplications: 0,
    todayApplications: 0,
    successRate: 0,
    pendingApplications: 0,
    rejectedApplications: 0,
    interviewRequests: 0,
    lastRunTime: "",
    isRunning: false,
  });
  const [recentApplications, setRecentApplications] = useState<
    RecentApplication[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const profile: any = await getUserProfile(user.uid);
        setAutoApplySettings(profile.autoApplySettings);

        // Load stats from API or Firebase
        // This would typically come from your backend
        setStats({
          totalApplications: 156,
          todayApplications: 12,
          successRate: 78,
          pendingApplications: 23,
          rejectedApplications: 8,
          interviewRequests: 5,
          lastRunTime: new Date().toISOString(),
          isRunning: profile.autoApplySettings?.isEnabled || false,
        });

        // Mock recent applications
        setRecentApplications([
          {
            id: "1",
            jobTitle: "Senior Software Engineer",
            company: "TechCorp",
            platform: "Naukri",
            appliedAt: new Date().toISOString(),
            status: "success",
            salary: "15-20 LPA",
            location: "Bangalore",
          },
          {
            id: "2",
            jobTitle: "Full Stack Developer",
            company: "StartupXYZ",
            platform: "Hirist",
            appliedAt: new Date(Date.now() - 3600000).toISOString(),
            status: "pending",
            salary: "12-18 LPA",
            location: "Remote",
          },
          // Add more mock data...
        ]);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoApply = async () => {
    try {
      const user = auth.currentUser;
      if (user && autoApplySettings) {
        const newSettings = {
          ...autoApplySettings,
          isEnabled: !autoApplySettings.isEnabled,
          updatedAt: new Date().toISOString(),
        };

        await saveUserProfile(user.uid, { autoApplySettings: newSettings });
        setAutoApplySettings(newSettings);
        setStats((prev) => ({ ...prev, isRunning: newSettings.isEnabled }));
      }
    } catch (error) {
      console.error("Error toggling auto-apply:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-400";
      case "failed":
        return "text-red-400";
      case "pending":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020218] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!autoApplySettings) {
    return (
      <>
        <Head>
          <title>Auto-Apply Dashboard - AiPply</title>
        </Head>
        <SidebarProvider
          style={{ "--sidebar-width": "19rem" } as React.CSSProperties}
        >
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4 bg-[#020218] text-white">
              <div className="text-center py-16">
                <Zap className="w-16 h-16 mx-auto mb-6 text-[#20CEB6]" />
                <h1 className="text-3xl font-bold mb-4">
                  Auto-Apply Not Set Up
                </h1>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Set up your auto-apply preferences to start automatically
                  applying to jobs that match your criteria.
                </p>
                <Link href="/dashboard/auto-apply/setup">
                  <Button className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC]">
                    Set Up Auto-Apply
                  </Button>
                </Link>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Auto-Apply Dashboard - AiPply</title>
      </Head>
      <SidebarProvider
        style={{ "--sidebar-width": "19rem" } as React.CSSProperties}
      >
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-6 p-6 bg-[#020218] text-white">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Auto-Apply Dashboard</h1>
                <p className="text-gray-400">
                  Monitor and manage your automated job applications
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Auto-Apply</span>
                  <Switch
                    checked={stats.isRunning}
                    onCheckedChange={toggleAutoApply}
                  />
                  <Badge variant={stats.isRunning ? "default" : "secondary"}>
                    {stats.isRunning ? "Active" : "Paused"}
                  </Badge>
                </div>
                <Link href="/dashboard/auto-apply/setup">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Applications
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalApplications}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.todayApplications} today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Success Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.successRate}%</div>
                  <Progress value={stats.successRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.pendingApplications}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting response
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Interviews
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.interviewRequests}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Interview requests
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="applications">
                  Recent Applications
                </TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Quick Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Status Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Auto-Apply Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Status</span>
                        <Badge
                          variant={stats.isRunning ? "default" : "secondary"}
                        >
                          {stats.isRunning ? "Running" : "Paused"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Daily Limit</span>
                        <span>{autoApplySettings.maxApplicationsPerDay}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Today's Progress</span>
                        <span>
                          {stats.todayApplications}/
                          {autoApplySettings.maxApplicationsPerDay}
                        </span>
                      </div>
                      <Progress
                        value={
                          (stats.todayApplications /
                            autoApplySettings.maxApplicationsPerDay) *
                          100
                        }
                        className="mt-2"
                      />
                      <div className="text-sm text-gray-400">
                        Last run: {new Date(stats.lastRunTime).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        onClick={toggleAutoApply}
                        className="w-full"
                        variant={stats.isRunning ? "destructive" : "default"}
                      >
                        {stats.isRunning ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause Auto-Apply
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Auto-Apply
                          </>
                        )}
                      </Button>
                      <Link href="/dashboard/auto-apply/setup">
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Modify Settings
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Full Analytics
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Current Settings Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Current Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-gray-300">
                          Job Titles
                        </p>
                        <p>
                          {autoApplySettings.jobTitles?.join(", ") || "None"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-300">Locations</p>
                        <p>
                          {autoApplySettings.locations?.join(", ") || "None"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-300">Platforms</p>
                        <p>
                          {autoApplySettings.platforms?.join(", ") || "None"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-300">
                          Salary Range
                        </p>
                        <p>
                          {autoApplySettings.salaryRange?.min}-
                          {autoApplySettings.salaryRange?.max} LPA
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentApplications.map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center justify-between p-4 border border-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex items-center gap-2 ${getStatusColor(
                                app.status
                              )}`}
                            >
                              {getStatusIcon(app.status)}
                            </div>
                            <div>
                              <h3 className="font-semibold">{app.jobTitle}</h3>
                              <p className="text-sm text-gray-400">
                                {app.company} • {app.platform}
                              </p>
                              <p className="text-xs text-gray-500">
                                {app.location} • {app.salary}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                app.status === "success"
                                  ? "default"
                                  : app.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {app.status}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="text-center py-16">
                  <BarChart3 className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-4">
                    Analytics Coming Soon
                  </h3>
                  <p className="text-gray-400">
                    Detailed analytics and insights about your auto-apply
                    performance will be available here.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Auto-Apply Enabled</h3>
                        <p className="text-sm text-gray-400">
                          Enable or disable auto-apply functionality
                        </p>
                      </div>
                      <Switch
                        checked={stats.isRunning}
                        onCheckedChange={toggleAutoApply}
                      />
                    </div>
                    <div className="pt-4">
                      <Link href="/dashboard/auto-apply/setup">
                        <Button className="w-full">
                          <Settings className="w-4 h-4 mr-2" />
                          Open Full Settings
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}