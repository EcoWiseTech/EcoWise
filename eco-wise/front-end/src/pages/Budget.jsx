import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom'
import { Box, Paper, Divider, Tabs, Tab, Typography, Grid, Card, CircularProgress, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { jwtDecode } from 'jwt-decode';
import { GetPreferenceApi } from '../api/preference/GetPreferenceApi';
import { useUserContext } from '../contexts/UserContext';
import { enqueueSnackbar } from 'notistack';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
} from 'chart.js';

import { Line, Bar } from 'react-chartjs-2';
import BudgetDialog from '../components/common/budget/BudgetDialog';
import * as yup from 'yup';
import { CreatePreferenceApi } from '../api/preference/CreatePreferenceApi';
import { UpdatePreferenceApi } from '../api/preference/UpdatePreferenceApi';
import { useAlert } from "../contexts/AlertContext";
import { GetGSIDeviceConsumptionApi } from '../api/home/GetGSIDeviceConsumptionApi';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { GetHomeApi } from '../api/home/GetHomeApi';
import StackedBarChart from '../components/common/budget/StackedChart';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { GetBudgetRecordsApi } from '../api/budgetRecords/GetBudgetRecordsApi';
import { CreateBudgetRecordsApi } from '../api/budgetRecords/CreateBudgetRecordsApi';
import { UpdateBudgetRecordsApi } from '../api/budgetRecords/UpdateBudgetRecordsApi';
import dayjs from 'dayjs';

function convertToHoursAndMinutes(hours) {
  const wholeHours = Math.floor(hours); // Get the whole number of hours
  const minutes = Math.round((hours - wholeHours) * 60); // Get the fractional part and convert to minutes

  if (wholeHours === 0) {
    return `${minutes} minutes`; // Only show minutes if hours are 0
  } else if (minutes === 0) {
    return `${wholeHours} hr`; // Only show hours if minutes are 0
  } else {
    return `${wholeHours} hr ${minutes} min`; // Show both hours and minutes
  }
}
const costPerKwh = 0.365 //in $/kWh


const CustomWidthTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    minWidth: 150,
  },
});
const emptyChartData = {
  labels: ["No Data"],
  datasets: [
    {
      label: "Usage Left (hours)",
      data: [null], // Keeps gridlines but no bars
      backgroundColor: "rgba(200, 200, 200, 0.6)",
      borderColor: "rgba(200, 200, 200, 1)",
      borderWidth: 1,
    },
  ],
};

