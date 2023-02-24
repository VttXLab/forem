import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import PropTypes from "prop-types";
import styled, { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
    .image-gallery {
        width: 100vw;
    }

    .image-gallery *:focus {
        outline: none;
    }
`;

const Overlay = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  position: absolute;
  width: 100%;
  height: 100%;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
`;

const ImgCell = styled.div`
  cursor: pointer;
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImgEditCell = styled.div`
  cursor: pointer;
  width: calc(50% - var(--su-2));
  float: left;
  height: 200px;
  text-align: center;
  border: 1px solid #ccc;
  position: relative;
  border-radius: var(--su-2);
  margin: var(--su-1);
  display: flex;
  justify-content: center;
`;

const ImgEdit = styled.img`
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
`;

const ImgRemove = styled.div`
  width: calc(var(--su-4)*2);
  height: calc(var(--su-4)*2);
  line-height: calc(var(--su-4)*1.75);
  position: absolute;
  background: #555;
  color: white;
  font-weight: bold;
  border-radius: var(--su-6);
  --webkit-border-radius: var(--su-6);
  text-align: center;
  cursor: pointer;
  right: 0;
  margin: var(--su-2);
`;

const EditButton = styled.div`
  width: calc(var(--su-4)*8);
  text-indent: var(--su-2);
  display: flex;
  justify-content: center;
  position: absolute;
  z-index: 1;
  background: white;
  border-radius: var(--su-3);
  --webkit-border-radius: var(--su-3);
  padding: var(--su-2);
  text-align: center;
  margin: var(--su-4);
  cursor: pointer;
  box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.1);
  -webkit-box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.1);
  -moz-box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.1);
`;

const CloseEditBtn = styled.div`
  background: white;
  border-radius: var(--su-3);
  padding: var(--su-2);
  cursor: pointer;
  right: 0;
`;

const Container = styled.div`
  display: grid;
  ${(props) => `gap: ${props.gap};`}
  ${(props) => props.count === 2 && `grid-template-columns: repeat(2, 1fr);`}
  ${(props) =>
    props.isHorizontal &&
    props.count === 3 &&
    `grid-template-columns: repeat(2, 1fr);`}
  ${(props) =>
    props.isHorizontal &&
    props.count >= 4 &&
    `grid-template-columns: repeat(3, 1fr);`}
  ${(props) =>
    !props.isHorizontal &&
    props.count === 3 &&
    `grid-template-columns: 2fr 1fr; grid-template-rows: repeat(2, 1fr);`}
  ${(props) =>
    !props.isHorizontal &&
    props.count >= 4 &&
    `grid-template-columns: 2fr 1fr; grid-template-rows: repeat(3, 1fr);`}
  ${ImgCell}:nth-child(1) {
    grid-column-start: 1;
    grid-row-start: 1;
    ${(props) =>
      props.isHorizontal && props.count === 3 && `grid-column-end: 3;`}
    ${(props) =>
      props.isHorizontal && props.count >= 4 && `grid-column-end: 4;`}
    ${(props) => !props.isHorizontal && props.count === 3 && `grid-row-end: 3;`}
    ${(props) => !props.isHorizontal && props.count >= 4 && `grid-row-end: 4;`}
  }
  ${(props) =>
    props.count === 2 ? `${ImgCell} {` : `${ImgCell}:not(:nth-child(1)) {`}
    position: relative;
    &:after {
      content: '';
      display: block;
      padding-bottom: 100%;
    }
    ${Img} {
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      position: absolute;
    }
  }
