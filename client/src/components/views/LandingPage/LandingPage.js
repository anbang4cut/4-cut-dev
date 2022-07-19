import Kakao from "../../../controller/Kakao";
import React, { useEffect } from "react";
import axios from "axios";
import { Space, Typography, Button } from "antd";
import { useNavigate } from "react-router-dom";
import MyHeader from "../Header/Header";
// const mainImagePath = process.env.PUBLIC_URL + "/logo192.png";
import main_img from "../../../img/dog.png";

function LandingPage() {
  const navigate = useNavigate();
  const { Title } = Typography;

  const onClickHandler = () => {
    axios.get(`/api/users/logout`).then((response) => {
      if (response.data.success) {
        navigate("/login");
      } else {
        alert("로그아웃 하는데 실패 했습니다.");
      }
    });
  };

  return (
    <div>
      <Space
        className="main_page"
        style={{
          // display: "flex",
          // justifyContent: "center",
          // alignItems: "center",
          // width: "100%",
          // height: "100vh",
          flexDirection: "column",
        }}
      >
        <Title className="main_title">안방네컷</Title>
        <img className="main_img" src={main_img} />
        <div className="buttons">
          <Kakao />
          <button
            type="primary"
            className="button sign_in"
            onClick={() => navigate("/login")}
          >
            로그인
          </button>
          <button
            type="primary"
            className="button sign_up"
            onClick={() => navigate("/register")}
          >
            회원가입
          </button>
          <button
            type="primary"
            className="button"
            onClick={() => navigate("/lobby")}
          >
            사진 찍기
          </button>
          <Button type="primary" onClick={() => navigate("/group")}>
            누끼 사진 찍기
          </Button>
          <Button type="primary" onClick={() => navigate("/edit")}>
            프레임 수정 및 서버에 이미지 저장
          </Button>
          <button type="primary" className="button" onClick={onClickHandler}>
            로그아웃
          </button>
        </div>
      </Space>
    </div>
  );
}

export default LandingPage;
