import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// import data from "./data.json";
import { CallLogsTable } from "@/components/call-table";
import { z } from "zod";

export const callLogSchema = z.object({
  id: z.number(),
  caller: z.string(),
  receiver: z.string(),
  duration: z.string(),
  status: z.enum(["completed", "failed", "no-answer", "busy"]),
  endedBy: z.string().nullable(),
  hasRecording: z.boolean(),
  timestamp: z.string(),
});

export default function Page() {
  type CallLog = z.infer<typeof callLogSchema>;

  const mockCallLogs: CallLog[] = [
    {
      id: 1,
      caller: "+17752577809",
      receiver: "+448007973141",
      duration: "0:00",
      status: "failed",
      endedBy: null,
      hasRecording: false,
      timestamp: "2024-01-15 14:30:00",
    },
    {
      id: 2,
      caller: "+17752577809",
      receiver: "+442031922500",
      duration: "0:31",
      status: "completed",
      endedBy: "User",
      hasRecording: true,
      timestamp: "2024-01-15 14:25:00",
    },
    {
      id: 3,
      caller: "+17752577809",
      receiver: "+442035972940",
      duration: "1:25",
      status: "completed",
      endedBy: "User",
      hasRecording: true,
      timestamp: "2024-01-15 14:20:00",
    },
    {
      id: 4,
      caller: "+17752577809",
      receiver: "+442075233888",
      duration: "0:26",
      status: "completed",
      endedBy: "User",
      hasRecording: true,
      timestamp: "2024-01-15 14:15:00",
    },
    {
      id: 5,
      caller: "+17752577809",
      receiver: "+442071052000",
      duration: "0:14",
      status: "completed",
      endedBy: "User",
      hasRecording: true,
      timestamp: "2024-01-15 14:10:00",
    },
    {
      id: 6,
      caller: "+17752577809",
      receiver: "+447841481269",
      duration: "0:13",
      status: "completed",
      endedBy: "User",
      hasRecording: true,
      timestamp: "2024-01-15 14:05:00",
    },
    {
      id: 7,
      caller: "+17752577809",
      receiver: "+441239962440",
      duration: "0:00",
      status: "failed",
      endedBy: null,
      hasRecording: false,
      timestamp: "2024-01-15 14:00:00",
    },
    {
      id: 8,
      caller: "+17752577809",
      receiver: "+442031558899",
      duration: "2:15",
      status: "no-answer",
      endedBy: null,
      hasRecording: false,
      timestamp: "2024-01-15 13:55:00",
    },
    {
      id: 9,
      caller: "+17752577809",
      receiver: "+447123456789",
      duration: "0:45",
      status: "busy",
      endedBy: "System",
      hasRecording: false,
      timestamp: "2024-01-15 13:50:00",
    },
    {
      id: 10,
      caller: "+17752577809",
      receiver: "+442087654321",
      duration: "3:22",
      status: "completed",
      endedBy: "User",
      hasRecording: true,
      timestamp: "2024-01-15 13:45:00",
    },
  ];
  return (
    <>
      {/* // <SidebarProvider
    //   style={
    //     {
    //       "--sidebar-width": "calc(var(--spacing) * 72)",
    //       "--header-height": "calc(var(--spacing) * 12)",
    //     } as React.CSSProperties
    //   }
    // > */}
      {/* //   <AppSidebar variant="inset" />
    //   <SidebarInset>
    // */}

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <CallLogsTable data={mockCallLogs} />
              {/* <ChartAreaInteractive /> */}
            </div>
          </div>
        </div>
      </div>
      {/* //   </SidebarInset> */}
      {/* // </SidebarProvider> */}
    </>
  );
}
