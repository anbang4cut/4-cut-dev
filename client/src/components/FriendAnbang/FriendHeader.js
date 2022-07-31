import React from "react";
import { useNavigate } from "react-router-dom";
import "./Friend.css";
import prevIcon from "../../img/prevIcon.png";

function FriendHeader({ title, onBackUrl = "/", onClick = undefined }) {
  const navigate = useNavigate();
  return (
    <div className="friendHeader">
      <button src="" />
      <span>{title}님의 안방</span>
    </div>
  );
}

export default FriendHeader;
