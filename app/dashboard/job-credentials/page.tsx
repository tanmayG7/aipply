"use client";

import React from 'react';
import Head from 'next/head';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import JobCredentials from '@/components/dashboard/job-credentials/JobCredentials';

const JobCredentialsPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Job Credentials - Aipply</title>
        <meta name="description" content="Manage your job portal credentials securely" />
      </Head>
      <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 relative bg-[#020218] text-white overflow-x-hidden">
            <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <JobCredentials />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default JobCredentialsPage;