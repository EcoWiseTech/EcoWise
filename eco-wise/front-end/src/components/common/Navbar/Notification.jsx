import React from 'react'
import { Avatar } from '@mui/material'
import md5 from "md5";
import { stringAvatar } from '../../../functions/StringAvatar';
import { useUserContext } from '../../../contexts/UserContext';

function ProfilePicture(props) {
  const { user } = useUserContext();
  // const s = 0;
  // if (user.UserAttributes.given_name) {
  //   const email_md5 = md5(user.UserAttributes.email)
  //    s = {
  //     ...stringAvatar(user.UserAttributes?.given_name).sx,
  //     ...props.sx
  //   }
  // }

  return (
    <>
    PFP
      {/* {user.profile_picture_type === "gravatar" && <Avatar {...props} src={"https://www.gravatar.com/avatar/" + email_md5} />}
      {user.profile_picture_type === "local" && <Avatar {...props} src={user.profile_picture + "?t=" + new Date().getTime()} />} */}
      {/* {!user.profile_picture_type && <Avatar  {...stringAvatar(user.UserAttributes.given_name)} sx={s} />} */}
    </>
  )
}

export default ProfilePicture