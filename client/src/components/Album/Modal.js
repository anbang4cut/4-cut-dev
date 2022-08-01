import React from "react";
import styles from "./Album.module.css";
import HeartButton from "../AllAlbum/HeartButton";
import PhotoModify from "../ImageEditor/PhotoModify";
import PhotoDelete from "./PhotoDelete";
import Social from "../Social/Social";
import { CloseOutlined } from "@ant-design/icons";
import { Button } from "antd";

function Modal({ modalContent, setModalContent }) {
  const closeModal = () => {
    setModalContent(null);
  };
  return (
    <div className={styles.modal_background}>
      <div className={styles.modal_container}>
        <div className={styles.modal_header}>
          <div className={styles.modal_close}>
            <Button
              icon={<CloseOutlined />}
              onClick={() => closeModal()}
            ></Button>
          </div>
        </div>
        <div className={styles.modal_img_container}>
          <img src={modalContent.imageUrl} className={styles.modal_img}></img>
        </div>
        <div className={styles.modal_control_container}>
          <div className={styles.control_box}>
            <Social img={modalContent.imageUrl} />
          </div>
          <div className={styles.control_box}>
            <PhotoModify img={modalContent.imageUrl} />
            <PhotoDelete img={modalContent} />
            <HeartButton
              modalContent={modalContent}
              setModalContent={setModalContent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
