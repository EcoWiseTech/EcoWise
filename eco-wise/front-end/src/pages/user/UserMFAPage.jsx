import { useState } from 'react'
import { useTheme, useMediaQuery} from '@mui/material'
import { useUserContext } from '../../contexts/UserContext'
import { isValidPhoneNumber } from 'react-phone-number-input';
import VerifyPhoneNumberDialogModal from '../../components/common/VerifyPhoneNumberDialogModal'
import SendPhoneNumberVerificationCodeApi from '../../api/auth/SendPhoneNumberVerificationCodeApi'
import { useAlert } from '../../contexts/AlertContext'
import VerifyPhoneNumberApi from '../../api/auth/VerifyPhoneNumberApi'
import UpdateUserApi from '../../api/auth/UpdateUserApi'
import EnableMFAModal from '../../components/user/EnableMFAModal'
import EnableMFAApi from '../../api/auth/EnableMFAApi'
import DisableMFAModal from '../../components/user/DisableMFAModal'
import DisableMFAApi from '../../api/auth/DisableMFAApi'
import MFAPhoneCard from '../../components/user/MFAPhoneCard'

function UserMFAPage() {
    const [showVerifyNumberDialog, setShowVerifyNumberDialog] = useState(false);
    const [showDisable, setShowDisable] = useState(false);
    const [showEnableMFAModal, setshowEnableMFAModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [enable2FALoading, setEnable2FALoading] = useState(false);
    const { user, RefreshUser, accessToken, refreshToken, SessionRefreshError } = useUserContext();
    const [phoneNumber, setPhoneNumber] = useState(user.UserAttributes.phone_number || "");
    const [errors, setErrors] = useState('');
    const [sendCodeButtonLoading, setSendCodeButtonLoading] = useState(false);
    const [verifyButtonLoading, setVerifyButtonLoading] = useState(false);
    const [saveNumberLoading, setSaveNumberLoading] = useState(false);
    const [isPhoneInputEnabled, setIsPhoneInputEnabled] = useState(user.UserAttributes.phone_number_verified == "true" ? false : true);
    const [verificationCode, setVerificationCode] = useState('');
    const { showAlert } = useAlert();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handlePhoneChange = (value) => {
        setPhoneNumber(value);
    };

    const handleReEnablePhoneInput = () => {
        setIsPhoneInputEnabled(true); // Enable phone input and Save button
    };

    const sendVerificationCode = () => {
        setSendCodeButtonLoading(true);
        SendPhoneNumberVerificationCodeApi(accessToken)
            .then((res => {
                RefreshUser();
                setSendCodeButtonLoading(false);
            }))
            .catch((error) => {
                console.error('failed to send code:', error)
                if (error.name === 'NotAuthorizedException') {
                    if (error.message === 'Refresh Token has expired' || error.message.includes('Refresh')) {
                        SessionRefreshError();
                    }
                } else {
                    showAlert('error', 'Unexpected error occurred. Please try again.');
                }
                setSendCodeButtonLoading(false);
            })
    }

    const verifyCode = (code) => {
        setVerifyButtonLoading(true)
        VerifyPhoneNumberApi(accessToken, code)
            .then((res) => {
                RefreshUser();
                showAlert('success', 'Phone number has been verified.')
                setVerifyButtonLoading(false);
                setShowVerifyNumberDialog(false);
                setIsPhoneInputEnabled(false);
            })
            .catch((error) => {
                console.error('failed to verify code:', error)
                if (error.name === 'NotAuthorizedException') {
                    if (error.message === 'Refresh Token has expired' || error.message.includes('Refresh')) {
                        SessionRefreshError();
                    }
                }
                else if (error.name == "CodeMismatchException") {
                    setVerificationCode('');
                    showAlert('error', 'Invalid Code. Please try again.');
                }
                else {
                    showAlert('error', 'Unexpected error occurred. Please try again.');
                }
                setVerifyButtonLoading(false);
                setShowVerifyNumberDialog(false);
            })
    }

    const handleSavePhoneNumber = () => {
        // Logic to save the phone number, e.g., API call or update user attributes
        let inputPhoneNumber = phoneNumber == undefined ? "" : phoneNumber
        if (inputPhoneNumber == "") {
            savePhoneNumberApi(inputPhoneNumber);
        }
        else if (isValidPhoneNumber(inputPhoneNumber)) {
            savePhoneNumberApi(inputPhoneNumber);
        }
        else {
            setErrors({ phone_number: "Invalid phone_number" })
        }
    };

    const savePhoneNumberApi = (inputPhoneNumber) => {
        setSaveNumberLoading(true);
        UpdateUserApi({ accessToken, refreshToken, attributes: { "phone_number": inputPhoneNumber } })
            .then((res) => {
                RefreshUser();
                showAlert('success', "Phone number Updated Successfully.");
                setSaveNumberLoading(false)
                setErrors({})
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
                setSaveNumberLoading(false)
            })
    }

    const enable2FA = () => {
        setEnable2FALoading(true);
        EnableMFAApi(accessToken, refreshToken)
            .then((res) => {
                console.log("success", res)
                RefreshUser();
                showAlert('success', "2-Factor Authentication has been enabled")
                setEnable2FALoading(false);
                setshowEnableMFAModal(false);
            })
            .catch((error) => {
                console.error("Error enabling 2FA:", error);
                if (error.name === 'NotAuthorizedException') {
                    if (error.message === 'Refresh Token has expired' || error.message.includes('Refresh')) {
                        SessionRefreshError();
                    }
                } else {
                    showAlert('error', 'Unexpected error occurred. Please try again.');
                }
                setEnable2FALoading(false);
                setshowEnableMFAModal(false);
            })
    }


    const disable2FA = () => {
        setLoading(true)
        DisableMFAApi(accessToken, refreshToken)
            .then((res) => {
                console.log("success", res)
                RefreshUser();
                showAlert('success', "2-Factor Authentication has been disabled")
                setLoading(false);
                setShowDisable(false);
            })
            .catch((error) => {
                console.error("Error disabling 2FA:", error);
                if (error.name === 'NotAuthorizedException') {
                    if (error.message === 'Refresh Token has expired' || error.message.includes('Refresh')) {
                        SessionRefreshError();
                    }
                } else {
                    showAlert('error', 'Unexpected error occurred. Please try again.');
                }
                setLoading(false);
                setShowDisable(false);
            })
    }

    const handleVerifyNumber = () => {
        setShowVerifyNumberDialog(true)
    }

    return (
        <>
            <MFAPhoneCard
                    phoneNumber={phoneNumber}
                    handlePhoneChange={handlePhoneChange}
                    isPhoneInputEnabled={isPhoneInputEnabled}
                    errors={errors}
                    saveNumberLoading={saveNumberLoading}
                    handleSavePhoneNumber={handleSavePhoneNumber}
                    user={user}
                    isMobileisMobile
                    handleVerifyNumber={handleVerifyNumber}
                    handleReEnablePhoneInput={handleReEnablePhoneInput}
                    loading={loading}
                    setshowEnableMFAModal={setshowEnableMFAModal}
                    setShowDisable={setShowDisable}
                    isMobile={isMobile}
            />
            <VerifyPhoneNumberDialogModal
                open={showVerifyNumberDialog}
                setOpen={setShowVerifyNumberDialog}
                phoneNumber={phoneNumber}
                onSendCode={sendVerificationCode}
                loadingSendCode={sendCodeButtonLoading}
                onVerify={verifyCode}
                loadingVerify={verifyButtonLoading}
                verificationCode={verificationCode}
                setVerificationCode={setVerificationCode}
            />
            <EnableMFAModal
                showModal={showEnableMFAModal}
                setShowModal={setshowEnableMFAModal}
                enable2FA={enable2FA}
                loading={enable2FALoading}
            />

            <DisableMFAModal
                showModal={showDisable}
                setShowModal={setShowDisable}
                disable2FA={disable2FA}
                loading={loading}
            />
        </>
    )
}

export default UserMFAPage