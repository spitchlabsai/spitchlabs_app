// app/page.tsx
import { z } from "zod";
import { CallLogsTable } from "@/components/call-table";
import { SectionCards } from "@/components/section-cards";

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

type CallLog = z.infer<typeof callLogSchema>;

const mockCallLogs: CallLog[] = [
  // {
  //   id: 1,
  //   caller: "+17752577809",
  //   receiver: "+448007973141",
  //   duration: "0:00",
  //   status: "failed",
  //   endedBy: null,
  //   hasRecording: false,
  //   timestamp: "2024-01-15 14:30:00",
  // },
  // {
  //   id: 2,
  //   caller: "+17752577809",
  //   receiver: "+442031922500",
  //   duration: "0:31",
  //   status: "completed",
  //   endedBy: "User",
  //   hasRecording: true,
  //   timestamp: "2024-01-15 14:25:00",
  // },
  // {
  //   id: 3,
  //   caller: "+17752577809",
  //   receiver: "+442035972940",
  //   duration: "1:25",
  //   status: "completed",
  //   endedBy: "User",
  //   hasRecording: true,
  //   timestamp: "2024-01-15 14:20:00",
  // },
  // {
  //   id: 4,
  //   caller: "+17752577809",
  //   receiver: "+442075233888",
  //   duration: "0:26",
  //   status: "completed",
  //   endedBy: "User",
  //   hasRecording: true,
  //   timestamp: "2024-01-15 14:15:00",
  // },
  // {
  //   id: 5,
  //   caller: "+17752577809",
  //   receiver: "+442071052000",
  //   duration: "0:14",
  //   status: "completed",
  //   endedBy: "User",
  //   hasRecording: true,
  //   timestamp: "2024-01-15 14:10:00",
  // },
  // {
  //   id: 6,
  //   caller: "+17752577809",
  //   receiver: "+447841481269",
  //   duration: "0:13",
  //   status: "completed",
  //   endedBy: "User",
  //   hasRecording: true,
  //   timestamp: "2024-01-15 14:05:00",
  // },
  // {
  //   id: 7,
  //   caller: "+17752577809",
  //   receiver: "+441239962440",
  //   duration: "0:00",
  //   status: "failed",
  //   endedBy: null,
  //   hasRecording: false,
  //   timestamp: "2024-01-15 14:00:00",
  // },
  // {
  //   id: 8,
  //   caller: "+17752577809",
  //   receiver: "+442031558899",
  //   duration: "2:15",
  //   status: "no-answer",
  //   endedBy: null,
  //   hasRecording: false,
  //   timestamp: "2024-01-15 13:55:00",
  // },
  // {
  //   id: 9,
  //   caller: "+17752577809",
  //   receiver: "+447123456789",
  //   duration: "0:45",
  //   status: "busy",
  //   endedBy: "System",
  //   hasRecording: false,
  //   timestamp: "2024-01-15 13:50:00",
  // },
  // {
  //   id: 10,
  //   caller: "+17752577809",
  //   receiver: "+442087654321",
  //   duration: "3:22",
  //   status: "completed",
  //   endedBy: "User",
  //   hasRecording: true,
  //   timestamp: "2024-01-15 13:45:00",
  // },
];

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Page header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Dashboard
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            High-level view of your outbound and inbound call performance.
          </p>
        </div>

        {/* KPI cards */}
        <SectionCards />

        {/* Call logs table */}
        <div className="rounded-2xl border bg-card/60 shadow-sm backdrop-blur-sm">
          <div className="px-2 pb-3 pt-2 md:px-4 md:pb-5">
            <CallLogsTable data={mockCallLogs} />
          </div>
        </div>
      </div>
    </div>
  );
}
