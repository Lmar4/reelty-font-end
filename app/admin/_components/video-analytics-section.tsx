import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts";

interface VideoAnalytics {
  processingStats: {
    total: number;
    success: number;
    failed: number;
    inProgress: number;
    averageProcessingTime: number;
  };
  timeDistribution: {
    hour: number;
    count: number;
  }[];
  errorTypes: {
    type: string;
    count: number;
  }[];
  dailyJobs: {
    date: string;
    total: number;
    success: number;
    failed: number;
  }[];
}

const COLORS = ["#4ade80", "#f87171", "#fbbf24", "#60a5fa"];

async function getVideoAnalytics(): Promise<VideoAnalytics> {
  const response = await fetch("/api/admin/stats/videos");
  if (!response.ok) {
    throw new Error("Failed to fetch video analytics");
  }
  return response.json();
}

export default function VideoAnalyticsSection() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["videoAnalytics"],
    queryFn: getVideoAnalytics,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className='flex justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Video Processing Analytics</h2>

      {/* Processing Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Total Jobs
          </h3>
          <p className='text-2xl font-bold'>
            {analytics.processingStats.total}
          </p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Success Rate
          </h3>
          <p className='text-2xl font-bold'>
            {(
              (analytics.processingStats.success /
                analytics.processingStats.total) *
              100
            ).toFixed(1)}
            %
          </p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            In Progress
          </h3>
          <p className='text-2xl font-bold'>
            {analytics.processingStats.inProgress}
          </p>
        </Card>
        <Card className='p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Avg. Processing Time
          </h3>
          <p className='text-2xl font-bold'>
            {(analytics.processingStats.averageProcessingTime / 60).toFixed(1)}{" "}
            min
          </p>
        </Card>
      </div>

      {/* Processing Status Distribution */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>
          Processing Status Distribution
        </h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={[
                  { name: "Success", value: analytics.processingStats.success },
                  { name: "Failed", value: analytics.processingStats.failed },
                  {
                    name: "In Progress",
                    value: analytics.processingStats.inProgress,
                  },
                ]}
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey='value'
                label
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Daily Processing Trends */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>Daily Processing Trends</h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={analytics.dailyJobs}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type='monotone'
                dataKey='success'
                stackId='1'
                stroke='#4ade80'
                fill='#4ade80'
                name='Success'
              />
              <Area
                type='monotone'
                dataKey='failed'
                stackId='1'
                stroke='#f87171'
                fill='#f87171'
                name='Failed'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Time Distribution */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>
          Processing Time Distribution
        </h3>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={analytics.timeDistribution}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='hour' />
              <YAxis />
              <Tooltip />
              <Area
                type='monotone'
                dataKey='count'
                stroke='#60a5fa'
                fill='#60a5fa'
                name='Jobs'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
