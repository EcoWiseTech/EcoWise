import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);
function addByValue(startValue, numberOfElements) {
    let result = [];
    for (let i = 1; i <= numberOfElements; i++) {
        result.push(startValue * i);
    }
    return result;
}
const StackedBarChartWithLine = ({budgetLimit: budgetLimit, todayConsumption: todayConsumption, ...props}) => {
  // Data for the chart
  const data = {
    labels: ['Saturday', 'Sunday', 'Monday', 'Tuesday'], // Categories on the x-axis
    datasets: [
      // Bar datasets for each day
      {
        label: 'Saturday',
        data: [1, 1, 1, 1], // Consistent value for all categories
        backgroundColor: 'rgba(100, 150, 200, 0.5)',
        barThickness: 100, // Fixed bar thickness
        stack: 'Stack 0', // Stacked with other bars
      },
      {
        label: 'Sunday',
        data: [null, 3, 3, 3], // Consistent value for all categories
        backgroundColor: 'rgba(54, 162, 2100, 0.5)',
        barThickness: 100, // Fixed bar thickness
        stack: 'Stack 0', // Stacked with other bars
      },
      {
        label: 'Monday',
        data: [null, null, 2, 2], // Consistent value for all categories
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        barThickness: 100, // Fixed bar thickness
        stack: 'Stack 0', // Stacked with other bars
      },
      {
        label: 'Tuesday',
        data: [null, null, null, todayConsumption], // Consistent value for all categories
        backgroundColor: 'rgba(70, 80, 100, 0.8)',
        barThickness: 100, // Fixed bar thickness
        stack: 'Stack 0', // Stacked with other bars
      },
      // Line dataset for the linear line
      
      {
        label: 'Budget Limit',
        data: budgetLimit != null ? addByValue(Number(budgetLimit), 4) : addByValue(4, 4), // Consistent value for all categories    
        borderColor: 'rgb(255, 0, 0)', // Red color for the line
        borderWidth: 2,
        type: 'line', // Specify this dataset as a line
        fill: false, // Do not fill under the line
      },
    ],
  };

  // Options for the chart
  const options = {
    plugins: {
      title: {
        display: false,
        text: 'Stacked Bar Chart with Linear Line',
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true, // Stack bars on the x-axis
        grid: {
          display: false, // Hide x-axis grid lines
        },
        // Adjust spacing between categories
        categoryPercentage: 1, // Reduce spacing between categories (default: 0.8)
        barPercentage: 0.9, // Keep bars relatively wide within each category
      },
      y: {
        stacked: true, // Stack bars on the y-axis
        beginAtZero: true, // Start the y-axis at 0
        grid: {
          display: false, // Show y-axis grid lines
        },
      },
    },
  };

  return <Bar data={data} options={options} {...props} />;
};

export default StackedBarChartWithLine;