import { Modal, Input, Card, Button } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { auth } from "../../_actions/user_action";

function SearchFriend() {
  const { Search } = Input;
  const [isModalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [findFriendResult, setFindFriendResult] = useState("");

  const onFriendIdHandler = (event) => {
    setSearchInput(event.target.value);
  };

  const showModal = () => {
    setModalVisible(true);
  };
  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const [loading, setLoading] = useState(true);

  const clickedHandler = () => {
    axios.get(`/api/friends/search/${searchInput}`).then((response) => {
      if (response.data.err) {
        toast.error("해당하는 유저가 존재하지 않습니다.");
      } else {
        setFindFriendResult(response.data.name);
      }
    });
  };
  const addFriend = async () => {
    const me = await auth();
    const body = {
      id: me.payload._id,
    };
    axios.post(`/api/friends/add/${searchInput}`, body).then((response) => {
      if (response.data.success) {
        toast.success("추가되었습니다.");
      } else {
        toast.error("이미 추가된 친구입니다.");
      }
    });
  };

  return (
    <>
      <button onClick={showModal} className="button button_gap btn_1">
        친구 검색
      </button>
      <Modal
        title="친구를 검색해보세요"
        visible={isModalVisible}
        confirmLoading={confirmLoading}
        onCancel={handleModalCancel}
        footer={null}
        centered={true}
      >
        <div>
          <Search
            onChange={onFriendIdHandler}
            placeholder="이메일을 입력하세요"
            enterButton
            onPressEnter={clickedHandler}
            onSearch={clickedHandler}
          />
        </div>

        {searchInput && !findFriendResult && (
          <Card
            style={{
              "max-width": 470,
              marginTop: 16,
            }}
            loading={loading}
          ></Card>
        )}
        {findFriendResult && (
          <Card
            style={{
              "max-width": 470,
              marginTop: 16,
            }}
          >
            {findFriendResult}
            <Button
              onClick={addFriend}
              type="primary"
              size="small"
              style={{
                float: "right",
              }}
            >
              팔로우
            </Button>
          </Card>
        )}
      </Modal>
    </>
  );
}

export default SearchFriend;
