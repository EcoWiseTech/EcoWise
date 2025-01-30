import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom'
import { Box, Paper, Divider, Typography, Grid, Card, CircularProgress, Button } from '@mui/material';
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
import { Line } from 'react-chartjs-2';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend
);

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

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      text: '',
    },
  },
};
const labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const data = {
  labels: labels,
  datasets: [
    {
      label: 'Budget Consumption',
      data: [10, 20, 30, 40, 50, 60, 70],
      fill: false,
      borderColor: 'rgb(255, 42, 0)',
      tension: 0.1
    },
    {
      label: 'Actual Consumption',
      data: [11, 20, 34, 38, 47],
      type: "bar",
      backgroundColor: 'rgb(3, 227, 227)',
      tension: 0.1
    }
  ]
};
const CustomWidthTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    minWidth: 150,
  },
});

// Define the validation schema with yup
const schema = yup.object({
  dailyBudgetLimit: yup.number().required("Budget is required"),
}).required();
function Budget() {
  const { user, RefreshUser } = useUserContext()
  const [preference, setPreference] = useState(null); // Set initial value to null to indicate loading
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
    // // // // console.log(user)
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

    const requestObj = {
      ...preference,
      userId: user.Username,
      uuid: preference.uuid,
      budgets: { ...preference.budgets, dailyBudgetLimit: formData.dailyBudgetLimit },
      totalCost: totalConsumptionCost
    };
    if (preference === 0) {
      CreatePreferenceApi(requestObj)
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
      UpdatePreferenceApi(requestObj)
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

  function weekFunction(GSIDEVICECONSUMPTION) {
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
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      // console.log(`d :${d.toLocaleDateString('en-US', { weekday: 'long' })}`)
      d.setDate(d.getDate() - (6 - i));
      return getDayKey(d);
    });
    // console.log(`daysOfWeek :${daysOfWeek}`)
    // Create base structure with 4 null slots
    const weekData = daysOfWeek.map(day => ({
      label: day,
      data: [null, null, null, null,null,null,null],
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
    const dateSlots = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      // console.log(`d :${d.toLocaleDateString('en-US', { weekday: 'long' })}`)
      d.setDate(d.getDate() - (6 - i));
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
          for (let i = index; i < 7; i++) {
            weekData[dayIndex].data[i] = dailyConsumption[dateKey] || null;
          }
        }
      });
    });

    return weekData;
  }
  useEffect(() => {
    // // console.log(user.Username)
    GetPreferenceApi(user.Username)
      .then((res) => {
        setPreference(res.data[0])

        let preference = res.data[0]
        // console.log(`preference: ${JSON.stringify(preference)}`)
        let actualBudget = 1
        let dailyBudgetLimit = res.data[0].budgets.dailyBudgetLimit
        if (filterBudgetType == "Day") {
          actualBudget = dailyBudgetLimit
        } else if (filterBudgetType == "Week") {
          actualBudget = dailyBudgetLimit * 7
        } else if (filterBudgetType == "Month") {
          actualBudget = dailyBudgetLimit * 31
        } else if (filterBudgetType == "Year") {
          actualBudget = dailyBudgetLimit * 365
        }
        setBudget(actualBudget)

        setFormData({
          dailyBudgetLimit: res.data[0].budgets.dailyBudgetLimit
        })


        // // // // console.log(res.data)
        GetGSIDeviceConsumptionApi(user.Username)
          .then((res) => {
            // // // console.log(`res.data GSIDEVICE: `)
            // console.log(`GSIDEVICECONSUMPTION: ${JSON.stringify(res.data)}`)
            let totalConsumption = 0
            let todaysDate = new Date()
            let dayInMiliSeconds = 24 * 60 * 60 * 1000
            let lastWeekDate = new Date(todaysDate.getTime() - 7 * dayInMiliSeconds)
            let lastMonthDate = new Date(todaysDate.getTime() - daysInThisMonth(todaysDate) * dayInMiliSeconds)
            let lastYearDate = new Date(todaysDate.getTime() - 365 * dayInMiliSeconds)
            // console.log(`lastWeekDate: ${lastWeekDate}`)
            // console.log(`lastYearDate: ${lastYearDate}`)
            // loop through all data
            if (filterBudgetType == "Day") {
              let weekDataset = weekFunction(res.data)
              let weekLabelsList = []
              // console.log(`weekLabels:${typeof(weekLabels)}`)
              for (let i = 0; i < weekDataset.length; i++) {
                let obj = weekDataset[i]
                let objDay = obj.label
                weekLabelsList.push(objDay)
              }
              console.log(weekLabelsList)
              setChartLabelsInput(weekLabelsList)
              setChartDatasetsInput(weekDataset)
              setChartTitleText("Past 7 Days")

              // const [chartLabelsInput, setChartLabelsInput] = useState(null);
              // const [chartDatasetsInput, setChartDatasetsInput] = useState(null);
              // const [chartTitleText, setChartTitleText] = useState(null);



            }
            for (let i = 0; i < res.data.length; i++) {
              // checkl if data startTime = today
              let deviceRecord = res.data[i]
              // // console.log(`HERERER deviceRecord: ${deviceRecord.startTime}`)
              let deviceStartTime = new Date(deviceRecord.startTime)
              // // console.log(`deviceStartTime: ${deviceStartTime}`)
              if (filterBudgetType == "Day") {
                if (todaysDate.setHours(0, 0, 0, 0) == deviceStartTime.setHours(0, 0, 0, 0)) {
                  // // // console.log(`deviceRecord is today: ${deviceRecord.startTime}`)
                  if (deviceRecord.totalConsumption != null) {
                    let consumption = Number(deviceRecord.totalConsumption)
                    // // // console.log(typeof (consumption))
                    totalConsumption += consumption
                    // // // console.log(totalConsumption)
                  }
                }
              } else if (filterBudgetType == "Week") {
                //loop through all data
                //check if data startTime = week range

                if (deviceStartTime >= lastWeekDate) {
                  // console.log(`WITHIN LAST WEEK: ${deviceStartTime.getDate()}`)
                  if (deviceRecord.totalConsumption != null) {
                    let consumption = Number(deviceRecord.totalConsumption)
                    // // // console.log(typeof (consumption))
                    totalConsumption += consumption
                    // // // console.log(totalConsumption)
                  }
                }

              } else if (filterBudgetType == "Month") {
                //loop through all data
                //check if data startTime = year range

                if (deviceStartTime >= lastMonthDate) {
                  // console.log(`WITHIN LAST MONTH: ${deviceStartTime}`)
                  if (deviceRecord.totalConsumption != null) {
                    let consumption = Number(deviceRecord.totalConsumption)
                    // // // console.log(typeof (consumption))
                    totalConsumption += consumption
                    // // // console.log(totalConsumption)
                  }
                }

              } else if (filterBudgetType == "Year") {
                //loop through all data
                //check if data startTime = year range

                if (deviceStartTime >= lastYearDate) {
                  // console.log(`WITHIN LAST YEAR: ${deviceStartTime}`)
                  if (deviceRecord.totalConsumption != null) {
                    let consumption = Number(deviceRecord.totalConsumption)
                    // // // console.log(typeof (consumption))
                    totalConsumption += consumption
                    // // // console.log(totalConsumption)
                  }
                }

              }



            }

            setDeviceConsumption(res.data)
            //START calculate total Consumption based ondevices            
            // // // console.log(`totalConsumption:${totalConsumption}`)
            setTotalDeviceConsumption(totalConsumption)
            // END calculate total Consumption based ondevices
            // calculating AS PER amount https://www.spgroup.com.sg/our-services/utilities/tariff-information
            let totalCost = totalConsumption * costPerKwh
            let savings = actualBudget - totalCost
            let todaysSavings = dailyBudgetLimit - totalCost
            setSavings(savings)
            setTotalConsumptionCost(totalCost)
            setTodaySavings(todaysSavings)
            // // // // console.log(res.data)

            //SAVINGS retrieved HENCE do check
            GetHomeApi(user.Username)
              .then((res) => {
                setHome(res.data)
                // // // console.log(`HOMEDATA: ${JSON.stringify(res.data)}`);
                // // console.log(`todaysSavings:${todaysSavings}`)
                let toolTipMSG = "Usage left based on savings: \n\n"
                // // console.log(`!isNaN(todaysSavings):${!isNaN(todaysSavings)}`)
                // // console.log(`todaysSavings != null:${todaysSavings != null}`)
                if (todaysSavings !== null && todaysSavings >= 0) {
                  let homeData = res.data

                  for (let i = 0; i < homeData.length; i++) {
                    let rooms = homeData[i]["rooms"]
                    for (let j = 0; j < rooms.length; j++) {
                      let room = rooms[j]
                      let roomName = room["roomName"]
                      // // console.log(`${roomName}:`)
                      toolTipMSG += `${roomName}: \n`
                      let devices = room["devices"]
                      for (let k = 0; k < devices.length; k++) {
                        let device = devices[k]
                        let deviceModel = device["model"]
                        if (device["customModel"] != "") {
                          deviceModel = device["customModel"]
                        }
                        let consumptionKwh = device["consumption"]
                        // calculating AS PER amount https://www.spgroup.com.sg/our-services/utilities/tariff-information

                        let consumptionKwhCost = consumptionKwh * 0.365
                        let savings = todaysSavings
                        let remainingTimeInHours = (savings / consumptionKwhCost)
                        let formattedRemainingTime = convertToHoursAndMinutes(remainingTimeInHours)
                        // savings / consumptionKwhCost = how many hours left
                        // // console.log(`• ${deviceModel}: ${formattedRemainingTime} `)
                        toolTipMSG += `• ${deviceModel}: ${formattedRemainingTime} left \n`

                      }
                    }

                  }
                } else {
                  toolTipMSG += ` No savings \n`
                }


                //setToolTipAircon(toolTipMSG)
                setToolTipAircon(toolTipMSG)

              })
              .catch((err) => {
                enqueueSnackbar('Failed to fetch home data', { variant: "error" })
              })
          })
          .catch((err) => {
            // // // // console.log(`err:${err.status}`)
            if (404 == err.status) {
              setDeviceConsumption([])
            } else {
              enqueueSnackbar('Failed to fetch Device Consumption data', { variant: "error" })
            }
          })
      })
      .catch((err) => {
        // // // // console.log(`err:${err.status}`)
        if (404 == err.status) {

          setPreference(0)
        } else {
          enqueueSnackbar('Failed to fetch Preference data', { variant: "error" })
        }



      })
  }, [user, filterBudgetType]);

  const handleFilterBudgetTypeChange = (event) => {
    setFilterBudgetType(event.target.value);
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

        <Grid container direction={'row'} display={'flex'} justifyContent={'space-between'} lg={12}>
          <Grid>
            <Typography>
              test
            </Typography>
          </Grid>
          <Grid>
            <Typography>
              <FormControl  >
                <Select
                  value={filterBudgetType}
                  onChange={handleFilterBudgetTypeChange}
                  displayEmpty
                >
                  <MenuItem value={"Day"}>
                    <em>Day</em>
                  </MenuItem>
                  <MenuItem value={"Week"}>Week</MenuItem>
                  <MenuItem value={"Month"}>Month</MenuItem>
                  <MenuItem value={"Year"}>Year</MenuItem>
                  <MenuItem value={"Custom"}>Custom</MenuItem>
                </Select>
              </FormControl>
            </Typography>
          </Grid>
        </Grid>
        <Grid container direction="column" spacing={2} sx={{ height: "100%" }}>
          <Grid lg={6} item container direction="row" spacing={2}>
            <Grid item lg={4}>
              <a href='/dashboard' style={{ textDecoration: 'none' }}>


                <Card sx={{ width: "100%", height: 170 }}>
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
              <Card sx={{ width: "100%", height: 170 }}>
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
              <Card sx={{ width: "100%", height: 170 }}>
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


                    {preference === null ? (
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
            <Grid item lg={12}>
              <Card sx={{ width: "100%", height: 340 }}>
                <Grid ontainer direction="row">

                  <Grid width={'auto'} height={'auto'} >
                    {
                      preference?.budgets?.dailyBudgetLimit == null ? (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress />
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <StackedBarChart labelsInput={chartLabelsInput} datasetsInput={chartDatasetsInput} titleText={chartTitleText} height={"60%"} budgetLimit={preference?.budgets?.dailyBudgetLimit} todayConsumption={totalConsumptionCost} />
                          </Box>

                        </>
                      )
                    }
                  </Grid>
                </Grid>




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