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
import ProfileInformationCard from '../../components/user/ProfileInformationCard';
import DeleteUserCard from '../../components/user/DeleteUserCard';
import DeleteUserApi from '../../api/auth/DeleteUserApi';

// Define the validation schema with yup
const schema = yup.object({
    given_name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email address").required("Email is required"),
}).required();

function ViewProfilePage() {
    const { user, accessToken, refreshToken, RefreshUser, SessionRefreshError, DeleteUser } = useUserContext();
    const [formData, setFormData] = useState({
        given_name: '',
        email: '',
        birthdate: '',
    });
    const [errors, setErrors] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [isModified, setIsModified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { showAlert } = useAlert();

    // Populate form data from user context
    useEffect(() => {
        if (user?.UserAttributes) {
            setFormData({
                given_name: user.UserAttributes.given_name || '',
                email: user.UserAttributes.email || '',
                birthdate: user.UserAttributes.birthdate || '',
            });
        }
    }, [user]);

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        setIsModified(true);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(URL.createObjectURL(file));
            setIsModified(true);
        }
    };

    const handleEditProfile = async () => {
        if (!(await validateForm())) {
            return;
        }

        setIsLoading(true);

        const requestObj = {
            email: formData.email,
            given_name: formData.given_name,
            birthdate: formData.birthdate ? formData.birthdate : "",
        };
        UpdateUserApi({ accessToken, refreshToken, attributes: requestObj })
            .then((res) => {
                RefreshUser();
                showAlert('success', "Profile Updated Successfully.");
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error updating user:", error);
                if (error.name === 'NotAuthorizedException') {
                    if (error.message === 'Refresh Token has expired' || error.message.includes('Refresh')) {
                        SessionRefreshError();
                    }
                } else {
                    showAlert('error', 'Unexpected error occurred. Please try again.');
                }
                setIsLoading(false);
            });

        setIsModified(false);
    };

    const deleteUser = async () => {
        DeleteUserApi(refreshToken, accessToken)
            .then((res) => {
                DeleteUser()
            })
            .catch((error) => {
                console.error("Error Deleting user:", error);
                if (error.name === 'NotAuthorizedException') {
                    if (error.message === 'Refresh Token has expired' || error.message.includes('Refresh')) {
                        SessionRefreshError();
                    }
                } else {
                    showAlert('error', 'Unexpected error occurred. Please try again.');
                }
            })
    };

    return (
        <Stack direction="column" spacing={2}>
            <ProfileInformationCard
                formData={formData}
                handleInputChange={handleInputChange}
                handleFileChange={handleFileChange}
                handleEditProfile={handleEditProfile}
                errors={errors}
                isLoading={isLoading}
                isModified={isModified}
                selectedFile={selectedFile}
                user={user}
            />
            <DeleteUserCard
                deleteUser={deleteUser}
            />
        </Stack>
    );
}

export default ViewProfilePage;
