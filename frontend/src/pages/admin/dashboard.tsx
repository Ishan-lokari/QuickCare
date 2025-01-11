import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BedDouble,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  MoreVertical,
  LogOut,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "@/utils";
import axios from "axios";

interface QueuePatient {
  queueNo: string;
  name: string;
  waitTime: string;
  status: string;
}

interface BedPatient {
  bedNo: string;
  name: string;
  admissionDate: string;
  status: string;
}

interface HospitalDetails {
  currentStats: {
    availableBeds: number;
    averageWaitTime: string;
    patientsInQueue: number;
    totalBeds: number;
  };
  email: string;
  maxBeds: number;
  maxQueueSize: number;
  name: string;
}

export default function AdminDashboard() {
  const [queuePatients, setQueuePatients] = useState<QueuePatient[]>([]);
  const [bedPatients, setBedPatients] = useState<BedPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const hospitalName = localStorage.getItem("name");
  const [details, setDetails] = useState<HospitalDetails | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const infoResponse = await axios.get(`${BASE_URL}/hospital/info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDetails(infoResponse.data);

        const opdResponse = await axios.get(`${BASE_URL}/opd/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQueuePatients(opdResponse.data);

        const bedResponse = await axios.get(`${BASE_URL}/bed/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBedPatients(bedResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [token]);

  const handleQueueAction = async (
    queueNo: string,
    action: "complete" | "remove"
  ) => {
    try {
      const status = action === "complete" ? "Completed" : "delete";
      await axios.put(
        `${BASE_URL}/opd/modify`,
        { queueNo, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (action === "complete") {
        setQueuePatients((prev) =>
          prev.map((patient) =>
            patient.queueNo === queueNo
              ? { ...patient, status: "Completed" }
              : patient
          )
        );
      } else {
        setQueuePatients((prev) =>
          prev.filter((patient) => patient.queueNo !== queueNo)
        );
      }

      toast.success(
        action === "complete"
          ? "Patient marked as completed"
          : "Patient removed from queue"
      );
    } catch (error) {
      console.error("Error updating queue:", error);
      toast.error("Failed to update patient status");
    }
  };

  const handleBedStatusChange = async (bedNo: string, newStatus: string) => {
    try {
      await axios.put(
        `${BASE_URL}/bed/modify`,
        { bedNo, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBedPatients((prev) =>
        prev.map((bed) =>
          bed.bedNo === bedNo
            ? {
                ...bed,
                status: newStatus,
                name: newStatus === "Available" ? "-" : bed.name,
                admissionDate:
                  newStatus === "Available" ? "-" : bed.admissionDate,
              }
            : bed
        )
      );

      toast.success(`Bed status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating bed status:", error);
      toast.error("Failed to update bed status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("name");
    logout();
    navigate("/admin/login");
  };

  const stats = [
    {
      title: "Total Patients in Queue",
      value: queuePatients.length.toString(),
      icon: Users,
      description: `${
        queuePatients.filter((p) => p.status.toLowerCase() === "waiting").length
      } waiting`,
    },
    {
      title: "Available Beds",
      value: 50 - bedPatients.length,
      icon: BedDouble,
      description: `Out of ${50} total beds`,
    },
    {
      title: "Average Wait Time",
      value: details?.currentStats.averageWaitTime || "0m",
      icon: Clock,
      description: "Current estimate",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold">{hospitalName} Dashboard</h1>
              <span className="text-sm font-thin mt-2 text-gray-400">
                {details?.email}
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex-1 sm:flex-auto"
              >
                Download Report
              </Button>
              <Button
                variant="destructive"
                className="flex-1 sm:flex-auto"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="queue" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="queue">OPD Queue</TabsTrigger>
              <TabsTrigger value="beds">Bed Management</TabsTrigger>
            </TabsList>

            <TabsContent value="queue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Queue</CardTitle>
                  <CardDescription>
                    Manage your outpatient department queue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Queue No.</TableHead>
                          <TableHead>Patient Name</TableHead>
                          <TableHead>Wait Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queuePatients.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              No patients in queue
                            </TableCell>
                          </TableRow>
                        ) : (
                          queuePatients.map((patient) => (
                            <TableRow key={patient.queueNo}>
                              <TableCell>{patient.queueNo}</TableCell>
                              <TableCell>{patient.name}</TableCell>
                              <TableCell>{patient.waitTime}</TableCell>
                              <TableCell>
                                <QueueStatus status={patient.status} />
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleQueueAction(
                                          patient.queueNo,
                                          "complete"
                                        )
                                      }
                                    >
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      Mark as Complete
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleQueueAction(
                                          patient.queueNo,
                                          "remove"
                                        )
                                      }
                                      className="text-destructive"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Remove from Queue
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="beds" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bed Allocation</CardTitle>
                  <CardDescription>
                    Monitor and manage hospital bed assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bed No.</TableHead>
                          <TableHead>Patient Name</TableHead>
                          <TableHead>Admission Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bedPatients.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              No beds available
                            </TableCell>
                          </TableRow>
                        ) : (
                          bedPatients.map((bed) => (
                            <TableRow key={bed.bedNo}>
                              <TableCell>{bed.bedNo}</TableCell>
                              <TableCell>{bed.name}</TableCell>
                              <TableCell>{bed.admissionDate}</TableCell>
                              <TableCell>
                                <BedStatus status={bed.status} />
                              </TableCell>
                              <TableCell className="text-right">
                                <Select
                                  value={bed.status}
                                  onValueChange={(value) =>
                                    handleBedStatusChange(bed.bedNo, value)
                                  }
                                >
                                  <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Available">
                                      Available
                                    </SelectItem>
                                    <SelectItem value="Occupied">
                                      Occupied
                                    </SelectItem>
                                    <SelectItem value="Reserved">
                                      Reserved
                                    </SelectItem>
                                    <SelectItem value="Maintenance">
                                      Maintenance
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

function QueueStatus({ status }: { status: string }) {
  // Handle case-insensitive status matching
  const normalizedStatus = status.toLowerCase();

  const statusStyles = {
    waiting:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    "in-progress":
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    completed:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  };

  // Get the appropriate style based on normalized status
  const styleKey =
    Object.keys(statusStyles).find((key) => key === normalizedStatus) ||
    "waiting";

  return (
    <Badge
      variant="secondary"
      className={statusStyles[styleKey as keyof typeof statusStyles]}
    >
      {normalizedStatus === "in-progress" && (
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
function BedStatus({ status }: { status: string }) {
  // Handle case-insensitive status matching
  const normalizedStatus = status.toLowerCase();

  const statusStyles = {
    occupied: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    available:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    reserved:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    maintenance:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  };

  // Get the appropriate style based on normalized status
  const styleKey =
    Object.keys(statusStyles).find((key) => key === normalizedStatus) ||
    "available";

  return (
    <Badge
      variant="secondary"
      className={statusStyles[styleKey as keyof typeof statusStyles]}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
