'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    tension?: number;
  }[];
}

interface DoughnutData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

interface LineChartProps {
  data: ChartData;
  title?: string;
  height?: number;
}

interface BarChartProps {
  data: ChartData;
  title?: string;
  height?: number;
}

interface DoughnutChartProps {
  data: DoughnutData;
  title?: string;
  height?: number;
}

const defaultColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
];

export function LineChart({ data, title, height = 300 }: LineChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={data} options={options} />
    </div>
  );
}

export function BarChart({ data, title, height = 300 }: BarChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={data} options={options} />
    </div>
  );
}

export function DoughnutChart({ data, title, height = 300 }: DoughnutChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

// Helper functions to create chart data
export function createLineChartData(
  labels: string[],
  datasets: { label: string; data: number[]; color?: string }[]
): ChartData {
  return {
    labels,
    datasets: datasets.map((dataset, index) => ({
      ...dataset,
      borderColor: dataset.color || defaultColors[index % defaultColors.length],
      backgroundColor: (dataset.color || defaultColors[index % defaultColors.length]) + '20',
      tension: 0.4,
    })),
  };
}

export function createBarChartData(
  labels: string[],
  datasets: { label: string; data: number[]; color?: string }[]
): ChartData {
  return {
    labels,
    datasets: datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.color || defaultColors[index % defaultColors.length],
      borderColor: dataset.color || defaultColors[index % defaultColors.length],
    })),
  };
}

export function createDoughnutChartData(
  labels: string[],
  data: number[],
  colors?: string[]
): DoughnutData {
  const chartColors = colors || defaultColors.slice(0, labels.length);
  
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: chartColors,
        borderColor: chartColors.map(color => color + '80'),
        borderWidth: 2,
      },
    ],
  };
}
