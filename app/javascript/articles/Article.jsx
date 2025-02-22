/* eslint-disable react/no-danger */
/* eslint-disable react/jsx-no-comment-textnodes */
import { h } from 'preact';
import PropTypes from 'prop-types';
import { useEffect } from 'preact/hooks';
import ReactImageGrid from '@cordelia273/react-image-grid';
import { articlePropTypes } from '../common-prop-types/article-prop-types';
import {
  ArticleCoverImage,
  CommentsCount,
  CommentsList,
  ContentTitle,
  Meta,
  SaveButton,
  SearchSnippet,
  TagList,
  ReactionsCount,
  ReadingTime,
  Video,
} from './components';
import { PodcastArticle } from './PodcastArticle';

export const Article = ({
  article,
  isFeatured,
  isBookmarked,
  bookmarkClick,
  feedStyle,
  pinned,
  saveable,
}) => {
  if (article && article.type_of === 'podcast_episodes') {
    return <PodcastArticle article={article} />;
  }

  const clickableClassList = [
    'crayons-story',
    'crayons-story__top',
    'crayons-story__body',
    'crayons-story__indention',
    'crayons-story__title',
    'crayons-story__tags',
    'crayons-story__bottom',
    'crayons-story__tertiary',
  ];

  let showCover =
    (isFeatured || article.main_image) && !article.cloudinary_video_url;

  // pinned article can have a cover image
  showCover = showCover || (article.pinned && article.main_image);
  const version =
    article.image_list.length > 0 || article.quick_share ? 'v0' : null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    // eslint-disable-next-line no-undef
    QSFBEmbedParse(2000);
  }, []);

  return (
    <article
      className={`crayons-story cursor-pointer${
        isFeatured ? ' crayons-story--featured' : ''
      }`}
      id={isFeatured ? 'featured-story-marker' : `article-${article.id}`}
      data-content-user-id={article.user_id}
    >
      <a
        href={article.path}
        aria-labelledby={`article-link-${article.id}`}
        className="crayons-story__hidden-navigation-link"
      >
        {article.title}
      </a>
      <div
        role="presentation"
        onClick={(event) => {
          const { classList } = event.target;
          if (clickableClassList.includes(...classList)) {
            if (event.which > 1 || event.metaKey || event.ctrlKey) {
              // Indicates should open in _blank
              window.open(article.path, '_blank');
            } else {
              const fullUrl = window.location.origin + article.path; // InstantClick deals with full urls
              InstantClick.preload(fullUrl);
              InstantClick.display(fullUrl);
            }
          }
        }}
      >
        {article.cloudinary_video_url && <Video article={article} />}

        {showCover && !article.quick_share && (
          <ArticleCoverImage article={article} />
        )}
        <div className="crayons-story__body">
          <div className="crayons-story__top">
            <Meta article={article} organization={article.organization} />
            {pinned && (
              <div
                className="pinned color-accent-brand fw-bold"
                data-testid="pinned-article"
              >
                {/* images/pin.svg */}
                <svg
                  aria-hidden="true"
                  className="mr-2 align-text-bottom color-accent-brand"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path d="M22.314 10.172l-1.415 1.414-.707-.707-4.242 4.242-.707 3.536-1.415 1.414-4.242-4.243-4.95 4.95-1.414-1.414 4.95-4.95-4.243-4.242 1.414-1.415L8.88 8.05l4.242-4.242-.707-.707 1.414-1.415z" />
                </svg>
                Pinned
                <span class="hidden s:inline">&nbsp;post</span>
              </div>
            )}
          </div>

          <div className="crayons-story__indention">
            {version == 'v0' ? null : <ContentTitle article={article} />}
            <TagList tags={article.tag_list} flare_tag={article.flare_tag} />
            <a
              href={article.path}
              style="color: unset !important;"
              id={`article-link-${article.id}`}
            >
              {article.description_html ? (
                <div
                  class="text-styles text-truncate mb-4"
                  dangerouslySetInnerHTML={{ __html: article.description_html }}
                />
              ) : (
                <div
                  class="text-styles text-truncate mb-4"
                >
                  {article.description}
                </div>
              )}
            </a>
            {article.quick_share &&
              !article.image_list.length &&
              article.processed_preview_link && (
                <div
                  class="preview mb-4"
                  dangerouslySetInnerHTML={{
                    __html: article.processed_preview_link,
                  }}
                />
              )}
            {article.quick_share && article.image_list.length > 0 && (
              <div
                id={`photo-grid-${article.id}`}
                class={`photo-grid ${article.nsfw ? 'nsfw-content' : ''}`}
                data-href={article.path}
                data-images={article.image_list}
                data-loaded="true"
              >
                <div class={article.image_list.length ==  1 ? 'photo-grid-one' : ''} style={{ maxWidth: 800, margin: "auto" }}>
                  <ReactImageGrid
                    images={article.image_list}
                    modal={false}
                    onClick={() => {
                      window.location.href = article.path;
                    }}
                  />
                </div>
              </div>
            )}

            {article.class_name === 'Article' && (
              // eslint-disable-next-line no-underscore-dangle
              <SearchSnippet highlightText={article.highlight} />
            )}

            <div className="crayons-story__bottom">
              {article.class_name !== 'User' && (
                <div className="crayons-story__details">
                  <ReactionsCount article={article} />
                  <CommentsCount
                    count={article.comments_count}
                    articlePath={article.path}
                    articleTitle={article.title}
                  />
                </div>
              )}

              <div className="crayons-story__save">
                <ReadingTime readingTime={article.reading_time} />

                <SaveButton
                  article={article}
                  isBookmarked={isBookmarked}
                  onClick={bookmarkClick}
                  saveable={saveable}
                />
              </div>
            </div>
          </div>
        </div>

        {article.top_comments && article.top_comments.length > 0 && (
          <CommentsList
            comments={article.top_comments}
            articlePath={article.path}
            totalCount={article.comments_count}
          />
        )}
      </div>
    </article>
  );
};

Article.defaultProps = {
  isBookmarked: false,
  isFeatured: false,
  feedStyle: 'basic',
  saveable: true,
};

Article.propTypes = {
  article: articlePropTypes.isRequired,
  isBookmarked: PropTypes.bool,
  isFeatured: PropTypes.bool,
  feedStyle: PropTypes.string,
  bookmarkClick: PropTypes.func.isRequired,
  pinned: PropTypes.bool,
  saveable: PropTypes.bool.isRequired,
};
