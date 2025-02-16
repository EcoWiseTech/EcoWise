import React from 'react';
import { Card, CardContent, CardActions, Grid, TextField, Box, Typography, Avatar } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FileUploadIcon from '@mui/icons-material/UploadFile';
import BadgeIcon from '@mui/icons-material/Badge';
import EditIcon from '@mui/icons-material/Edit';
import CardTitle from '../common/CardTitle';

const ProfileInformationCard = ({
  formData,
  handleInputChange,
  handleFileChange,
  handleEditProfile,
  errors,
  isLoading,
  isModified,
  selectedFile,
  user,
}) => {
  return (
    <Card>
      <CardContent>
        <CardTitle icon={<BadgeIcon />} title="Profile Information" />
        <Grid container spacing={2} marginTop="1rem">
          <Grid item container spacing={2} xs={12} sm={7} md={7} lg={7}>
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                disabled
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Name"
                name="given_name"
                value={formData.given_name}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.given_name}
                helperText={errors.given_name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Date of Birth"
                name="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.birthdate}
                helperText={errors.birthdate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} sm={5} md={5} lg={5} textAlign="center">
            <Avatar
              src={selectedFile || user.profilePicture || '/default-avatar.png'}
              alt="Profile Picture"
              sx={{ width: 150, height: 150, margin: '0 auto' }}
            />
            <Box marginTop="0.5rem" marginBottom="1rem">
              <Typography variant="h8" color="black">
                Profile Picture
              </Typography>
            </Box>
            <Box marginTop="1rem">
              <Typography variant="subtitle2" color="darkgray">
                File Size no larger than 5MB
              </Typography>
            </Box>
            <Box>
              <LoadingButton
                style={{ justifyContent: 'flex-end' }}
                loadingPosition="start"
                variant="contained"
                color="primary"
                startIcon={<FileUploadIcon />}
                component="label"
              >
                Upload Image
                <input type="file" onChange={handleFileChange} hidden />
              </LoadingButton>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions sx={{ paddingX: '16px' }}>
        <LoadingButton
          loading={isLoading}
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={handleEditProfile}
          disabled={!isModified}
        >
          Save
        </LoadingButton>
      </CardActions>
    </Card>
  );
};

export default ProfileInformationCard;