const emptyChartOptions = {
  indexAxis: 'y',
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false }, // Disable tooltips for empty graph
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: { display: true },
      ticks: { display: true }, // Keep axis labels
    },
    y: {
      ticks: { font: { size: 14 }, display: true },
      grid: { display: true },
    },
  },
};
// Define the validation schema with yup
const schema = yup.object({
  dailyBudgetLimit: yup.number().required("Budget is required"),
}).required();
function Budget() {
  const { user, RefreshUser } = useUserContext()
  // console.log("user")
  // console.log(user)
  const [preference, setPreference] = useState(null); // Set initial value to null to indicate loading
  const [budgetRecords, setBudgetRecords] = useState([
    {
      "userId": "1498f4b8-f011-70bb-feeb-ec3b94d7d0b2",
      "budgets": [{
        "startDate": "2025-02-18T05:32:16.876Z",
        "dailyBudgetLimit": 2
      }]
    }
  ]); // Set initial value to null to indicate loading
  // console.log(" EHRERE AOHSDIAHSDO AOSD HOIASJDbudgetRecords")
  // console.log(budgetRecords)
  const [openBudgetDialog, setOpenBudgetDialog] = useState(false);
  const [formData, setFormData] = useState({
    dailyBudgetLimit: 0
  });
  const { showAlert } = useAlert();
  const [errors, setErrors] = useState({});
  const [deviceConsumption, setDeviceConsumption] = useState(null);
  const [totalDeviceConsumption, setTotalDeviceConsumption] = useState(null);
  const [todaySavings, setTodaySavings] = useState(null);
  const [savings, setSavings] = useState(null);
  const [budget, setBudget] = useState(null);
  const [totalConsumptionCost, setTotalConsumptionCost] = useState(null);
  const [toolTipAircon, setToolTipAircon] = useState("Usage left based on savings: \n \nLoading...");
  const [home, setHome] = useState(null); // Set initial value to null to indicate loading
  const [filterBudgetType, setFilterBudgetType] = useState("Day");
  const [chartLabelsInput, setChartLabelsInput] = useState(null);
  const [chartDatasetsInput, setChartDatasetsInput] = useState(null);
  const [chartTitleText, setChartTitleText] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [roomTooltips, setRoomTooltips] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [airconLabels, setAirconLabels] = useState(true);

  function formatTime(remainingTimeInHours) {
    const totalSeconds = remainingTimeInHours * 3600; // Convert hours to seconds
    const remainingMinutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);

    if (totalSeconds < 60) {
      return `${seconds}s`; // less than 60 seconds
    } else if (remainingMinutes < 60) {
      return `${remainingMinutes}mins & ${seconds}s`; // less than 60 minutes
    } else {
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      return `${hours}hrs & ${minutes}mins`; // more than 60 minutes
    }
  }
  const validateForm = async () => {
    try {
      await schema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationErrors) {
      const validationIssues = {};
      validationErrors.inner.forEach((err) => {
        validationIssues[err.path] = err.message;
      });
      setErrors(validationIssues);
      return false;
    }
  };
  const handleClickOpenBudgetDialog = () => {
    setOpenBudgetDialog(true);
  };

  const handleCloseBudgetDialog = () => {
    setOpenBudgetDialog(false);
    // // // // // console.log(user)
  };
  const handleBudgetInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

  };
  const handleEditBudget = async () => {
    if (!(await validateForm())) {
      return;
    }
    //budgetRecords
    //OLD HERE
    // const requestObj = {
    //   ...preference,
    //   userId: user.Username,
    //   uuid: preference.uuid,
    //   budgets: { ...preference.budgets, dailyBudgetLimit: formData.dailyBudgetLimit, },
    //   totalCost: totalConsumptionCost
    // };
    //OLD END
    const requestObj = {
      ...budgetRecords, // budgetRecords
      userId: user.Username,
      budgets: [
         { dailyBudgetLimit: formData.dailyBudgetLimit, startDate: new Date(formData.budgetDate).toISOString() }
       
      ]
    };
    if (budgetRecords === 0) {
      CreateBudgetRecordsApi(requestObj)
        .then((res) => {
          RefreshUser();
          showAlert('success', "Profile Updated Successfully.");
        })
        .catch((error) => {
          console.error("Error updating user:", error);
          if (error.name === 'NotAuthorizedException') {
            if (error.message === 'Refresh Token has expired' || error.message.includes('Refresh')) {
            }
          } else {
            showAlert('error', 'Unexpected error occurred. Please try again.');
          }
        });
    } else {
      UpdateBudgetRecordsApi(requestObj)
        .then((res) => {
          RefreshUser();
          showAlert('success', "Budget Updated Successfully.");
        })
        .catch((error) => {
          console.error("Error updating user:", error);
          if (error.name === 'NotAuthorizedException') {
            if (error.message === 'Refresh Token has expired' || error.message.includes('Refresh')) {
            }
          } else {
            showAlert('error', 'Unexpected error occurred. Please try again.');
          }
        });
    }



  };
  
  
  


  function daysInThisMonth(date) {
    var dateNow = new Date(date);
    return new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0).getDate();
  }
  function addByValue(startValue, numberOfElements) {
    return Array.from({ length: numberOfElements }, (_, i) => startValue * (i + 1));
  }

  // Helper: returns the Budget Limit dataset object
  function getBudgetLimitDataset(budgetLimit, labelsInput) {
    const isValid = budgetLimit != null && labelsInput.length > 0;
    // Use the provided values if valid; otherwise, default to 4.
    const value = isValid ? Number(budgetLimit) : 4;
    const count = isValid ? Number(labelsInput.length) : 4;

    return {
      label: 'Budget Limit',
      data: addByValue(value, count),
      borderColor: 'rgb(255, 0, 0)',
      borderWidth: 2,
      type: 'line',
      fill: false,
    };
  }
  function pastThreeYearsFunction(GSIDEVICECONSUMPTION, currentBudgetLimit) {
    const colorMap = {
      'Previous Year 1': 'rgba(75, 192, 192, 0.5)',
      'Previous Year 2': 'rgba(70, 80, 100, 0.8)',
      'Current Year': 'rgba(255, 255, 0, 0.5)'
    };
  
    // Get current year and previous years
    const currentYear = new Date().getFullYear();
    const years = [
      currentYear - 2,
      currentYear - 1,
      currentYear
    ].map(y => y.toString()); // ["2022", "2023", "2024"]
  
    // Calculate consumption for each year
    const yearlyConsumption = Array(3).fill(0);
    GSIDEVICECONSUMPTION.forEach(entry => {
      const entryYear = new Date(entry.startTime).getFullYear();
      const yearIndex = years.indexOf(entryYear.toString());
      if (yearIndex !== -1) {
        yearlyConsumption[yearIndex] += parseFloat(entry.totalConsumption) || 0;
      }
    });
  
    // Build datasets with proper propagation
    const yearData = years.map((year, index) => ({
      label: index === 2 ? 'Current Year' : `Previous Year ${2 - index}`,
      data: Array(3).fill(null).map((_, i) => 
        i >= index ? yearlyConsumption[index] : null
      ),
      backgroundColor: colorMap[index === 2 ? 'Current Year' : `Previous Year ${index + 1}`],
      barThickness: 80,
      stack: 'Stack 0'
    }));
  
    // Add budget line
    
  
    return {
      labels: years,
      datasets: yearData
    };
  }
  function yearFunction(GSIDEVICECONSUMPTION) {
    const colorMap = {
      January: 'rgba(75, 192, 192, 0.5)',
      February: 'rgba(70, 80, 100, 0.8)',
      March: 'rgba(255, 255, 0, 0.5)',
      April: 'rgba(128, 0, 128, 0.5)',
      May: 'rgba(255, 0, 0, 0.5)',
      June: 'rgba(100, 150, 200, 0.5)',
      July: 'rgba(54, 162, 235, 0.5)',
      August: 'rgba(255, 159, 64, 0.5)',
      September: 'rgba(153, 102, 255, 0.5)',
      October: 'rgba(75, 192, 192, 0.5)',
      November: 'rgba(70, 80, 100, 0.8)',
      December: 'rgba(255, 255, 0, 0.5)'
    };
  
    const today = new Date();
    const months = [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];
  
    // Helper: Get month index (0-11) from date
    const getMonthIndex = (date) => date.getMonth();
  
    // Helper: Format date as YYYY-MM-DD
    const getDateKey = (date) => date.toISOString().split('T')[0];
  
    // Calculate total consumption for each month
    const monthlyConsumption = Array(12).fill(0);
    GSIDEVICECONSUMPTION.forEach(entry => {
      const entryDate = new Date(entry.startTime);
      const monthIdx = getMonthIndex(entryDate);
      monthlyConsumption[monthIdx] += parseFloat(entry.totalConsumption) || 0;
    });
  
    // Build the final datasets
    const yearData = months.map((month, i) => ({
      label: month,
      data: Array.from({ length: 12 }, (_, j) => 
        j < i ? null : monthlyConsumption[i]
      ),
      backgroundColor: colorMap[month],
      barThickness: 80,
      stack: 'Stack 0'
    }));
  
   
    return {
      labels: months,
      datasets: yearData
    };
  }
  
  function monthFunction(GSIDEVICECONSUMPTION, noWeeks) {
    const colorMap = {
      week1: 'rgba(75, 192, 192, 0.5)',
      week2: 'rgba(70, 80, 100, 0.8)',
      week3: 'rgba(255, 255, 0, 0.5)',
      week4: 'rgba(128, 0, 128, 0.5)',
    };

    const today = new Date();

    // Helper: get the week number of the month for a given date.
    const getWeekNumber = (date) => {
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const offset = firstDayOfMonth.getDay(); // 0 = Sunday, etc.
      return Math.ceil((date.getDate() + offset) / 7);
    };

    // Helper: Format date as YYYY-MM-DD.
    const getDateKey = (date) => date.toISOString().split('T')[0];

    // Calculate total consumption for each day.
    const dailyConsumption = GSIDEVICECONSUMPTION.reduce((acc, entry) => {
      const entryDate = new Date(entry.startTime);
      const dateKey = getDateKey(entryDate);
      const consumption = parseFloat(entry.totalConsumption) || 0;
      acc[dateKey] = (acc[dateKey] || 0) + consumption;
      return acc;
    }, {});

    // Build an array of date keys covering (noWeeks * 7) days.
    const dateSlots = Array.from({ length: noWeeks * 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - ((noWeeks * 7 - 1) - i));
      return getDateKey(d);
    });

    // Compute weekly total consumption.
    const weeklyConsumption = Array(noWeeks).fill(0);
    dateSlots.forEach((dateKey) => {
      const d = new Date(dateKey);
      const weekNum = getWeekNumber(d);
      const weekIndex = weekNum - 1; // convert to 0-index
      if (weekIndex >= 0 && weekIndex < noWeeks) {
        weeklyConsumption[weekIndex] += dailyConsumption[dateKey] || 0;
      }
    });
    // For example, weeklyConsumption might be: [0, 0, 2.29, 0]

    // Build the final datasets.
    // For each week (row index i), create an array of length noWeeks such that:
    // - For each column index j, if j < i => null; else => weeklyConsumption[i].
    const weekData = Array.from({ length: noWeeks }, (_, i) => ({
      label: `week${i + 1}`,
      data: Array.from({ length: noWeeks }, (_, j) =>
        j < i ? null : weeklyConsumption[i]
      ),
      backgroundColor: colorMap[`week${i + 1}`],
      barThickness: 100,
      stack: 'Stack 0',
    }));

    return weekData;
  }






  function weekFunction(GSIDEVICECONSUMPTION, noDays) {
    const colorMap = {
      Monday: 'rgba(75, 192, 192, 0.5)',
      Tuesday: 'rgba(70, 80, 100, 0.8)',
      Wednesday: 'rgba(255, 255, 0, 0.5)',
      Thursday: 'rgba(128, 0, 128, 0.5)',
      Friday: 'rgba(255, 0, 0, 0.5)',
      Saturday: 'rgba(100, 150, 200, 0.5)',
      Sunday: 'rgba(54, 162, 210, 0.5)'
    };

    const today = new Date();
    const getDayKey = (date) => date.toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: 'UTC'
    });

    // const daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const daysOfWeek = Array.from({ length: noDays }, (_, i) => {
      const d = new Date(today);
      // console.log(`d :${d.toLocaleDateString('en-US', { weekday: 'long' })}`)
      d.setDate(d.getDate() - ((noDays - 1) - i));
      return getDayKey(d);
    });
    // console.log(`daysOfWeek :${daysOfWeek}`)
    // Create base structure with 4 null slots
    // console.log(`testing here of null list: ${JSON.stringify(Array(Number(noDays)).fill(null))}`)
    const weekData = daysOfWeek.map(day => ({
      label: day,
      data: Array(Number(noDays)).fill(null),
      backgroundColor: colorMap[day],
      barThickness: 100,
      stack: 'Stack 0'
    }));

    // Helper to get YYYY-MM-DD date string
    const getDateKey = (date) => date.toISOString().split('T')[0];

    // Calculate consumption per day
    const dailyConsumption = GSIDEVICECONSUMPTION.reduce((acc, entry) => {
      const entryDate = new Date(entry.startTime);
      const dateKey = getDateKey(entryDate);
      const consumption = parseFloat(entry.totalConsumption) || 0;
      const consumptionCost = parseFloat(entry.totalConsumption) * costPerKwh || 0;

      acc[dateKey] = (acc[dateKey] || 0) + consumptionCost;
      return acc;
    }, {});

    console.log(`dailyConsumption: ${JSON.stringify(dailyConsumption)}`)

    // Get dates for the last 7 days
    const dateSlots = Array.from({ length: noDays }, (_, i) => {
      const d = new Date(today);
      // console.log(`d :${d.toLocaleDateString('en-US', { weekday: 'long' })}`)
      d.setDate(d.getDate() - ((noDays - 1) - i));
      return getDateKey(d);
    });
    console.log(`dateSlots :${dateSlots}`)
    console.log(`daysOfWeek :${daysOfWeek}`)

    // Populate data array based on date positions
    daysOfWeek.forEach(day => {
      dateSlots.forEach((dateKey, index) => {
        const entryDate = new Date(dateKey);
        const entryDay = entryDate.toLocaleDateString('en-US', {
          weekday: 'long',
          timeZone: 'UTC'
        });

        if (entryDay === day) {
          const dayIndex = daysOfWeek.indexOf(day);
          weekData[dayIndex].data[index] = dailyConsumption[dateKey] || null;

          // Fill subsequent slots with the same value
          for (let i = index; i < noDays; i++) {
            weekData[dayIndex].data[i] = dailyConsumption[dateKey] || null;
          }
        }
      });
    });

    return weekData;
  }
  // Function to format values dynamically
  const formatTimeBar = (value) => {
    const seconds = value * 3600; // Convert hours to seconds
    const minutes = value * 60;   // Convert hours to minutes

    if (seconds < 60) {
      return `${seconds.toFixed(0)}s`; // Show seconds if < 1 min
    } else if (minutes < 60) {
      return `${minutes.toFixed(1)} min`; // Show minutes if < 1 hour
    } else {
      return `${value.toFixed(2)} hr`; // Show hours otherwise
    }
  };
  let numberOfItems = airconLabels.length;
  // console.log(`numberOfItems: ${numberOfItems}`)
  const barThickness = Math.max(10, 40 / numberOfItems);
  const options = {
    indexAxis: 'y', // horizontal bars
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            return formatTime(context.raw); // Format tooltip value dynamically
          },
        },
      },

    },
    scales: {
      x: {
        beginAtZero: true, grid: {
          display: false,
        },
        ticks: {
          callback: function (value) {
            return formatTime(value); // Format x-axis labels dynamically
          },
        },
      },
      y: {
        ticks: {
          font: { size: 14 }
        }, grid: {
          display: false,
        },
        barThickness: barThickness
      },
    },
  };
  useEffect(()=>{

  },[toolTipAircon])
  useEffect(() => {
    // // // console.log(user.Username)
    let actualBudget = 1;
    let dailyBudgetLimit = 1
    let savings 
    GetBudgetRecordsApi(user.Username)
      .then((res) => {
        const records = res.data[0]; // Assuming API returns an object with a "budgets" array
        setBudgetRecords(records);
        setPreference(records);

        if (records && records.budgets && records.budgets.length > 0) {
          // Find the latest budget record (comparing only date portion)
          const latestBudget = records.budgets.reduce((latest, current) => {
            // Log both dates to check their comparison
            console.log('Latest Start Date:', new Date(latest.startDate));
            console.log('Current Start Date:', new Date(current.startDate));
          
            // Compare the dates including time
            return new Date(current.startDate) > new Date(latest.startDate) ? current : latest;
          }, records.budgets[0]);
          
          // Update formData based on the latest record

          setFormData({
            dailyBudgetLimit: latestBudget.dailyBudgetLimit,
            budgetDate: dayjs(latestBudget.startDate)
          });
          // Calculate actual budget based on filterBudgetType
          const budgetLimit = latestBudget.dailyBudgetLimit;
          dailyBudgetLimit = budgetLimit

          if (filterBudgetType === "Day") {
            actualBudget = budgetLimit;
          } else if (filterBudgetType === "Week") {
            actualBudget = budgetLimit * 7;
          } else if (filterBudgetType === "Month") {
            actualBudget = budgetLimit * 31;
          } else if (filterBudgetType === "Year") {
            actualBudget = budgetLimit * 365;
          }
          setBudget(actualBudget);


        }
        return GetGSIDeviceConsumptionApi(user.Username);
      })
      .then((res) => {
        // // // // console.log(`res.data GSIDEVICE: `)
        // // console.log(`GSIDEVICECONSUMPTION: ${JSON.stringify(res.data)}`)

        let totalConsumption = 0
        let todaysDate = new Date()
        let dayInMiliSeconds = 24 * 60 * 60 * 1000
        let lastWeekDate = new Date(todaysDate.getTime() - 7 * dayInMiliSeconds)
        let lastMonthDate = new Date(todaysDate.getTime() - daysInThisMonth(todaysDate) * dayInMiliSeconds)
        let lastYearDate = new Date(todaysDate.getTime() - 365 * dayInMiliSeconds)
        // // console.log(`lastWeekDate: ${lastWeekDate}`)
        // // console.log(`lastYearDate: ${lastYearDate}`)
        // loop through all data
        if (filterBudgetType == "Day") {
          let weekDataset = weekFunction(res.data, 7)
          console.log("weekDataset")
          console.log(weekDataset)
          let weekLabelsList = []
          // // console.log(`weekLabels:${typeof(weekLabels)}`)
          for (let i = 0; i < weekDataset.length; i++) {
            let obj = weekDataset[i]
            let objDay = obj.label
            weekLabelsList.push(objDay)
          }
          setChartLabelsInput(weekLabelsList)

          let budgetLimitDataset = getBudgetLimitDataset(actualBudget, weekLabelsList)
          setChartDatasetsInput([...weekDataset, budgetLimitDataset])




        }
        else if (filterBudgetType == "Week") {
          console.log("MONTGH FONCUNTION")
          console.log(res.data)
          console.log(monthFunction(res.data, 4))
          let monthDataset = monthFunction(res.data, 4)
          let monthLabelsList = []
          for (let i = 0; i < monthDataset.length; i++) {
            let obj = monthDataset[i]
            let objDay = obj.label
            monthLabelsList.push(objDay)

          }
          setChartLabelsInput(monthLabelsList)
          console.log(actualBudget)
          let budgetLimitDataset = getBudgetLimitDataset(actualBudget, monthLabelsList)
          setChartDatasetsInput([...monthDataset, budgetLimitDataset])
        }
        else if (filterBudgetType == "Month") {
          console.log("Month Function")
          
          console.log(yearFunction(res.data))
          console.log(res.data)
          let functionOutput = yearFunction(res.data)
          let yearDataset =functionOutput.datasets
          let yearLabelsList = functionOutput.labels
          
          setChartLabelsInput(yearLabelsList)
          console.log(actualBudget)
          let budgetLimitDataset = getBudgetLimitDataset(actualBudget, yearLabelsList)
          setChartDatasetsInput([...yearDataset, budgetLimitDataset])
        }
        else if (filterBudgetType == "Year") {
          console.log("Month Function")
          
          console.log(pastThreeYearsFunction(res.data))
          console.log(res.data)
          let functionOutput = pastThreeYearsFunction(res.data)
          let yearDataset =functionOutput.datasets
          let yearLabelsList = functionOutput.labels
          
          setChartLabelsInput(yearLabelsList)
          console.log(actualBudget)
          let budgetLimitDataset = getBudgetLimitDataset(actualBudget, yearLabelsList)
          setChartDatasetsInput([...yearDataset, budgetLimitDataset])
        }
        for (let i = 0; i < res.data.length; i++) {
          // checkl if data startTime = today
          let deviceRecord = res.data[i]
          // // // console.log(`HERERER deviceRecord: ${deviceRecord.startTime}`)
          let deviceStartTime = new Date(deviceRecord.startTime)
          // // // console.log(`deviceStartTime: ${deviceStartTime}`)
          if (filterBudgetType == "Day") {
            if (todaysDate.setHours(0, 0, 0, 0) == deviceStartTime.setHours(0, 0, 0, 0)) {
              // // // // console.log(`deviceRecord is today: ${deviceRecord.startTime}`)
              if (deviceRecord.totalConsumption != null) {
                let consumption = Number(deviceRecord.totalConsumption)
                // // // // console.log(typeof (consumption))
                totalConsumption += consumption
                // // // // console.log(totalConsumption)
              }
            }
          } else if (filterBudgetType == "Week") {
            //loop through all data
            //check if data startTime = week range

            if (deviceStartTime >= lastWeekDate) {
              // // console.log(`WITHIN LAST WEEK: ${deviceStartTime.getDate()}`)
              if (deviceRecord.totalConsumption != null) {
                let consumption = Number(deviceRecord.totalConsumption)
                // // // // console.log(typeof (consumption))
                totalConsumption += consumption
                // // // // console.log(totalConsumption)
              }
            }

          } else if (filterBudgetType == "Month") {
            //loop through all data
            //check if data startTime = year range

            if (deviceStartTime >= lastMonthDate) {
              // // console.log(`WITHIN LAST MONTH: ${deviceStartTime}`)
              if (deviceRecord.totalConsumption != null) {
                let consumption = Number(deviceRecord.totalConsumption)
                // // // // console.log(typeof (consumption))
                totalConsumption += consumption
                // // // // console.log(totalConsumption)
              }
            }

          } else if (filterBudgetType == "Year") {
            //loop through all data
            //check if data startTime = year range

            if (deviceStartTime >= lastYearDate) {
              // // console.log(`WITHIN LAST YEAR: ${deviceStartTime}`)
              if (deviceRecord.totalConsumption != null) {
                let consumption = Number(deviceRecord.totalConsumption)
                // // // // console.log(typeof (consumption))
                totalConsumption += consumption
                // // // // console.log(totalConsumption)
              }
            }

          }




        }

        setDeviceConsumption(res.data)
        //START calculate total Consumption based ondevices            
        // // // // console.log(`totalConsumption:${totalConsumption}`)
        setTotalDeviceConsumption(totalConsumption)
        // END calculate total Consumption based ondevices
        // calculating AS PER amount https://www.spgroup.com.sg/our-services/utilities/tariff-information
        let totalCost = totalConsumption * costPerKwh
         savings = actualBudget - totalCost
        let todaysSavings = dailyBudgetLimit - totalCost
        setSavings(savings)
        setTotalConsumptionCost(totalCost)
        setTodaySavings(todaysSavings)
        // console.log(todaySavings)
        // // // // // console.log(res.data)

        //SAVINGS retrieved HENCE do check


        return GetHomeApi(user.Username);
      })
      .then((res) => {
        setHome(res.data);
        let toolTipMSG = "Usage left based on savings: \n\n";
        let labels = [];
        let data = [];
        if (savings !== null && savings >= 0) {
          res.data.forEach((item) => {
            const rooms = item.rooms;
            rooms.forEach((room) => {
              const roomName = room.roomName;
              toolTipMSG += `${roomName}:\n`;
              room.devices.forEach((device) => {
                let deviceModel = device.model;
                if (device.customModel !== "") {
                  deviceModel = device.customModel;
                }
                const consumptionKwh = device.consumption;
                const consumptionKwhCost = consumptionKwh * 0.365;
                const remainingTimeInHours = savings / consumptionKwhCost;
                const formattedTime = formatTime(remainingTimeInHours);
                toolTipMSG += `• ${deviceModel}: ${formattedTime} left\n`;
                labels.push(deviceModel);
                data.push(remainingTimeInHours);
              });
            });
          });
        } else {
          toolTipMSG += `No savings\n`;
        }
        setToolTipAircon(toolTipMSG);
        setAirconLabels(labels);
        setChartData({
          labels: labels,
          datasets: [
            {
              label: "Usage Left (hours)",
              data: data,
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        });
        setLoading(false);
      })
      .catch((err) => {
        enqueueSnackbar('Failed to fetch data', { variant: "error" });
        setLoading(false);
      });
    // GetPreferenceApi(user.Username)
    //   .then((res) => {
    //     setPreference(res.data[0])

    //     let preference = res.data[0]
    //     // // // console.log(`preference: ${JSON.stringify(preference)}`)
    //     let actualBudget = 1
    //     let budgetLimit = res.data[0].budgets.dailyBudgetLimit
    //     if (filterBudgetType == "Day") {
    //       actualBudget = budgetLimit
    //     } else if (filterBudgetType == "Week") {
    //       actualBudget = budgetLimit * 7
    //     } else if (filterBudgetType == "Month") {
    //       actualBudget = budgetLimit * 31
    //     } else if (filterBudgetType == "Year") {
    //       actualBudget = budgetLimit * 365
    //     }
    //     setBudget(actualBudget)

    //     setFormData({
    //       dailyBudgetLimit: res.data[0].budgets.dailyBudgetLimit
    //     })


    //     // // // // // console.log(res.data)
    // GetGSIDeviceConsumptionApi(user.Username)
    //   .then((res) => {
    //     // // // // console.log(`res.data GSIDEVICE: `)
    //     // // console.log(`GSIDEVICECONSUMPTION: ${JSON.stringify(res.data)}`)
    //     let totalConsumption = 0
    //     let todaysDate = new Date()
    //     let dayInMiliSeconds = 24 * 60 * 60 * 1000
    //     let lastWeekDate = new Date(todaysDate.getTime() - 7 * dayInMiliSeconds)
    //     let lastMonthDate = new Date(todaysDate.getTime() - daysInThisMonth(todaysDate) * dayInMiliSeconds)
    //     let lastYearDate = new Date(todaysDate.getTime() - 365 * dayInMiliSeconds)
    //     // // console.log(`lastWeekDate: ${lastWeekDate}`)
    //     // // console.log(`lastYearDate: ${lastYearDate}`)
    //     // loop through all data
    //     if (filterBudgetType == "Day") {
    //       let weekDataset = weekFunction(res.data, 7)
    //       // console.log("weekDataset")
    //       let weekLabelsList = []
    //       // // console.log(`weekLabels:${typeof(weekLabels)}`)
    //       for (let i = 0; i < weekDataset.length; i++) {
    //         let obj = weekDataset[i]
    //         let objDay = obj.label
    //         weekLabelsList.push(objDay)
    //       }
    //       // console.log(weekLabelsList)
    //       setChartLabelsInput(weekLabelsList)
    //       weekDataset[weekDataset.length - 1].data = addByValue(actualBudget, weekLabelsList.length)
    //       // console.log("weekDataset")
    //       // console.log(weekDataset)
    //       setChartDatasetsInput(weekDataset)

    //       // const [chartLabelsInput, setChartLabelsInput] = useState(null);
    //       // const [chartDatasetsInput, setChartDatasetsInput] = useState(null);
    //       // const [chartTitleText, setChartTitleText] = useState(null);



    //     }
    //     for (let i = 0; i < res.data.length; i++) {
    //       // checkl if data startTime = today
    //       let deviceRecord = res.data[i]
    //       // // // console.log(`HERERER deviceRecord: ${deviceRecord.startTime}`)
    //       let deviceStartTime = new Date(deviceRecord.startTime)
    //       // // // console.log(`deviceStartTime: ${deviceStartTime}`)
    //       if (filterBudgetType == "Day") {
    //         if (todaysDate.setHours(0, 0, 0, 0) == deviceStartTime.setHours(0, 0, 0, 0)) {
    //           // // // // console.log(`deviceRecord is today: ${deviceRecord.startTime}`)
    //           if (deviceRecord.totalConsumption != null) {
    //             let consumption = Number(deviceRecord.totalConsumption)
    //             // // // // console.log(typeof (consumption))
    //             totalConsumption += consumption
    //             // // // // console.log(totalConsumption)
    //           }
    //         }
    //       } else if (filterBudgetType == "Week") {
    //         //loop through all data
    //         //check if data startTime = week range

    //         if (deviceStartTime >= lastWeekDate) {
    //           // // console.log(`WITHIN LAST WEEK: ${deviceStartTime.getDate()}`)
    //           if (deviceRecord.totalConsumption != null) {
    //             let consumption = Number(deviceRecord.totalConsumption)
    //             // // // // console.log(typeof (consumption))
    //             totalConsumption += consumption
    //             // // // // console.log(totalConsumption)
    //           }
    //         }

    //       } else if (filterBudgetType == "Month") {
    //         //loop through all data
    //         //check if data startTime = year range

    //         if (deviceStartTime >= lastMonthDate) {
    //           // // console.log(`WITHIN LAST MONTH: ${deviceStartTime}`)
    //           if (deviceRecord.totalConsumption != null) {
    //             let consumption = Number(deviceRecord.totalConsumption)
    //             // // // // console.log(typeof (consumption))
    //             totalConsumption += consumption
    //             // // // // console.log(totalConsumption)
    //           }
    //         }

    //       } else if (filterBudgetType == "Year") {
    //         //loop through all data
    //         //check if data startTime = year range

    //         if (deviceStartTime >= lastYearDate) {
    //           // // console.log(`WITHIN LAST YEAR: ${deviceStartTime}`)
    //           if (deviceRecord.totalConsumption != null) {
    //             let consumption = Number(deviceRecord.totalConsumption)
    //             // // // // console.log(typeof (consumption))
    //             totalConsumption += consumption
    //             // // // // console.log(totalConsumption)
    //           }
    //         }

    //       }



    //     }

    //     setDeviceConsumption(res.data)
    //     //START calculate total Consumption based ondevices            
    //     // // // // console.log(`totalConsumption:${totalConsumption}`)
    //     setTotalDeviceConsumption(totalConsumption)
    //     // END calculate total Consumption based ondevices
    //     // calculating AS PER amount https://www.spgroup.com.sg/our-services/utilities/tariff-information
    //     let totalCost = totalConsumption * costPerKwh
    //     let savings = actualBudget - totalCost
    //     let todaysSavings = budgetLimit - totalCost
    //     setSavings(savings)
    //     setTotalConsumptionCost(totalCost)
    //     setTodaySavings(todaysSavings)
    //     // console.log(todaySavings)
    //     // // // // // console.log(res.data)

    //     //SAVINGS retrieved HENCE do check

    //     GetHomeApi(user.Username)
    //       .then((res) => {
    //         setHome(res.data);
    //         let toolTipMSG = "Usage left based on savings: \n\n";
    //         let labels = [];
    //         let data = [];
    //         let actualSavings = 0


    //         if (savings !== null && savings >= 0) {
    //           let homeData = res.data;

    //           for (let i = 0; i < homeData.length; i++) {
    //             let rooms = homeData[i]["rooms"];
    //             for (let j = 0; j < rooms.length; j++) {
    //               let room = rooms[j];
    //               let roomName = room["roomName"];
    //               toolTipMSG += `${roomName}: \n`;
    //               let devices = room["devices"];

    //               for (let k = 0; k < devices.length; k++) {
    //                 let device = devices[k];
    //                 let deviceModel = device["model"];
    //                 if (device["customModel"] !== "") {
    //                   deviceModel = device["customModel"];
    //                 }
    //                 let consumptionKwh = device["consumption"];
    //                 let consumptionKwhCost = consumptionKwh * 0.365;
    //                 let remainingTimeInHours = savings / consumptionKwhCost;
    //                 let formattedRemainingTime = parseFloat(remainingTimeInHours); // Convert to hours with 2 decimal places
    //                 let formattedTime = formatTime(remainingTimeInHours);
    //                 toolTipMSG += `• ${deviceModel}: ${formattedTime} left \n`;

    //                 labels.push(deviceModel);
    //                 data.push(formattedRemainingTime);
    //               }
    //             }
    //           }
    //         } else {
    //           toolTipMSG += ` No savings \n`;
    //         }

    //         setToolTipAircon(toolTipMSG);
    //         setAirconLabels(labels)
    //         setChartData({
    //           labels: labels,
    //           datasets: [
    //             {
    //               label: "Usage Left (hours)",
    //               data: data,
    //               backgroundColor: "rgba(54, 162, 235, 0.6)",
    //               borderColor: "rgba(54, 162, 235, 1)",
    //               borderWidth: 1,
    //             },
    //           ],
    //         });

    //       })
    //       .catch((err) => {
    //         enqueueSnackbar("Failed to fetch home data", { variant: "error" });
    //       });

    //   })
    //   .catch((err) => {
    //     // // // // // console.log(`err:${err.status}`)
    //     if (404 == err.status) {
    //       setDeviceConsumption([])
    //     } else {
    //       enqueueSnackbar('Failed to fetch Device Consumption data', { variant: "error" })
    //     }
    //   })
    // })
    //   .catch((err) => {
    //     // // // // // console.log(`err:${err.status}`)
    //     if (404 == err.status) {

    //       setPreference(0)
    //     } else {
    //       enqueueSnackbar('Failed to fetch Preference data', { variant: "error" })
    //     }



    //   })
  }, [user, filterBudgetType]);


  const handleFilterBudgetTypeChange = (event, newTimeRange) => {
    if (newTimeRange !== null) {
      setFilterBudgetType(newTimeRange);
    }

  };
  // chart options: today = Past 7 Days. Weekly =Past month. Monthly = Past year. Yearly = Past 4 years
  // past7DAys = 7 objs aka 7 days
  // each obj = { label: day, data: listOf7Items, backgroundColor: color, barThickness: 100, stack: 'Stack 0' }
  // data: [day1TotalConsumption, day2TotalConsumption, day3TotalConsumption, day4TotalConsumption
  // need to have budgetStartDate 

  // datasetInput = [ {obj1}]
  // {obj1} = {
  //     label: 'Saturday',
  //     data: [1, 1, 1, 1], // Consistent value for all categories
  //     backgroundColor: 'rgba(100, 150, 200, 0.5)',
  //     barThickness: 100, // Fixed bar thickness
  //     stack: 'Stack 0', // Stacked with other bars
  // }
  // weekFunction => list[ {objMonday}, {objTuesday}, {objWednesday}, {objThursday}, {objFriday}, {objSaturday}, {objSunday} ]

  // datasetsInput:
  // [
  //   // Bar datasets for each day
  //   {
  //     label: 'Saturday',
  //     data: [1, 1, 1, 1], // Consistent value for all categories
  //     backgroundColor: 'rgba(100, 150, 200, 0.5)',
  //     barThickness: 100, // Fixed bar thickness
  //     stack: 'Stack 0', // Stacked with other bars
  //   },
  //   {
  //     label: 'Sunday',
  //     data: [null, 3, 3, 3], // Consistent value for all categories
  //     backgroundColor: 'rgba(54, 162, 2100, 0.5)',
  //     barThickness: 100, // Fixed bar thickness
  //     stack: 'Stack 0', // Stacked with other bars
  //   },
  //   {
  //     label: 'Monday',
  //     data: [null, null, 2, 2], // Consistent value for all categories
  //     backgroundColor: 'rgba(75, 192, 192, 0.5)',
  //     barThickness: 100, // Fixed bar thickness
  //     stack: 'Stack 0', // Stacked with other bars
  //   },
  //   {
  //     label: 'Tuesday',
  //     data: [null, null, null, todayConsumption], // Consistent value for all categories
  //     backgroundColor: 'rgba(70, 80, 100, 0.8)',
  //     barThickness: 100, // Fixed bar thickness
  //     stack: 'Stack 0', // Stacked with other bars
  //   },
  //   // Line dataset for the linear line

  //   {
  //     label: 'Budget Limit',
  //     data: budgetLimit != null ? addByValue(Number(budgetLimit), 4) : addByValue(4, 4), // Consistent value for all categories    
  //     borderColor: 'rgb(255, 0, 0)', // Red color for the line
  //     borderWidth: 2,
  //     type: 'line', // Specify this dataset as a line
  //     fill: false, // Do not fill under the line
  //   },
  // ]



  return (
    <>
      <Box padding={2}>

        <Grid container direction={'row'} display={'flex'} justifyContent={'end'} lg={12}>

          <Grid>

          </Grid>
        </Grid>
        <Grid container direction="column" spacing={2} sx={{ height: "100%" }}>
          <Grid lg={6} item container direction="row" spacing={2}>
            <Grid item lg={4}>
              <a href='/dashboard' style={{ textDecoration: 'none' }}>


                <Card sx={{ borderRadius: 5, width: "100%", height: 170 }}>
                  <Grid container direction="column">
                    <Grid container direction="row" sx={{ marginTop: 2 }}>
                      <Grid item lg={2}>
                        <img style={{ width: 50, marginLeft: 15, }} src="https://i.ibb.co/tYFNbxN/energy.png" alt="" />
                      </Grid>
                      <Grid item lg={9}>
                        <Typography fontSize={22} marginTop={1} marginLeft={2}> {filterBudgetType}'s Usage Cost</Typography>
                      </Grid>

                    </Grid>
                    <Grid lg={12} container direction={'row'} display={'flex'} justifyContent={'center'}>

                      <Typography fontSize={28}>
                        {totalConsumptionCost === null ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress />
                          </Box>
                        ) : (
                          <>

                            $ {totalConsumptionCost?.toFixed(2)}


                          </>
                        )}

                      </Typography>
                    </Grid>


                  </Grid>
                </Card>
              </a>
            </Grid>
            <Grid item lg={4}>
              <Card sx={{ borderRadius: 5, width: "100%", height: 170 }}>
                <Grid container direction="column">
                  <Grid container direction="row" sx={{ marginTop: 2 }}>
                    <Grid item lg={2}>
                      <img style={{ width: 50, marginLeft: 15, }} src="https://cdn-icons-png.flaticon.com/128/13798/13798822.png" alt="" />
                    </Grid>
                    <Grid container direction={'row'} display={'flex'} justifyContent={'space-between'} lg={10} >

                      <Grid item >
                        <Typography fontSize={22} marginTop={1} marginLeft={2}> Savings <span style={{ fontSize: 14 }}>(Remaining Budget)</span> </Typography>
                      </Grid>
                      <Grid item>
                        <CustomWidthTooltip sx={{ whiteSpace: 'pre-line' }} title={<span style={{ whiteSpace: 'pre-line' }}>{toolTipAircon}</span>} followCursor data-html="true" >
                          <Button >
                            <img style={{ width: 20 }} src="https://cdn-icons-png.flaticon.com/128/157/157933.png" alt="" />
                          </Button>

                        </CustomWidthTooltip>
                      </Grid>
                    </Grid>


                  </Grid>
                  <Grid lg={12} container direction={'row'} display={'flex'} justifyContent={'center'}  >

                    {
                      budget == null ? (
                        <>
                          Savings not set
                        </>
                      ) : (
                        <>
                          {savings === null ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                              <CircularProgress />
                            </Box>
                          ) : (
                            <>
                              {savings > 0 ? (
                                <>
                                  <Grid item><img style={{ width: 30, height: 30, marginTop: 5 }} src="https://cdn-icons-png.flaticon.com/128/14035/14035529.png" alt="" /></Grid>
                                  <Grid sx={{ pr: 4 }}>
                                    <Typography fontSize={28}>${savings?.toFixed(2)}</Typography>

                                  </Grid>
                                </>

                              ) : (
                                <>
                                  <Grid item><img style={{ width: 40, height: 40, marginTop: 0 }} src="https://cdn-icons-png.flaticon.com/128/14034/14034783.png" alt="" /></Grid>
                                  <Grid sx={{ pr: 4 }}>
                                    <Typography fontSize={28}>${Number(savings.toString().slice(1)).toFixed(2)}</Typography>

                                  </Grid>
                                </>

                              )}




                            </>
                          )}
                        </>
                      )
                    }




                  </Grid>


                </Grid>
              </Card>
            </Grid>
            <Grid item lg={4}>
              <Card sx={{ borderRadius: 5, width: "100%", height: 170 }}>
                <Grid container direction="column">
                  <Grid container direction="row" sx={{ marginTop: 2 }}>
                    <Grid item lg={2}>
                      <img style={{ width: 48, marginLeft: 17, marginTop: 3 }} src="https://i.ibb.co/d5FcLHr/budget.png" alt="" />
                    </Grid>
                    <Grid container direction={'row'} display={'flex'} justifyContent={'space-between'} lg={10} >
                      <Grid item>
                        <Typography fontSize={22} marginTop={1} marginLeft={2}> Budget</Typography>
                      </Grid>
                      <Grid item>
                        <Button onClick={() => (setOpenBudgetDialog(true))}>
                          <img style={{ width: 30 }} src="https://cdn-icons-png.flaticon.com/128/2311/2311524.png" alt="" />
                        </Button>
                      </Grid>


                    </Grid>

                  </Grid>
                  <Grid lg={12} container direction={'row'} display={'flex'} justifyContent={'center'}>


                    {budget === null ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <>
                        {budget == null ? (
                          <>
                            Budget is not set
                          </>
                        ) : (
                          <>
                            <Typography fontSize={28}>$ {Number(budget).toFixed(2)}</Typography>
                          </>
                        )}
                      </>
                    )}

                  </Grid>


                </Grid>
              </Card>
            </Grid>
          </Grid>
          <Grid item container direction="row" spacing={2}>
            <Grid item lg={4}>
              <Card sx={{ borderRadius: 5, width: "100%", height: 340 }}>
                <Box>
                  <Box>

                    <Grid container flexGrow={1} alignItems="center">

                      <Typography mt={2} ml={3} fontSize={22}>
                        Usage left
                      </Typography>



                    </Grid>


                  </Box>

                  {
                    budget == null && chartData == null ? (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                          <CircularProgress />
                        </Box>
                      </>
                    ) :  chartData && chartData.datasets.length > 0 && chartData.datasets[0].data.length > 0 && (
                      <>
                      {
                        toolTipAircon == "Usage left based on savings: \n \nLoading..." ? (
                          <>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                          <CircularProgress />
                        </Box>
                          
                          </>
                          
                        ) : (
                          <>
                          <Bar data={chartData} options={options} height="150%" />
                          </>
                        )
                      }
                        

                      </>
                    ) 
                  }
                </Box>




              </Card>
            </Grid>
            <Grid item lg={8}>
              <Card sx={{ borderRadius: 5, minHeight: 340, maxHeight: 340 }}>


                <Box>
                  <Box>

                    <Grid container flexGrow={1} alignItems="center">

                      <Typography mt={2} ml={3} fontSize={22}>
                        Spendings Overtime
                      </Typography>

                      <Box sx={{ flexGrow: 0.9 }}></Box>

                      {/* Here tab */}
                      <Box mt={1}>
                        <ToggleButtonGroup
                          value={filterBudgetType}
                          exclusive
                          onChange={(event, newTimeRange) => handleFilterBudgetTypeChange(event, newTimeRange)}
                          aria-label="time range"
                        >
                          <ToggleButton value="Day" aria-label="Day">
                            Day
                          </ToggleButton>
                          <ToggleButton value="Week" aria-label="Day">
                            Week
                          </ToggleButton>
                          <ToggleButton value="Month" aria-label="Month">
                            Month
                          </ToggleButton>
                          <ToggleButton value="Year" aria-label="Year">
                            Year
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Box>



                    </Grid>


                  </Box>

                  {
                    budget == 0 ? (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                          <CircularProgress />
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'bottom', alignItems: 'center', height: '100%' }}>
                          <StackedBarChart height="65%" labelsInput={chartLabelsInput} datasetsInput={chartDatasetsInput} titleText={chartTitleText} budgetLimit={preference?.budgets?.dailyBudgetLimit} todayConsumption={totalConsumptionCost} />
                        </Box>

                      </>
                    )
                  }
                </Box>




              </Card>
            </Grid>

          </Grid>



        </Grid>
      </Box>
      <BudgetDialog open={openBudgetDialog} handleClose={handleCloseBudgetDialog} errors={errors} handleEdit={handleEditBudget} handleInputChange={handleBudgetInputChange} formData={formData} />

    </>
  )
}

export default Budget