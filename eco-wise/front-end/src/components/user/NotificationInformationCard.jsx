import React from 'react';
import { Card, CardContent, CardActions, Grid, TextField, Box, Typography, Avatar, Switch } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FileUploadIcon from '@mui/icons-material/UploadFile';
import BadgeIcon from '@mui/icons-material/Badge';
import EditIcon from '@mui/icons-material/Edit';
import CardTitle from '../common/CardTitle';
import NotificationsIcon from '@mui/icons-material/Notifications';


const NotificationInformationCard = ({
  allNotificationChecked,
  handleAllNotificationInputChange,
  budgetNotificationChecked,
  handleBudgetNotificationInputChange,
  isModified,
  isLoading,
  handleEditNotification
}) => {
  return (
    <Card>
      <CardContent>
        <CardTitle icon={<NotificationsIcon />} title="Notification Settings" />
        <Grid container spacing={2} marginTop="1rem">
          <Grid item container spacing={1} xs={12} sm={12} md={12} lg={12} direction={'row'}>
            <Grid item xs={12}>
              <Grid container direction={'row'} display={'flex'} justifyContent={'space-between'} sx={{ px: 5}}>
                <Grid item>
                  <Typography fontSize={18}>
                    Turn on All Notifications
                  </Typography>
                </Grid>
                <Grid item>
                  <Switch
                    checked={allNotificationChecked}
                    onChange={handleAllNotificationInputChange}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />
                </Grid>

              </Grid>


            </Grid>

          </Grid>
          <Grid item container spacing={2} xs={12} sm={12} md={12} lg={12} direction={'row'}>
            <Grid item xs={12}>
              <Grid container direction={'row'} display={'flex'} justifyContent={'space-between'} sx={{ px: 5, mb: 1 }}>
                <Grid item >
                  <Typography fontSize={18}>
                    Budget Notifications
                  </Typography>
                </Grid>
                <Grid item>
                  <Switch
                    checked={budgetNotificationChecked}
                    onChange={handleBudgetNotificationInputChange}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />
                </Grid>

              </Grid>


            </Grid>

          </Grid>


        </Grid>
      </CardContent>
      <CardActions >
        <Grid container display={'flex'} justifyContent={"flex-end"} sx={{ px: 5, py: 3 }}>
          <LoadingButton
            loading={isLoading}
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEditNotification}
            disabled={!isModified}
          >
            Save
          </LoadingButton>
        </Grid>

      </CardActions>
    </Card>
  );
};

export default NotificationInformationCard;
