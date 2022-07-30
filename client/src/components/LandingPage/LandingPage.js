import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import main_img from "../../img/main.gif";
import { auth } from "../../_actions/user_action";
import Logout from "../Logout/Logout";
import styles from "./LandingPage.module.css";
import buttonAudioSrc from "../../audio/button.mp3";

function LandingPage() {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(auth()).then((res) => {
      if (res.payload.isAuth) setIsAuth(true);
    });
  }, [isAuth]);

  const btnSound = () => {
    let audio = new Audio(buttonAudioSrc);
    audio.play();
  };

  return (
    <div className="outer_container">
      <div className="center">
        <div
          className={styles.title_container}
          onClick={() => {
            navigate("/main");
          }}
          style={{
            cursor: "pointer",
          }}
        >
          <title className={styles.main_title}>안방네컷</title>
        </div>
        <div className={styles.control_container}>
          {!isAuth && (
            <>
              <button
                className="button button_gap btn_1"
                onClick={() => navigate("/login")}
              >
                로그인
              </button>
              <button
                className="button button_gap btn_2"
                onClick={() => navigate("/register")}
              >
                회원가입
              </button>
            </>
          )}
          {isAuth && (
            <>
              <button
                className="button button_gap btn_1"
                onClick={() => {
                  btnSound();
                  navigate("/main");
                }}
              >
                입장하기
              </button>
              <Logout />
            </>
          )}
          <div className={styles.img_container}>
            <img className={styles.main_img} src={main_img} alt="logo" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
