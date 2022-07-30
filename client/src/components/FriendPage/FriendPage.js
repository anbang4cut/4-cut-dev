import React from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { auth } from "../../_actions/user_action";

const FriendPage = async () => {
  const props = useParams();
  const me = await auth();
  console.log(props, me);

  //   setTimeout(() => {
  //     axios.get(`api/friends/showAlbum/${props.email}`);
  //   }, 5000);

  return (
    <h1
      style={{
        color: "white",
      }}
    >
      {props};{/* {props.email} */}
    </h1>
  );
};

export default FriendPage;
