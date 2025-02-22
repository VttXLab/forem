module Articles
  # TODO: [yheuhtozr] possible future tag name i18n: see https://github.com/forem/forem/pull/16004#discussion_r780879507
  class ActiveThreadsQuery
    DEFAULT_OPTIONS = {
      tags: ["discuss"],
      time_ago: nil,
      count: 10
    }.with_indifferent_access.freeze

    MINIMUM_SCORE = -4

    # Get the "plucked" attribute information for the article thread.
    #
    # @param relation [ActiveRecord::Relation] the original Article scope
    # @param options [Hash]
    # @option options [Array<String>] :tags which tags to select
    # @option options [NilClass, String, ActiveSupport::TimeWithZone] :time_ago
    # @option options [Integer] :count the number of records to pluck
    #
    # @return [Array<Array>] The inner array is the plucked attribute
    #         values for the selected articles.  Which means be mindful
    #         of the order you pass for attributes.
    #
    # @note The order of attributes and behavior of this method is from
    #       past implementations.  A refactor to consider would be to
    #       create a data structure.
    #
    # @see `./app/views/articles/_widget_list_item.html.erb` for the
    #      importance of maintaining position of these parameters.
    def self.call(relation: Article.published, **options)
      options = DEFAULT_OPTIONS.merge(options)
      tags, time_ago, count = options.values_at(:tags, :time_ago, :count)

      relation = relation.limit(count)
      relation = relation.cached_tagged_with(tags)
      relation = if time_ago == "latest"
                   relation = relation.where(score: MINIMUM_SCORE..).presence || relation
                   relation.order(published_at: :desc)
                 elsif time_ago
                   relation = relation.where(published_at: time_ago.., score: MINIMUM_SCORE..).presence || relation
                   relation.order(comments_count: :desc)
                 else
                   relation = relation.where(published_at: 3.days.ago.., score: MINIMUM_SCORE..).presence || relation
                   relation.order("last_comment_at DESC NULLS LAST")
                 end
      # relation.description = relation.description.truncate(3);
      relation.pluck(:path, :title, :comments_count, :created_at, :image_list, :quick_share, :description, :nsfw)
    end
  end
end
