module Homepage
  class ArticleSerializer < ApplicationSerializer
    # @param relation [ActiveRecord::Relation<Article>]
    #
    # @return [Hash]
    def self.serialized_collection_from(relation:)
      # Unfortunately the FlareTag class sends one SQL query per each article,
      # as we want to optimize by loading them in one query, we're using a different class
      tag_flares = Homepage::FetchTagFlares.call(relation)

      # including user and organization as the last step as they are not needed
      # by the query that fetches tag flares, they are only needed by the serializer
      relation = relation.includes(:user, :organization)

      new(relation, params: { tag_flares: tag_flares }, is_collection: true)
        .serializable_hash[:data]
        .pluck(:attributes)
    end

    attributes(
      :class_name,
      :cloudinary_video_url,
      :comments_count,
      :id,
      :path,
      :public_reactions_count,
      :readable_publish_date,
      :reading_time,
      :title,
      :user_id,
      :description,
      :description_html,
      :quick_share,
      :processed_html,
      :processed_preview_link,
      :main_image_background_hex_color,
      :nsfw
    )

    attribute :video_duration_string, &:video_duration_in_minutes
    attribute :published_at_int, ->(article) { article.published_at.to_i }
    attribute :tag_list, ->(article) { article.cached_tag_list.to_s.split(", ") }
    attribute :image_list, ->(article) { article.image_list.to_s.split(",") }
    attribute :flare_tag, ->(article, params) { params.dig(:tag_flares, article.id) }
    attribute :main_image, ->(article) { ApplicationController.helpers.cloud_cover_url(article.main_image) }

    attribute :user do |article|
      user = article.user

      {
        name: user.name,
        profile_image_90: user.profile_image_90,
        username: user.username
      }
    end

    attribute :organization, if: proc { |a| a.organization.present? } do |article|
      organization = article.organization

      {
        name: organization.name,
        profile_image_90: article.organization.profile_image_90,
        slug: organization.slug
      }
    end
  end
end
