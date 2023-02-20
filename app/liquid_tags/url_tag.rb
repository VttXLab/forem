# OpenGraphTag is NOT registered in the Registry; rather, it is a fallback
class UrlTag < LiquidTagBase
  PARTIAL = "liquids/url".freeze
  attr_accessor :page

  def initialize(_tag_name, url, _parse_context)
    super

    @url = url
  end

  def render(_context)
    ApplicationController.render(
      partial: PARTIAL,
      locals: {
        url: @url
      },
    )
  end
end
