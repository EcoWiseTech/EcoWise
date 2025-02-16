import React from "react";
import LoadingButton from "@mui/lab/LoadingButton";

const GoogleSSOButton = ({ onClick, loading }) => {
    return (
        <LoadingButton
            loading={loading}
            variant="outlined"
            onClick={onClick}
            startIcon={
                <img
                    src='../images/googleLogo.png'
                    alt="Google Icon"
                    style={{
                        width: "24px",
                        height: "24px",
                        marginRight: "8px",
                    }}
                />
            }
            sx={{
                textTransform: "none",
                fontSize: "1rem",
                padding: "0.6rem 1rem",
                borderColor: "#ddd",
                color: "#000",
                backgroundColor: "#fff",
                "&:hover": {
                    backgroundColor: "#f9f9f9",
                    borderColor: "#ccc",
                },
                "&:disabled": {
                    backgroundColor: "#f5f5f5",
                    color: "#aaa",
                },
            }}
        >
            Sign in with Google
        </LoadingButton>
    );
};


export default GoogleSSOButton;
