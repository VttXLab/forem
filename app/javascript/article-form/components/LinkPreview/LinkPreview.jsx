import { h } from 'preact';
import { useState, useEffect, useLayoutEffect, useCallback } from 'preact/hooks';
import PropTypes from "prop-types";
import styled from "styled-components";
// import parser from 'html-metadata-parser';
import { LinkPreview as LP } from '@dhaiwat10/react-link-preview';
import { fetchHtml } from '../../actions';
import { parse as HTML, HTMLElement } from "node-html-parser";

const EditButton = styled.div`
  width: calc(var(--su-4)*11);
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

const PreviewContainer = styled.div`
  margin-bottom: var(--su-4);
  cursor: pointer;
  & > * {
    pointer-events: none;
  }
  &:last-child {
    margin-bottom: 0;
  }
  &:hover .Container {
    border: 2px solid var(--accent-brand) !important;
    border-radius: var(--su-3);
    --webkit-border-radius: var(--su-3);
  }
`;

const readMT = (el, name) => {
  const prop = el.getAttribute('name') || el.getAttribute('property');
  return prop == name ? el.getAttribute('content') : null;
};

const parse = async (data) => {
  const $ = HTML(data);
  const og = {}, meta = {}, images = [];

  const title = $.querySelector('title');
  if (title)
      meta.title = title.text;

  const canonical = $.querySelector('link[rel=canonical]');
  if (canonical) {
      meta.url = canonical.getAttribute('href');
  }


  const metas = $.querySelectorAll('meta');

  for (let i = 0; i < metas.length; i++) {
      const el = metas[i];

      // const prop = el.getAttribute('property') || el.getAttribute('name');

      ['title', 'description', 'image'].forEach(s => {
          const val = readMT(el, s);
          if (val) meta[s] = val;
      });

      ['og:title', 'og:description', 'og:image', 'og:url', 'og:site_name', 'og:type'].forEach(s => {
          const val = readMT(el, s);
          if (val) og[s.split(':')[1]] = val;
      });
  }


  // images
  $.querySelectorAll('img').forEach(el => {
      let src = el.getAttribute('src');
      if (src) {
          src = new URL(src).href;
          images.push({ src });
      }
  });

  return { meta, og, images };

}

export const LinkPreview = ({ urls, defaultUrl, onPreviewSelected }) => {
  const [ currentUrls, setCurrentUrls ] = useState([]);
  const [ metadatas, setMetadatas ] = useState({});
  const [ newUrl, setNewUrl ] = useState(defaultUrl);
  const [ hover, setHover ] = useState(false);
  const [ edit, setEdit ] = useState(false);

  const customFetcher = useCallback(async (url) => {
    if (metadatas[`${url}`]) {
      return metadatas[`${url}`];
    }

    try {
      const { hostname } = new URL(url);
      // const metadata = await parser(`https://cors-anywhere.herokuapp.com/${url}`);
      const html = await fetchHtml(url);
      const metadata = await parse(html);
      // const metadata = await parser(`${url}`);
      const { images, og, meta } = metadata;

      const image = og.image
          ? og.image
          : images.length > 0
          ? images[0].src
          : null;
        const description = og.description
          ? og.description
          : meta.description
          ? meta.description
          : null;
        const title = (og.title ? og.title : meta.title) || '';
        const siteName = og.site_name || '';

      const response = {
        title,
        description,
        image,
        siteName,
        hostname,
      };

      setMetadatas({ ...metadatas, [url]: response });

      // const response = {
      //   description: "Toàn mấy ông đọc báo phán chuyện chính trị, thỉnh thoảng có viết lách tí ti",
      //   hostname: "hoitrada.com",
      //   image: "https://hoitrada.com/uploads/articles/uth4tpvdfx0ns12q9rfu.png",
      //   siteName: "Hội trà đá 8",
      //   title: "Hội trà đá 8"
      // }

      return response;
    } catch (error) {
      delete metadatas[`${url}`];
      setMetadatas(metadatas);

      const index = currentUrls.indexOf(url);
      if (index !== -1) {
        currentUrls.splice(index, 1);
      }
      const lastUrl = currentUrls[currentUrls.length - 1];

      setCurrentUrls(currentUrls);
      setNewUrl(lastUrl);
    }
  }, [metadatas, currentUrls]);

  const handleEdit = () => {
    setEdit(!edit);
  }

  const handlePreviewClick = (url) => {
    onPreviewSelected(url);
    setEdit(false);
    setNewUrl(url);
  }

  useLayoutEffect(() => {
    const difference = Array.from(new Set(urls)).filter(x => !currentUrls.includes(x));

    if (difference.length > 0) {
      const newUrls = currentUrls.concat(difference);
      const lastUrl = newUrls[newUrls.length - 1];

      setCurrentUrls(newUrls);
      setNewUrl(lastUrl);
      onPreviewSelected(lastUrl);
    }
  }, [urls]);

  useEffect(() => {
    setNewUrl(defaultUrl);
  }, [defaultUrl]);

  return (
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
    <div
      onMouseOver={()=>{
        setHover(true)
      }}
      onMouseOut={()=>{
        setHover(false)
      }}
    >
      {!edit && hover && currentUrls.length > 1 && <EditButton onClick={() => handleEdit()}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-arrow-left-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5z"/>
          </svg>
          Change Preview</EditButton>}
      {!edit && newUrl && <LP url={newUrl} fetcher={customFetcher} />}
      {edit && (
        <div>
          <CloseEditBtn onClick={() => handleEdit()}>
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 440.5 291.1">
              <path d="M418.1,120.4H87.8l82-82.1c8.8-8.8,8.8-23,0-31.7c-8.8-8.8-22.9-8.8-31.7,0L0,144.8l139.5,139.7c4.4,4.4,10.1,6.6,15.9,6.6 s11.5-2.2,15.9-6.5c8.8-8.8,8.8-22.9,0-31.7l-87.4-87.6h334.3c12.4,0,22.4-10,22.4-22.4S430.5,120.4,418.1,120.4z"/>
            </svg>
          </CloseEditBtn>
          {currentUrls.map(
            (url, index) => (<PreviewContainer onClick={() => handlePreviewClick(url) } key={index}>
              <LP url={url} fetcher={customFetcher} />
            </PreviewContainer>)
          )}
        </div>
      )}
    </div>
  )
};

LinkPreview.defaultProps = {
  urls: []
};

LinkPreview.propTypes = {
  urls: PropTypes.array.isRequired
};
