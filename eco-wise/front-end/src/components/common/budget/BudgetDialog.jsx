

import React from 'react';
import { Card, CardContent, CardActions, Grid, TextField, Box, Typography, Avatar, Switch } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FileUploadIcon from '@mui/icons-material/UploadFile';
import BadgeIcon from '@mui/icons-material/Badge';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';




const BudgetDialog = ({
  open,
  handleClose,
  handleEdit,
  formData,
  handleInputChange,
  errors
}) => {
  return (
    <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const email = formJson.email;
            console.log(email);
            handleClose();
          },
        }}
      >
        <DialogTitle>Budget</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Set your budget for the day
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="dailyBudgetLimit"
            error={!!errors.dailyBudgetLimit}
            helperText={errors.dailyBudgetLimit}
            label="($)"
            type="number"
            fullWidth
            variant="standard"
            value={formData.dailyBudgetLimit}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
  );
};

export default BudgetDialog;
