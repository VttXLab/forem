import { h } from 'preact';
import { articlePropTypes } from '../../common-prop-types';

export const ArticleCoverImage = ({ article }) => {
  return (
    <div className="crayons-article__cover crayons-article__cover__image__feed">
      <div class="blur-frame">
        <div class="blur-bg" style={{
          backgroundImage: `url("${article.main_image}")`
        }} />
        <a
          href={article.path}
          className="crayons-article__cover__image__feed crayons-story__cover__image"
          title={article.title}
        >
          <img
            className={`crayons-article__cover__image__feed${
              article.nsfw ? ' nsfw-content' : ''
            }`}
            src={article.main_image}
            width="650"
            height="275"
            alt={article.title}
            // style={{
            //   backgroundColor: `${article.main_image_background_hex_color}`,
            // }}
          />
        </a>
      </div>
    </div>
  );
};

ArticleCoverImage.propTypes = {
  article: articlePropTypes.isRequired,
};

ArticleCoverImage.displayName = 'ArticleCoverImage';
