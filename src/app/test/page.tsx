import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Phone,
  PhoneCall,
  Users,
  BarChart3,
  Search,
  Download,
  Eye,
  Settings,
  Filter,
  FileText,
} from "lucide-react";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for campaigns
  const campaigns = [
    {
      id: 1,
      name: "Summer Sales Campaign",
      status: "active",
      totalCalls: 245,
      completed: 156,
      failed: 12,
    },
    {
      id: 2,
      name: "Product Launch Outreach",
      status: "paused",
      totalCalls: 180,
      completed: 89,
      failed: 8,
    },
    {
      id: 3,
      name: "Customer Feedback Survey",
      status: "active",
      totalCalls: 320,
      completed: 198,
      failed: 15,
    },
  ];

  // Mock data for agent sessions
  const agentSessions = [
    {
      id: 1,
      agentId: "AGT001",
      status: "active",
      currentCall: "+1234567890",
      duration: "00:05:23",
      callsToday: 23,
    },
    {
      id: 2,
      agentId: "AGT002",
      status: "idle",
      currentCall: null,
      duration: "00:00:00",
      callsToday: 18,
    },
    {
      id: 3,
      agentId: "AGT003",
      status: "active",
      currentCall: "+1987654321",
      duration: "00:02:15",
      callsToday: 31,
    },
    {
      id: 4,
      agentId: "AGT004",
      status: "offline",
      currentCall: null,
      duration: "00:00:00",
      callsToday: 0,
    },
  ];

  // Mock data for call logs
  const callLogs = [
    {
      id: 1,
      caller: "+17752577809",
      receiver: "+448007973141",
      duration: "0:00",
      status: "failed",
      endedBy: "-",
      hasRecording: false,
    },
    {
      id: 2,
      caller: "+17752577809",
      receiver: "+442031922500",
      duration: "0:31",
      status: "completed",
      endedBy: "User",
      hasRecording: true,
    },
    {
      id: 3,
      caller: "+17752577809",
      receiver: "+442035972940",
      duration: "1:25",
      status: "completed",
      endedBy: "User",
      hasRecording: true,
    },
    {
      id: 4,
      caller: "+17752577809",
      receiver: "+442075233888",
      duration: "0:26",
      status: "completed",
      endedBy: "User",
      hasRecording: true,
    },
    {
      id: 5,
      caller: "+17752577809",
      receiver: "+442071052000",
      duration: "0:14",
      status: "completed",
      endedBy: "User",
      hasRecording: true,
    },
    {
      id: 6,
      caller: "+17752577809",
      receiver: "+447841481269",
      duration: "0:13",
      status: "completed",
      endedBy: "User",
      hasRecording: true,
    },
    {
      id: 7,
      caller: "+17752577809",
      receiver: "+441239962440",
      duration: "0:00",
      status: "failed",
      endedBy: "-",
      hasRecording: false,
    },
  ];

  // Mock data for contacts
  const contacts = [
    {
      id: 1,
      name: "John Smith",
      phone: "+442031922500",
      email: "john.smith@email.com",
      company: "Tech Corp",
      status: "active",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      phone: "+442035972940",
      email: "sarah.j@company.com",
      company: "Innovation Ltd",
      status: "active",
    },
    {
      id: 3,
      name: "Mike Davis",
      phone: "+442075233888",
      email: "mike.davis@business.com",
      company: "Global Solutions",
      status: "inactive",
    },
    {
      id: 4,
      name: "Emma Wilson",
      phone: "+442071052000",
      email: "emma.w@startup.com",
      company: "NextGen",
      status: "active",
    },
    {
      id: 5,
      name: "Tom Brown",
      phone: "+447841481269",
      email: "tom.brown@enterprise.com",
      company: "Enterprise Plus",
      status: "active",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "idle":
        return "bg-gray-100 text-gray-800";
      case "offline":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredCallLogs = callLogs.filter(
    (call) =>
      call.caller.includes(searchTerm) || call.receiver.includes(searchTerm)
  );

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <span className="text-xl font-semibold">Caantin</span>
        </div>

        <nav className="space-y-2">
          <Button
            variant="secondary"
            className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <PhoneCall size={16} />
            Call Queue
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-slate-800"
          >
            <BarChart3 size={16} />
            Campaigns
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-slate-800"
          >
            <FileText size={16} />
            Pathways
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-slate-800"
          >
            <Users size={16} />
            Contacts
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-slate-800"
          >
            <BarChart3 size={16} />
            Analytics
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-slate-800"
          >
            <Settings size={16} />
            Billing
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Call Insights
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter size={16} className="mr-2" />
              Filters
              <Badge className="ml-2 bg-orange-500">3</Badge>
            </Button>
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button size="sm">Send Call</Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="agents">Agent Sessions</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-blue-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Account Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm opacity-90">
                        Available Minutes
                      </div>
                      <div className="text-2xl font-bold">212</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-90">
                        Total Minutes Used
                      </div>
                      <div className="text-2xl font-bold">99</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Call Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm opacity-90">Completed</div>
                      <div className="text-xl font-bold">73 (66%)</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-90">No Answer</div>
                      <div className="text-xl font-bold">8 (7%)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cyan-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Call Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="text-sm opacity-90">Total Calls</div>
                    <div className="text-2xl font-bold">111</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Campaign Status */}
            <Card>
              <CardHeader>
                <CardTitle>Current Campaigns</CardTitle>
                <CardDescription>Status of running campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-gray-600">
                          Total: {campaign.totalCalls} | Completed:{" "}
                          {campaign.completed} | Failed: {campaign.failed}
                        </div>
                      </div>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Call Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Call Logs</CardTitle>
                <div className="flex items-center gap-2">
                  <Search size={16} className="text-gray-400" />
                  <Input
                    placeholder="Search by caller or receiver..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-gray-600">
                        <th className="pb-3">Caller</th>
                        <th className="pb-3">Receiver</th>
                        <th className="pb-3">Duration</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Ended By</th>
                        <th className="pb-3">Download</th>
                        <th className="pb-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCallLogs.map((call) => (
                        <tr key={call.id} className="border-b">
                          <td className="py-3">{call.caller}</td>
                          <td className="py-3">{call.receiver}</td>
                          <td className="py-3">{call.duration}</td>
                          <td className="py-3">
                            <Badge className={getStatusColor(call.status)}>
                              {call.status}
                            </Badge>
                          </td>
                          <td className="py-3">{call.endedBy}</td>
                          <td className="py-3">
                            {call.hasRecording ? "Download Recording" : "-"}
                          </td>
                          <td className="py-3">
                            <Button variant="ghost" size="sm">
                              <Eye size={16} className="mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Sessions</CardTitle>
                <CardDescription>Current status of all agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agentSessions.map((agent) => (
                    <Card key={agent.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{agent.agentId}</h3>
                          <Badge className={getStatusColor(agent.status)}>
                            {agent.status}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Current Call:</span>
                            <span>{agent.currentCall || "None"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span>{agent.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Calls Today:</span>
                            <span>{agent.callsToday}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contacts</CardTitle>
                <CardDescription>All uploaded contacts</CardDescription>
                <div className="flex items-center gap-2">
                  <Search size={16} className="text-gray-400" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-gray-600">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Phone</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Company</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.map((contact) => (
                        <tr key={contact.id} className="border-b">
                          <td className="py-3 font-medium">{contact.name}</td>
                          <td className="py-3">{contact.phone}</td>
                          <td className="py-3">{contact.email}</td>
                          <td className="py-3">{contact.company}</td>
                          <td className="py-3">
                            <Badge className={getStatusColor(contact.status)}>
                              {contact.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Button variant="ghost" size="sm">
                              <Eye size={16} className="mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
