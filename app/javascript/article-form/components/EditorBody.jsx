import { h } from 'preact';
import PropTypes from 'prop-types';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { LinkPreview } from './LinkPreview/LinkPreview';
import { ImageGrid } from './ImageGrid/ImageGrid';
import { Toolbar } from './Toolbar';
import { handleImagePasted } from './pasteImageHelpers';
import { ImageUploader } from './ImageUploader';
import {
  handleImageUploadSuccess,
  handleImageUploading,
  handleImageUploadFailure,
} from './imageUploadHelpers';
import { handleImageDrop, onDragOver, onDragExit } from './dragAndDropHelpers';
import { TagsField } from './TagsField';
import { EmojiPicker, GifPicker } from '@crayons';
import { usePasteImage } from '@utilities/pasteImage';
import { useDragAndDrop } from '@utilities/dragAndDrop';
import { fetchSearch } from '@utilities/search';
import { AutocompleteTriggerTextArea } from '@crayons/AutocompleteTriggerTextArea';
import { BREAKPOINTS, useMediaQuery } from '@components/useMediaQuery';

export const EditorBody = ({
  onChange,
  defaultValue,
  tagsDefaultValue,
  tagsOnInput,
  imagesDefaultValue,
  imagesOnInput,
  previewLink,
  onPreviewLinkChange,
  onMainImageUrlChange,
  switchHelpContext,
  version,
}) => {
  const textAreaRef = useRef(null);

  const [images, setImages] = useState(
    imagesDefaultValue != '' ? imagesDefaultValue.split(',') : [],
  );
  const [urls, setUrls] = useState([]);
  const smallScreen = useMediaQuery(`(max-width: ${BREAKPOINTS.Medium - 1}px)`);

  document.addEventListener('upload_image_success', (e) => {
    const imagesList = [...images, ...e.detail];
    setImages(imagesList);
    imagesOnInput(imagesList.join(','));
    onMainImageUrlChange({
      links: [
        (location.href.includes('localhost') ||
        location.href.includes('host.docker.internal')
          ? location.origin
          : '') + imagesList[0],
      ],
    });
  });

  const { setElement } = useDragAndDrop({
    onDrop: handleImageDrop(
      handleImageUploading(textAreaRef),
      handleImageUploadSuccess(textAreaRef, version),
      handleImageUploadFailure(textAreaRef),
    ),
    onDragOver,
    onDragExit,
  });

  const setPasteElement = usePasteImage({
    onPaste: handleImagePasted(
      handleImageUploading(textAreaRef),
      handleImageUploadSuccess(textAreaRef, version),
      handleImageUploadFailure(textAreaRef),
    ),
  });

  const onRemoveImage = (image) => {
    images.splice(images.indexOf(image), 1);
    setImages(images);
    imagesOnInput(images.join(','));
  }

  const previewLinkHandler = (content) => {
    let matchUrls = content.match(new RegExp(
      // eslint-disable-next-line no-control-regex
      "((ftp|http|https|gopher|mailto|news|nntp|telnet|wais|file|prospero|aim|webcal):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))","g"
    ));

    matchUrls = Array.from(new Set(matchUrls));

    const difference = matchUrls.filter(x => !urls.includes(x));

    if (difference.length > 0) {
      setUrls(urls.concat(difference));
    }
  }

  const onPreviewSelected = (url) => {
    onPreviewLinkChange(url);
  }

  useLayoutEffect(() => {
    if (textAreaRef.current) {
      setElement(textAreaRef.current);
      setPasteElement(textAreaRef.current);
    }

    previewLinkHandler(textAreaRef.current.innerHTML);
  });

  // const handleImageUploadStarted = () => {

  // }

  // const handleImageUploadEnd = (imageMarkdown = '') => {

  // };

  return (
    <div
      data-testid="article-form__body"
      className="crayons-article-form__body drop-area text-padding"
      // style={version == 'v0' ? {'padding-top' : 0} : null}
    >
      {version == 'v0' ? null : (
        <Toolbar version={version} textAreaId="article_body_markdown" />
      )}
      <AutocompleteTriggerTextArea
        triggerCharacter="@"
        maxSuggestions={6}
        searchInstructionsMessage="Type to search for a user"
        ref={textAreaRef}
        fetchSuggestions={(username) =>
          fetchSearch('usernames', { username }).then(({ result }) =>
            result.map((user) => ({ ...user, value: user.username })),
          )
        }
        autoResize
        // onChange={onChange}
        onChange={(e) => {
          previewLinkHandler(e.target.value);
          onChange(e);
        }}
        onFocus={switchHelpContext}
        aria-label="Post Content"
        name="body_markdown"
        id="article_body_markdown"
        defaultValue={defaultValue}
        placeholder="Write your post content here..."
        className="crayons-textfield crayons-textfield--ghost crayons-article-form__body__field ff-monospace fs-l h-100"
      />

      {version == 'v0' ? (
        <div
          style={{
            border: '1px solid #ddd',
            'border-radius': '0.5rem',
            padding: '0.5rem',
          }}
        >
          Add to your post{' '}
          <ImageUploader
            editorVersion="v2"
            // onImageUploadStart={handleImageUploadStarted}
            // onImageUploadSuccess={handleImageUploadEnd}
            // onImageUploadError={handleImageUploadEnd}
            buttonProps={{
              // onKeyUp: (e) => handleToolbarButtonKeyPress(e, 'toolbar-btn'),
              onClick: () => {},
              tooltip: <span aria-hidden="true">Upload image</span>,
              key: 'image-btn',
              className: 'toolbar-btn formatter-btn mr-1',
              tabindex: '-1',
            }}
          />
          {smallScreen ? null : <EmojiPicker textAreaRef={textAreaRef} />}
          <GifPicker textAreaRef={textAreaRef} />
        </div>
      ) : null}

      {version === 'v0' && (
        <div
          className="crayons-article-form__top drop-area"
          style={{ padding: '0.5rem 0' }}
        >
          <TagsField
            defaultValue={tagsDefaultValue}
            onInput={tagsOnInput}
            switchHelpContext={switchHelpContext}
          />
        </div>
      )}

      {version === 'v0' && images.length > 0 && (
        <div style={{ maxWidth: 800, maxHeight: 400, height: 400 }}>
          <ImageGrid onRemoveImage={onRemoveImage} images={images} modal={true} />
        </div>
      )}
      {urls.length > 0 && images.length == 0 && (<LinkPreview urls={urls} defaultUrl={previewLink} onPreviewSelected={onPreviewSelected} />)}
    </div>
  );
};

EditorBody.propTypes = {
  onChange: PropTypes.func.isRequired,
  defaultValue: PropTypes.string.isRequired,
  switchHelpContext: PropTypes.func.isRequired,
  version: PropTypes.string.isRequired,
};

EditorBody.displayName = 'EditorBody';
