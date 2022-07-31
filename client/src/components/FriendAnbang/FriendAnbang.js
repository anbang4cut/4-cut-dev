import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import FriendHeader from "./FriendHeader";
import axios from "axios";
import { auth } from "../../_actions/user_action";
import Loading from "../Loading/Loading";
import styles from "../AllAlbum/AllAlbum.module.css";
import Modal from "../AllAlbum/Modal";
import { useLocation } from "react-router-dom";
import "./Friend.css";

const url = process.env.REACT_APP_CLOUD_FRONT_URL;

function FriendAnbang() {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const dispatch = useDispatch();
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const location = useLocation();
  const friendId = location.state.targetId;
  const friendName = location.state.targetName;
  const friendImage = location.state.targetImage;
  let roomName = "";

  useEffect(() => {
    dispatch(auth()).then((res) => {
      axios
        .get(`api/friends/showAlbum/${friendId}`)
        .then((result) => {
          setUserId(res.payload._id);
          setImages(result.data);
          setLoading(false);
          setUserName(res.payload.name);
        })
        .catch();
    });
  }, [dispatch]);

  let data = { datas: [] };

  images.map((item) => {
    data.datas.push({
      desc: item._id,
      imageUrl: url + item.key,
      key: item.key,
      owner: item.user._id,

      // modal용 데이터
      ownerName: item.user.name,
      likes: item.likes,
      user: userId,
      isLiked: item.likes.includes(userId),
      likes_count: item.likes_count,
    });
  });

  const [modalContent, setModalContent] = useState(null);
  const showModal = (contents) => {
    setModalContent(contents);
  };

  return (
    <>
      <div className="outer_container">
        <div>{loading ? <Loading /> : null}</div>
        <FriendHeader title={friendName} onBackUrl="/friendList"></FriendHeader>
        <div
          className="profileBox"
          style={{
            backgroundColor: "white",
            height: "25%",
            border: "none",
          }}
        >
          <div className="profileImageBox">
            <img className="profileImage" src={friendImage} alt="" />
          </div>
        </div>

        <div className={styles.contents_container}>
          <div className={styles.album_container}>
            {data.datas.map((item, index) => (
              <div key={index} className={styles.img_container}>
                <img
                  className={styles.wrap_img}
                  src={item.imageUrl}
                  alt={index}
                  onClick={() => showModal(item)}
                  style={{
                    cursor: "pointer",
                  }}
                />
              </div>
            ))}
          </div>
          {modalContent && (
            <Modal
              modalContent={modalContent}
              setModalContent={setModalContent}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default FriendAnbang;
