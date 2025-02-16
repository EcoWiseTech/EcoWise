import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    Grid,
    TextField,
    Avatar,
    CardActions,
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import EditIcon from '@mui/icons-material/Edit';
import BadgeIcon from '@mui/icons-material/Badge';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../contexts/UserContext';
import CardTitle from '../../components/common/CardTitle';
import { LoadingButton } from '@mui/lab';
import UpdateUserApi from '../../api/auth/UpdateUserApi';
import { useAlert } from "../../contexts/AlertContext";
import * as yup from 'yup';
import { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../../css/PhoneInput.css'
import NotificationInformationCard from '../../components/user/NotificationInformationCard';
import DeleteUserCard from '../../components/user/DeleteUserCard';
import DeleteUserApi from '../../api/auth/DeleteUserApi';
import { GetPreferenceApi } from '../../api/preference/GetPreferenceApi';
import { UpdatePreferenceApi } from '../../api/preference/UpdatePreferenceApi';
import { enqueueSnackbar } from 'notistack';



function NotificationSettingsPage() {
    const { user, accessToken, refreshToken, RefreshUser, SessionRefreshError, DeleteUser } = useUserContext();
    const [formData, setFormData] = useState({
        given_name: '',
        email: '',
        birthdate: '',
    });
    const [isModified, setIsModified] = useState(false);
    const [preference, setPreference] = useState(null);
    const [allNotificationChecked, setAllNotificationChecked] = useState(false);
    const [budgetNotificationChecked, setBudgetNotificationChecked] = useState(true);
    const handleAllNotificationChanged = (e) => {
        console.log(e.target.checked)
        setAllNotificationChecked(e.target.checked)
        setIsModified(true);
    };
    const handleBudgetNotificationInputChange = (e) => {
        console.log(e.target.checked)
        setBudgetNotificationChecked(e.target.checked)
        setIsModified(true);
    };

    const handleEditNotification = (e) => {
        console.log('clicked handleEditNotification')
        // console.log(userId)
        let requestObj = {
            uuid: preference.uuid,
            userId: user.Username,
            budgets: { ...preference.budgets, isBudgetNotification: budgetNotificationChecked }
            
        }
        // console.log(`requestObj: ${JSON.stringify(requestObj)}`)
        UpdatePreferenceApi(requestObj)
            .then((res) => {
                console.log(`res.data: ${JSON.stringify(res)}`)
                setPreference(res)
                RefreshUser();
                enqueueSnackbar('Successfully updated notification settings', { variant: "success" })
            })
            .catch((err) => {
                console.log(`err: ${err.status}`)
                if (404 == err.status) {
                    setPreference(0)
                } else {
                    enqueueSnackbar('Failed to fetch Preference data', { variant: "error" })
                    console.error("Error updating preference:", err);
                }



            })
        //uuid, userId, updatedData
    };
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { showAlert } = useAlert();

    // Populate form data from user context
    useEffect(() => {
        GetPreferenceApi(user.Username)
            .then((res) => {
                setPreference(res.data[0])
                let preferenceData = res.data[0]

                console.log(`preferenceData: ${JSON.stringify(preferenceData)}`)
                if ('budgets' in preferenceData && 'isBudgetNotification' in preferenceData.budgets) {
                    // console.log(`isbudgetnotification:${preferenceData.budgets.isBudgetNotification}`)
                    setBudgetNotificationChecked(preferenceData.budgets.isBudgetNotification)
                }else {
                    setBudgetNotificationChecked(true)
                }
            })
            .catch((err) => {
                // // console.log(`err:${err.status}`)
                if (404 == err.status) {

                    setPreference(0)
                } else {
                    enqueueSnackbar('Failed to fetch Preference data', { variant: "error" })
                }



            })
    }, [user]);




    return (
        <Stack direction="column" spacing={2}>
            <NotificationInformationCard
                allNotificationChecked={allNotificationChecked}
                handleAllNotificationInputChange={handleAllNotificationChanged}
                isLoading={isLoading}
                handleEditNotification={handleEditNotification}
                isModified={isModified}
                handleBudgetNotificationInputChange={handleBudgetNotificationInputChange}
                budgetNotificationChecked={budgetNotificationChecked}
            />

        </Stack>
    );
}

export default NotificationSettingsPage;
