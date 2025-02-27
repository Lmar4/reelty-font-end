"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "./card";

interface LineChartProps {
  data: any[];
  xField: string;
  yField: string;
  categories: string[];
}

const colors = [
  "var(--primary)",
  "var(--secondary)",
  "var(--destructive)",
  "var(--muted)",
];

export function LineChart({
  data,
  xField,
  yField,
  categories,
}: LineChartProps) {
  return (
    <ResponsiveContainer width='100%' height={350}>
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
        <XAxis
          dataKey={xField}
          stroke='var(--muted-foreground)'
          fontSize={12}
        />
        <YAxis stroke='var(--muted-foreground)' fontSize={12} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <Card className='p-2 !bg-background border-border'>
                  <div className='text-sm font-medium'>{label}</div>
                  {payload.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-2 text-sm text-muted-foreground'
                    >
                      <div
                        className='w-2 h-2 rounded-full'
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}:</span>
                      <span className='font-medium'>
                        {typeof item.value === "number"
                          ? item.value.toLocaleString()
                          : item.value}
                      </span>
                    </div>
                  ))}
                </Card>
              );
            }
            return null;
          }}
        />
        {categories.map((category, index) => (
          <Line
            key={category}
            type='monotone'
            dataKey={category === yField ? category : `${yField}.${category}`}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
