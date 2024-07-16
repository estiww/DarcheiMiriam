import React, { useContext } from 'react';
import { UserContext } from "../App";
import UnauthorizedPage from './UnauthorizedPage';

const ProtectedRoute = ({ element, allowedRoles }) => {
  const { user } = useContext(UserContext);
  
  if (!user || !allowedRoles.includes(user.roleName)) {
    return <UnauthorizedPage />;
  }
  
  return element;
};

export default ProtectedRoute;