`;

const ImageEdit =  ({image, handleClick, onRemoveImage}) => {
  const [hover, setHover] = useState(false);
  const [show, setShow] = useState(true);
  return (show && <ImgEditCell
    onClick={() => handleClick(image)}
    onMouseOver={()=>{
      setHover(true)
    }}
    onMouseOut={()=>{
      setHover(false)
    }}
  >
    {hover && <ImgRemove onClick={() => {
      onRemoveImage(image)
      setShow(false)
    }}>
      <svg class="crayons-icon c-btn__icon" aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="m12 10.586 4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636l4.95 4.95z" />
      </svg>
    </ImgRemove>} 
    <ImgEdit src={image} alt={image} />
  </ImgEditCell>);
}

export const ImageGrid = ({ images, gap, className, onClick, onRemoveImage }) => {
  const count = images.length;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(true);

  const [edit, setEdit] = useState(false);
  const [hover, setHover] = useState(false);

  const handleClick = (clickedImage) => {
    onClick(clickedImage);
  };

  const handleEdit = () => {
    setEdit(!edit);
  }

  useEffect(() => {
    const img = new Image();
    const [firstImage] = images;
    img.src = firstImage;

    img.onload = () => {
      setImageLoaded(true);
      if (img.width > img.height) setIsHorizontal(true);
      else setIsHorizontal(false);
    };

  }, [images]);

  return (
    imageLoaded && 
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
    <div onMouseOver={()=>{
      setHover(true)
    }}
    onMouseOut={()=>{
      setHover(false)
    }}>
      <GlobalStyle />
      {!edit && (<div>
        {hover && <EditButton onClick={() => handleEdit()}>
          <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 117.74 122.88">
            <g><path class="st0" d="M94.62,2c-1.46-1.36-3.14-2.09-5.02-1.99c-1.88,0-3.56,0.73-4.92,2.2L73.59,13.72l31.07,30.03l11.19-11.72 c1.36-1.36,1.88-3.14,1.88-5.02s-0.73-3.66-2.09-4.92L94.62,2L94.62,2L94.62,2z M41.44,109.58c-4.08,1.36-8.26,2.62-12.35,3.98 c-4.08,1.36-8.16,2.72-12.35,4.08c-9.73,3.14-15.07,4.92-16.22,5.23c-1.15,0.31-0.42-4.18,1.99-13.6l7.74-29.61l0.64-0.66 l30.56,30.56L41.44,109.58L41.44,109.58L41.44,109.58z M22.2,67.25l42.99-44.82l31.07,29.92L52.75,97.8L22.2,67.25L22.2,67.25z"/></g>
          </svg>
          Sửa ảnh</EditButton>}
        <Container
          isHorizontal={isHorizontal}
          count={count}
          gap={gap}
          className={className}
        >
          {images.map(
            (image, index) =>
              index <= 3 && (
                <ImgCell
                  key={image}
                  onClick={() => handleClick(image)}
                >
                  <Img src={image} alt={image} />
                  {count > 4 && index === 3 && (
                    <Overlay>
                      <h3>+{count - 3}</h3>
                    </Overlay>
                  )}
                </ImgCell>
              )
          )}
        </Container>
      </div>)}
      {edit && (
        <div>
          <CloseEditBtn onClick={() => handleEdit()}>
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 440.5 291.1">
              <path d="M418.1,120.4H87.8l82-82.1c8.8-8.8,8.8-23,0-31.7c-8.8-8.8-22.9-8.8-31.7,0L0,144.8l139.5,139.7c4.4,4.4,10.1,6.6,15.9,6.6 s11.5-2.2,15.9-6.5c8.8-8.8,8.8-22.9,0-31.7l-87.4-87.6h334.3c12.4,0,22.4-10,22.4-22.4S430.5,120.4,418.1,120.4z"/>
            </svg>
          </CloseEditBtn>
          {images.map(
            (image) =>
              <ImageEdit
                key={image}
                image={image}
                handleClick={handleClick}
                onRemoveImage={onRemoveImage}
                />
          )}
        </div>
      )}
    </div>
  );
};

ImageGrid.defaultProps = {
  className: "",
  gap: "0.2rem",
  modal: true,
  onClick: () => {},
};

ImageGrid.propTypes = {
  images: PropTypes.array.isRequired,
  gap: PropTypes.string,
  className: PropTypes.string,
  modal: PropTypes.bool,
  onClick: PropTypes.func,
};
