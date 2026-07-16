import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Custom floating Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950/95 border border-zinc-800 rounded-xl p-3 shadow-2xl backdrop-blur-sm">
        <p className="text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">{label}</p>
        <div className="flex flex-col gap-1">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-zinc-300 font-medium">{item.name}:</span>
              <span className="text-xs text-zinc-100 font-bold ml-auto">
                {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

interface EvaluationsChartProps {
  data: any[];
}

export const EvaluationsChart: React.FC<EvaluationsChartProps> = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorStg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-zinc-400 capitalize">{value}</span>}
          />
          <Area
            name="production"
            type="monotone"
            dataKey="production"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorProd)"
          />
          <Area
            name="staging"
            type="monotone"
            dataKey="staging"
            stroke="#f59e0b"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorStg)"
          />
          <Area
            name="development"
            type="monotone"
            dataKey="development"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorDev)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface DistributionChartProps {
  data: any[];
}

export const DistributionChart: React.FC<DistributionChartProps> = ({ data }) => {
  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="h-[250px] w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }: any) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 shadow-xl text-xs">
                    <span className="font-semibold text-zinc-300">{payload[0].name}:</span>
                    <span className="font-bold text-zinc-100 ml-1.5">{payload[0].value}%</span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={6}
            formatter={(value) => <span className="text-xs text-zinc-400 font-medium truncate max-w-[120px] inline-block">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface SDKUsageChartProps {
  data: any[];
}

export const SDKUsageChart: React.FC<SDKUsageChartProps> = ({ data }) => {
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val}%`}
          />
          <Tooltip
            content={({ active, payload, label }: any) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 shadow-xl text-xs">
                    <span className="font-semibold text-zinc-400">{label}:</span>
                    <span className="font-bold text-zinc-100 ml-1.5">{payload[0].value}% usage</span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
