"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "./card";

interface BarChartProps {
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

export function BarChart({ data, xField, yField, categories }: BarChartProps) {
  return (
    <ResponsiveContainer width='100%' height={350}>
      <RechartsBarChart
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
          <Bar
            key={category}
            dataKey={category === yField ? category : `${yField}.${category}`}
            fill={colors[index % colors.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
