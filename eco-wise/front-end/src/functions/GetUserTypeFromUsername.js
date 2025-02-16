function GetUserTypeFromUsername(username) {
    if (username.startsWith("google_")) {
      return "Google";
    } else if (username.startsWith("facebook_")) {
      return "Facebook";
    } else {
      return "Cognito";
    }
  }

  export default GetUserTypeFromUsername