"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRef, useState } from "react";

export function SectionCards() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  return (
    // <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
    //   <Card className="@container/card">
    //     <CardHeader>
    //       <CardDescription>Total Revenue</CardDescription>
    //       <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
    //         $1,250.00
    //       </CardTitle>
    //       <CardAction>
    //         <Badge variant="outline">
    //           <IconTrendingUp />
    //           +12.5%
    //         </Badge>
    //       </CardAction>
    //     </CardHeader>
    //     <CardFooter className="flex-col items-start gap-1.5 text-sm">
    //       <div className="line-clamp-1 flex gap-2 font-medium">
    //         Trending up this month <IconTrendingUp className="size-4" />
    //       </div>
    //       <div className="text-muted-foreground">
    //         Visitors for the last 6 months
    //       </div>
    //     </CardFooter>
    //   </Card>
    //   <Card className="@container/card">
    //     <CardHeader>
    //       <CardDescription>New Customers</CardDescription>
    //       <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
    //         1,234
    //       </CardTitle>
    //       <CardAction>
    //         <Badge variant="outline">
    //           <IconTrendingDown />
    //           -20%
    //         </Badge>
    //       </CardAction>
    //     </CardHeader>
    //     <CardFooter className="flex-col items-start gap-1.5 text-sm">
    //       <div className="line-clamp-1 flex gap-2 font-medium">
    //         Down 20% this period <IconTrendingDown className="size-4" />
    //       </div>
    //       <div className="text-muted-foreground">
    //         Acquisition needs attention
    //       </div>
    //     </CardFooter>
    //   </Card>
    //   <Card className="@container/card">
    //     <CardHeader>
    //       <CardDescription>Active Accounts</CardDescription>
    //       <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
    //         45,678
    //       </CardTitle>
    //       <CardAction>
    //         <Badge variant="outline">
    //           <IconTrendingUp />
    //           +12.5%
    //         </Badge>
    //       </CardAction>
    //     </CardHeader>
    //     <CardFooter className="flex-col items-start gap-1.5 text-sm">
    //       <div className="line-clamp-1 flex gap-2 font-medium">
    //         Strong user retention <IconTrendingUp className="size-4" />
    //       </div>
    //       <div className="text-muted-foreground">Engagement exceed targets</div>
    //     </CardFooter>
    //   </Card>
    //   <Card className="@container/card">
    //     <CardHeader>
    //       <CardDescription>Growth Rate</CardDescription>
    //       <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
    //         4.5%
    //       </CardTitle>
    //       <CardAction>
    //         <Badge variant="outline">
    //           <IconTrendingUp />
    //           +4.5%
    //         </Badge>
    //       </CardAction>
    //     </CardHeader>
    //     <CardFooter className="flex-col items-start gap-1.5 text-sm">
    //       <div className="line-clamp-1 flex gap-2 font-medium">
    //         Steady performance increase <IconTrendingUp className="size-4" />
    //       </div>
    //       <div className="text-muted-foreground">Meets growth projections</div>
    //     </CardFooter>
    //   </Card>
    // </div>

    <div className="space-y-6 px-7">
      <h1 className="text-2xl font-bold text-gray-900">Upload Lead List</h1>

      <div>
        <div className="text-center">
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Upload your CSV file
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop or click to browse
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Supports: CSV files up to 10MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* {uploadedFile && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {uploadedFile.name}
                </span>
              </div>
              <button onClick={() => setUploadedFile(null)}>
                <X className="h-4 w-4 text-green-600" />
              </button>
            </div>
          </div>
        )} */}

        <div className="mt-8">
          <h4 className="font-medium text-gray-900 mb-3">Required Columns</h4>
          <ul className="text-sm text-gray-600 flex gap-7">
            <li className="flex items-center">
              {/* <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> */}
              Name
            </li>
            <li className="flex items-center">
              {/* <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> */}
              Phone Number
            </li>
            <li className="flex items-center">
              {/* <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> */}
              Company (optional)
            </li>
            <li className="flex items-center">
              {/* <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> */}
              Email (optional)
            </li>
          </ul>
        </div>
        <div className="mt-8">
          <h4 className="font-medium text-gray-900 mb-3">Sample Template</h4>
          <button className="px-4 py-2 bg-black hover:bg-black/50 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* {uploadedFile && (
          <div className="mt-8 flex justify-end">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Process Leads
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
}
