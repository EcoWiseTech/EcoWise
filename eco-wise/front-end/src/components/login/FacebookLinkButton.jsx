import React, { useEffect } from "react";
import { Button } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";

const FacebookLinkButton = ({ onSuccess }) => {
  useEffect(() => {
    // Dynamically load the Facebook SDK
    (function (d, s, id) {
      let js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");

    // Initialize the SDK when it's loaded
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: process.env.REACT_APP_FACEBOOK_SSO_APP_ID, 
        cookie: true,
        xfbml: true,
        version: "v16.0", 
      });
    };
  }, []);

  const handleFacebookClick = () => {
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          console.log("Login successful!", response);
          fetchUserData(response);
        } else {
          console.log("User cancelled login or did not fully authorize.");
        }
      },
      { scope: "email,public_profile" } // Request permissions
    );
  };

  const fetchUserData = (response) => {
    window.FB.api("/me", { fields: "name,email,picture" }, (data) => {
      console.log("User Data:", data);
      // Call the parent onSuccess function and pass the user data
      if (onSuccess) {
        onSuccess(data); // Pass user data to parent
      }
    });
  };

  return (
    <Button
      onClick={handleFacebookClick}
      variant="contained"
      startIcon={<FacebookIcon sx={{ fontSize: "20px" }} />}
      sx={{
        backgroundColor: "#4267B2",
        color: "#FFFFFF",
        textTransform: "none",
        padding: "6px 14px",
        fontSize: "13px",
        "&:hover": {
          backgroundColor: "#365899",
        },
      }}
    >
      Continue with Facebook
    </Button>
  );
};

export default FacebookLinkButton;
