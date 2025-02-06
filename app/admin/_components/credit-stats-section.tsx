"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";

interface CreditStats {
  _sum: {
    creditsRemaining: number;
  };
  _avg: {
    creditsRemaining: number;
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function CreditStatsSection() {
  const { data: creditStats, isLoading } =
    trpc.adminPanel.getCreditStats.useQuery();

  if (isLoading) {
    return <div>Loading credit statistics...</div>;
  }

  const totalCredits = creditStats?._sum.creditsRemaining || 0;
  const avgCredits = creditStats?._avg.creditsRemaining || 0;

  const creditData = [
    {
      name: "Average Credits",
      value: avgCredits,
    },
    {
      name: "Total Credits",
      value: totalCredits,
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>Total Credits</CardTitle>
            <CardDescription>Sum of all user credits</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{totalCredits}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Credits</CardTitle>
            <CardDescription>Per user average</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{avgCredits.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credit Distribution</CardTitle>
          <CardDescription>Visual representation of credits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-[400px] w-full flex items-center justify-center'>
            <PieChart width={400} height={400}>
              <Pie
                data={creditData}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={150}
                fill='#8884d8'
                dataKey='value'
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {creditData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
