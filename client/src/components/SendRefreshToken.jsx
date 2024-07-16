import React, { useContext } from "react";
import { UserContext } from "../App";

const sendRefreshToken = async (id) => {
  // const { user, setUser } = useContext(UserContext);

  try {
    console.log('sendRefreshToken')
    const response = await fetch("http://localhost:3000/refreshTokenRoute", {
      method: "GET",
      credentials: "include",
      // body: JSON.stringify({ id: id }),

    });
    if (!response.ok) {
      throw response;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.status);
  }
};

export default sendRefreshToken;
