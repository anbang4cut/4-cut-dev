import React, { Component } from "react";
import styled from "styled-components";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";
import { Badge } from "antd";

const Container = styled.div`
  overflow: hidden;
`;

const ImageContainer = styled.div`
  margin: 0 8px;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
`;

const tempUrl = "https://ab4c-image-bucket.s3.ap-northeast-2.amazonaws.com/"; // todo: s3 url prefix
const badgeColors = [
  "#fccc14", // gold
  "#a9aaae", // silver
  "#d47a5b", // bronze
  //  "gold",
  //  "gold",
  //  "gold",
  "#fc8da1",
  "#fc8da1",
  "#fc8da1",
  "#fc8da1",
  "#fc8da1",
  "#fc8da1",
  "#fc8da1",
];

export default class AutoSlides extends Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
    };
  }

  loadImage = async () => {
    axios
      .get("/api/images/album/top10")
      .then(({ data }) => {
        data.map((image) => {
          this.setState((state) => {
            return {
              images: state.images.concat([
                {
                  id: image.id,
                  url: tempUrl + image.key,
                },
              ]),
            };
          });
        });
      })
      .catch((e) => {
        // API 호출이 실패한 경우
        console.error(e); // 에러표시
      });
  };

  componentDidMount() {
    this.loadImage();
  }

  render() {
    const { images } = this.state;
    const settings = {
      dots: false,
      infinite: true, //무한 반복 옵션
      speed: 2000, // 다음 버튼 누르고 다음 화면 뜨는데까지 걸리는 시간(ms)
      slidesToShow: 2, // 한 화면에 보여질 컨텐츠 개수
      slidesToScroll: 1, //스크롤 한번에 움직일 컨텐츠 개수
      arrows: true,
      autoplay: true, // 자동 스크롤 사용 여부
      autoplaySpeed: 2000, // 자동 스크롤 시 다음으로 넘어가는데 걸리는 시간 (ms)
      centerMode: true, // 컨텐츠가 중앙에 위치하도록 설정
      innerHeight: "auto",
      responsible: true, // 슬라이드가 컨텐츠보다 클 경우 슬라이드 사이즈를 컨텐츠에 맞춰 조정
      responsive: [
        {
          breakpoint: 415,
          settings: {
            slidesToShow: 1,
          },
        },
      ],
    };
    return (
      <Container>
        <h2># BEST 10</h2>
        <Slider {...settings}>
          {images.map((image, index) => {
            return (
              <div>
                <ImageContainer>
                  <Badge.Ribbon
                    text={index + 1}
                    color={badgeColors[index]}
                    placement="start"
                  >
                    <Image src={image.url} key={image.id} />
                  </Badge.Ribbon>
                </ImageContainer>
              </div>
            );
          })}
        </Slider>
      </Container>
    );
  }
}
