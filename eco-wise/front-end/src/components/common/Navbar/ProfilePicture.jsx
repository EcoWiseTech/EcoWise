import React from 'react';
import { Avatar } from '@mui/material';
import md5 from 'md5';
import { stringAvatar } from '../../../functions/StringAvatar';
import { useUserContext } from '../../../contexts/UserContext';

// Default profile picture (You can replace this with your own image URL)
const DEFAULT_PROFILE_PICTURE = "https://via.placeholder.com/150?text=User";

function ProfilePicture(props) {
  const { user } = useUserContext();

  let avatarSrc = DEFAULT_PROFILE_PICTURE; // Default profile picture

  if (user?.profile_picture_type === "gravatar" && user?.UserAttributes?.email) {
    const email_md5 = md5(user.UserAttributes.email.trim().toLowerCase());
    avatarSrc = `https://www.gravatar.com/avatar/${email_md5}`;
  } else if (user?.profile_picture_type === "local" && user?.profile_picture) {
    avatarSrc = `${user.profile_picture}?t=${new Date().getTime()}`; // Prevent caching
  }

  return (
    <Avatar {...props} src={avatarSrc} {...(avatarSrc === DEFAULT_PROFILE_PICTURE ? stringAvatar(user?.UserAttributes?.given_name || "User") : {})} />
  );
}

export default ProfilePicture;
