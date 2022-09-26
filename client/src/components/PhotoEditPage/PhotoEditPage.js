import React, { useRef, useEffect, useState, useTransition } from "react";
import { useLocation } from "react-router";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./PhotoEditPage.module.css";
import MyHeader from "../Header/Header";
import { Drawer, Input, Button, Modal } from "antd";
import { toast } from "react-toastify";
import Loading from "../Loading/Loading";
import { frameImages } from "../GroupPage/ImageSrc";
import defaultBg from "../../img//frameImgs/default_background.jpg";

import { v4 as uuidv4 } from "uuid";
import makeGif from "./makeGIF";
import alone_icon from "../../img/나만보기.png";
import together_icon from "../../img/같이보기.png";
import { isMobile } from "react-device-detect";

const img_width = 550;
const img_height = 370;
const gap = 20;
const frame_width = img_width + 2 * gap;
const frame_height = 4 * (img_height + gap) + 300;

function PhotoEditPage() {
  let [isPending, startTransition] = useTransition(); // 현재작업을 우선시하게 해주는거
  const navigate = useNavigate();
  let isPublic = true;
  const [isLoading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [user_id, setUser_id] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [message, setMessage] = useState(undefined);
  const [isGifMode, setGifMode] = useState(false);
  const { state } = useLocation();
  const canvasRef = useRef(null);
  const [bgChange, setBgChange] = useState(defaultBg);
  const [isFrameDrawerVisible, setFrameDrawerVisible] = useState(false);
  const [isMessageDrawerVisible, setMessageDrawerVisible] = useState(false);
  const [isInputMessage, setInputMessage] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  /* 프레임에 작성할 날짜 계산 */
  let now = new Date();
  const DATE_TIME = `${now.getFullYear()}.${("0" + (now.getMonth() + 1)).slice(
    -2
  )}.${("0" + now.getDate()).slice(-2)} ${("0" + now.getHours()).slice(-2)}:${(
    "0" + now.getMinutes()
  ).slice(-2)}`;
  const isAuth = document.cookie.includes("x_auth");
  // ================= dummy data ================= //
  const images = [
    { src: state.images[state.images.length - 4], x: gap, y: gap },
    {
      src: state.images[state.images.length - 3],
      x: gap,
      y: 1 * (img_height + gap) + gap,
    },
    {
      src: state.images[state.images.length - 2],
      x: gap,
      y: 2 * (img_height + gap) + gap,
    },
    {
      src: state.images[state.images.length - 1],
      x: gap,
      y: 3 * (img_height + gap) + gap,
    },
  ];
  // ================= dummy data ================= //

  /* 순차적으로 실행되려고 만든 함수임 */
  async function asyncGetImage(e) {
    let img = new Image();
    img.src = e;
    return img;
  }
  async function startMakeGif() {
    const ctx = canvasRef.current.getContext("2d");
    let frames = [];
    for await (const elements of state.gifFrames) {
      let slicingArray = elements.slice(-4);
      for await (const [index, elem] of slicingArray.entries()) {
        await asyncGetImage(elem).then(async (img) => {
          await ctx.drawImage(
            img,
            gap,
            index * (img_height + gap) + gap,
            img_width,
            img_height
          );
        });
      }
      frames.push(await canvasRef.current.toDataURL());
    }
    setLoading(!makeGif(frames));
  }

  useEffect(() => {
    document.getElementById("canvas").style.display = isGifMode ? "none" : "";
    document.getElementById("result-image").style.display = !isGifMode
      ? "none"
      : "";
  }, [isGifMode]);

  useEffect(() => {
    document.getElementById("Loading").style.display = isLoading ? "" : "none";
  }, [isLoading]);

  const showDrawer = (type) => {
    type === "Frame"
      ? setFrameDrawerVisible(true)
      : setMessageDrawerVisible(true);
  };

  const handleChange = (event) => {
    setMessage(event.target.value);
  };

  const make4cutImage = (ctx, list) => {
    console.log(list);
    for (const i of list) {
      let img = new Image();
      img.src = i.src;
      img.onload = () => {
        ctx.drawImage(img, i.x, i.y, img_width, img_height);
      };
    }
  };

  useEffect(() => {
    // 화면 렌더링 시 바로 유저 정보 가져오기 (TEST)
    axios.get("/api/users/authen").then((response) => {
      setUserName(response.data.name);
      setUser_id(response.data._id); // _id : ObjectID
      setUserEmail(response.data.email);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    if (!canvasRef) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, frame_width, frame_height);
    let img = new Image();
    img.src = bgChange;
    img.onload = function () {
      ctx.drawImage(img, 0, 0, frame_width, frame_height); //배경 그리기
      writeDate(ctx, DATE_TIME); //날짜 입력
      make4cutImage(ctx, images); //4컷 그리기
      if (message) writeMessage(ctx, message); //메시지가 있다면 메시지 입력
      setLoading(false);
      if (!isMobile) startMakeGif(); //모바일이 아니라면 GIF 생성
    };
  }, [bgChange, isInputMessage]);

  function writeDate(ctx, text) {
    ctx.font = "36px Times New Roman";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(text, frame_width / 2, frame_height - 60);
  }

  function writeMessage(ctx, message) {
    ctx.font = "40px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(message, frame_width / 2, frame_height - 150);
  }

  const onSave = (e) => {
    e.preventDefault();
    isPublic = e.target.dataset["value"]; // 공개/비공개 설정
    setConfirmLoading(true); // 모달 열어두기

    // isGifMode -> gif, !isGifMode -> png 판단
    if (isGifMode) {
      const gifImg = document.getElementById("result-image");
      fetch(gifImg.src)
        .then((r) => {
          r.blob()
            .then(async (blob) => sendFormData(blob))
            .catch();
        })
        .catch();
    } else {
      try {
        const canvas = document.getElementById("canvas");
        canvas.toBlob(async (blob) => sendFormData(blob), "image/jpeg", 1.0);
      } catch (err) {}
    }
  };

  async function sendFormData(blob) {
    // uuidv4() : File Original Name
    const file = new File([blob], uuidv4(), {
      lastModified: new Date().getTime(),
      type: blob.type,
    });
    const formData = setFormData(file);

    await axios.post("/api/images/post", formData).then((res) => {
      // isLoading = false;
      setLoading(false);
      setModalVisible(false); // 모달 닫기
      setConfirmLoading(false); // 모달 닫기
      if (res) {
        toast.success("이미지 저장 성공!");
        navigate("/album");
      } else {
        toast.error("이미지 저장 실패");
      }
    });
  }

  function setFormData(file) {
    const formData = new FormData();
    // server req.file
    formData.append("file", file);

    // server req.body
    formData.append("public", isPublic);
    formData.append("id", user_id);
    formData.append("username", userName);
    formData.append("useremail", userEmail);

    return formData;
  }

  const OnLocalSave = () => {
    let now = new Date();
    const save_date_time = `${now.getFullYear()}${now.getMonth()}${now.getDate()}_${now.getHours()}${now.getMinutes()}`;
    const canvas = document.getElementById("canvas");
    const dataUrl = isGifMode
      ? document.getElementById("result-image").src
      : canvas.toDataURL();
    const filename = "4cut_" + save_date_time + (isGifMode ? ".gif" : ".png");
    let link = document.createElement("a");
    if (typeof link.download === "string") {
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(dataUrl);
    }
  };

  const onSwitchHandler = (e) => {
    // e.preventDefault();
    if (!isMobile) {
      setGifMode(!isGifMode);
    } else {
      alert("모바일에서는 GIF모드를 지원하지 않습니다.");
    }
  };

  return (
    <>
      <div id="photoEdit">
        <div className="outer_container">
          <div id="Loading">
            <Loading />
          </div>
          <MyHeader subTitle="편집중" />
          <div className="contents_container">
            <button
              style={{
                position: "absolute",
                top: "50%",
                left: "90%",
                transform: "translate(-50%, -50%)",
                width: "50px",
                height: "50px",
                backgroundColor: "#efefef",
                borderRadius: "10px",
                border: "0",
                color: "#555555",
                fontWeight: "600",
                cursor: "true",
              }}
              onClick={onSwitchHandler}
            >
              {isGifMode ? "PNG!" : "GIF!"}
            </button>
            <div
              style={{
                justifyContent: "center",
                display: "flex",
              }}
              onClick={(e) => {
                e.preventDefault();
                OnLocalSave();
              }}
            >
              <div className={styles.canvas_container}>
                <canvas
                  id="canvas"
                  width={frame_width}
                  height={frame_height}
                  style={{
                    backgroundColor: "black",
                  }}
                  className={styles.result_image}
                  ref={canvasRef}
                >
                  Your browser does not support the HTML5 canvas tag.
                </canvas>
                <img
                  id="result-image"
                  alt=""
                  className={styles.result_image}
                ></img>
              </div>
            </div>
            {isAuth && (
              <div id="control-menu" className={styles.control_container}>
                <button
                  className={styles.btn_default}
                  onClick={() => {
                    showDrawer("Frame");
                  }}
                  style={{
                    cursor: "pointer",
                    fontSize: "2.3vh",
                    fontWeight: "bold",
                  }}
                >
                  프레임 변경
                </button>
                <button
                  className={styles.btn_default}
                  onClick={() => {
                    showDrawer("Message");
                  }}
                  style={{
                    fontSize: "2.3vh",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  메모 하기
                </button>
                <button
                  className={styles.btn_pink}
                  onClick={() => {
                    setModalVisible(true);
                  }}
                  style={{
                    fontSize: "2.3vh",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  앨범 저장
                </button>
              </div>
            )}
            {!isAuth && (
              <div id="control-menu" className={styles.control_container}>
                <button className={styles.btn_default} onClick={OnLocalSave}>
                  핸드폰 저장
                </button>
                <button
                  className={styles.btn_pink}
                  onClick={() => navigate("/login")}
                >
                  로그인 하기
                </button>
              </div>
            )}
            <Modal
              className="modalRadius"
              title="저장할 사진의 공개 설정을 선택해 주세요!"
              visible={isModalVisible}
              confirmLoading={confirmLoading}
              onCancel={() => {
                setModalVisible(false);
              }}
              footer={null}
              centered={true}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                }}
              >
                <button
                  className="button btn_3"
                  data-value={false}
                  onClick={onSave}
                  style={{
                    fontSize: "2vh",
                    fontWeight: "bold",
                    margin: "1vh",
                    padding: "0 15px",
                  }}
                >
                  <img
                    src={alone_icon}
                    style={{
                      height: "3vh",
                      marginRight: "5%",
                    }}
                    alt="안방네컷"
                    data-value={false}
                  />
                  나만 보기
                </button>
                <button
                  className="button btn_1"
                  data-value={true}
                  onClick={onSave}
                  style={{
                    fontSize: "2vh",
                    fontWeight: "bold",
                    margin: "1vh",
                  }}
                >
                  <img
                    alt=""
                    src={together_icon}
                    style={{
                      height: "3vh",
                      marginRight: "5%",
                    }}
                    data-value={true}
                  />
                  다같이 보기
                </button>
              </div>
            </Modal>

            <Drawer
              title="프레임 선택"
              placement="bottom"
              closable={true}
              onClose={() => {
                setFrameDrawerVisible(false);
              }}
              visible={isFrameDrawerVisible}
              height="50vh"
              style={
                window.innerWidth > 600
                  ? {
                      width: "600px",
                      marginLeft: `calc(50vw - 300px)`,
                    }
                  : {}
              }
            >
              <div className={styles.bg_menu_scroll}>
                {frameImages.map((bgImage) => {
                  return (
                    <img
                      src={bgImage.src}
                      key={bgImage.alt}
                      alt={bgImage.alt}
                      draggable={false}
                      onClick={() => {
                        setBgChange(bgImage.src);
                        setFrameDrawerVisible(false);
                      }}
                      style={{
                        padding: "1vh",
                        width: "110px",
                        height: "30vh",
                      }}
                    ></img>
                  );
                })}
              </div>
            </Drawer>
            <Drawer
              title="메시지 입력"
              placement="bottom"
              closable={true}
              onClose={() => {
                setMessageDrawerVisible(false);
              }}
              visible={isMessageDrawerVisible}
              height="30vh"
              style={
                window.innerWidth > 600
                  ? {
                      width: "600px",
                      marginLeft: `calc(50vw - 300px)`,
                    }
                  : {}
              }
            >
              <div>
                <Input
                  placeholder="사진에 대한 설명을 적어주세요!"
                  onChange={(e) => {
                    startTransition(() => {
                      handleChange(e);
                    });
                  }}
                  style={{ width: "85%" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setMessageDrawerVisible(false);
                      setInputMessage(true);
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    setMessageDrawerVisible(false);
                    setInputMessage(true);
                  }}
                  style={{
                    position: "absolute",
                  }}
                >
                  저장
                </Button>
              </div>
            </Drawer>
          </div>
        </div>
      </div>
    </>
  );
}

export default PhotoEditPage;
