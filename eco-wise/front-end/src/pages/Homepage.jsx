import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom'
import { Box, Paper, Divider, Typography, Grid, Card } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { jwtDecode } from 'jwt-decode';


function Homepage() {
  return (
    <>
      <Box padding={2}>
        <Breadcrumbs sx={{ mb: 1 }} >
          {/* <Link underline="hover" style={{ textDecoration: "none", color: "grey" }} href="/">
            Overview
          </Link> */}
          <Link
            aria-current="page"   
            underline="hover"
            style={{ textDecoration: "underline", color: "black" }}
            href="/"

          >
            Home
          </Link>

        </Breadcrumbs>

        <Grid container direction="column" spacing={2} sx={{ height: "100%" }}>
          <Grid lg={6} item container direction="row" spacing={2}>
            <Grid item lg={4}>
              <Card sx={{ width: "100%", height: 170 }}>
                <Grid container direction="column">
                  <Grid  container direction="row" sx={{marginTop:2}}>
                    <Grid item lg={2}>
                      <img style={{ width: 50, marginLeft: 16, }} src="https://cdn-icons-png.flaticon.com/128/1163/1163624.png" alt="" />
                    </Grid>
                    <Grid item lg={9}>
                      <Typography fontSize={22} marginTop={1} marginLeft={2}> Current </Typography>
                    </Grid>

                  </Grid>
                  <Grid lg={6} container direction="row">

                    <Typography>
                      
                    </Typography>
                  </Grid>


                </Grid>
              </Card>
            </Grid>
            <Grid item lg={4}>
              <Card sx={{ width: "100%", height: 170 }}>
                <Grid container direction="column">
                  <Grid  container direction="row" sx={{marginTop:2}}>
                    <Grid item lg={2}>
                      <img style={{ width: 50, marginLeft: 15, }} src="https://cdn-icons-png.flaticon.com/128/13798/13798822.png" alt="" />
                    </Grid>
                    <Grid item lg={9}>
                      <Typography fontSize={22} marginTop={1} marginLeft={2}> Total Savings</Typography>
                    </Grid>

                  </Grid>
                  <Grid lg={6} container direction="row">

                    <Typography>
                      
                    </Typography>
                  </Grid>


                </Grid>
              </Card>
            </Grid>
            <Grid item lg={4}>
              <Card sx={{ width: "100%", height: 170 }}>
                <Grid container direction="column">
                  <Grid  container direction="row" sx={{marginTop:2}}>
                    <Grid item lg={2}>
                      <img style={{ width: 50, marginLeft: 15, }} src="https://i.ibb.co/tYFNbxN/energy.png" alt="" />
                    </Grid>
                    <Grid item lg={9}>
                      <Typography fontSize={22} marginTop={1} marginLeft={2}> Energy Consumption</Typography>
                    </Grid>

                  </Grid>
                  <Grid lg={6} container direction="row">

                    <Typography>
                      
                    </Typography>
                  </Grid>


                </Grid>
              </Card>
            </Grid>
          </Grid>
          <Grid lg={6} item container direction="row" spacing={2}>
            <Grid item lg={12}>
              <Card sx={{ width: "100%", height: 340 }}>
                Placeholder Graph
              </Card>
            </Grid>

          </Grid>



        </Grid>
      </Box>

    </>
  )
}

export default Homepage