module Nsfwimage
  extend ActiveSupport::Concern

  @nsfw_optimized_list = []
  @nsfw_removed_list = []

  attr_accessor :nsfw_optimized_list, :nsfw_removed_list

  def nsfw_optimized_list
    @nsfw_optimized_list ||= []
  end

  def nsfw_removed_list
    @nsfw_removed_list ||= []
  end

  def evaluate_nsfw_image_list
    if image_list == "" || image_list.nil?
      return
    end

    self.nsfw = false

    begin
      image_list.split(",").each do |image|
        uri = Addressable::URI.parse(image)
        if Nsfw.unsafe?(Rails.public_path.to_s + uri.path.to_s)
          self.nsfw = true
        end
      end
    rescue Nsfw::NsfwEroticError, Nsfw::NsfwHentaiError => e
      errors.add(:base, ErrorMessages::Clean.call("Your post contains sensitive images!!!"))
    end
  end

  def set_nsfw
    self.nsfw = false
    self.nsfw = true unless nsfw_optimized_list.empty?
  end

  def add_nsfw_class_cover
    return unless main_image.present?

    if nsfw_removed_list.include? main_image
      self.main_image = ""
    end
  end

  def add_nsfw_tag
    return unless self.nsfw
    return if tag_list.include? "nsfw"

    if tag_list.size >= self.class::MAX_TAG_LIST_SIZE
      tag_list.remove(tag_list[tag_list.size - 1], parse: true)
    end

    tag_list.add("nsfw", parse: true)
  end

  def add_nsfw_class_body
    return if nsfw_optimized_list.empty?

    doc = Nokogiri::HTML(processed_html)
    doc.xpath("//img").each do |img|
      if nsfw_optimized_list.include? img['src']
        img.append_class("nsfw-content")
      end
    end

    self.processed_html = doc.to_html
  end

  def evaluate_nsfw_markdown
    image_tags = body_markdown.scan(/(!\[[^\]]*\]\((.*?)\s*("(?:.*[^"])")?\s*\))/i)

    unless image_tags
      return
    end

    image_tags.each do |image_tag|
      evaluate_nsfw_image(image_tag[1])
    end
  end

  def evaluate_nsfw_main_image
    evaluate_nsfw_image(main_image) unless main_image.nil?
  end

  private

  def evaluate_nsfw_image(image_url)
    if image_url.match(/#{URL.domain}/i) || image_url.start_with?("/")
      uri = Addressable::URI.parse(image_url)
      image_path = Rails.public_path.to_s + uri.path.to_s
    else
      tempfile = Down.download(image_url, max_redirects: 3)
      return unless File.exist?(tempfile.path)

      image_path = tempfile.path
    end

    begin
      if Nsfw.unsafe?(image_path)
        nsfw_optimized_list.push(Images::Optimizer.call(image_url, width: 880).gsub(",", "%2C"))
      end
    rescue Nsfw::NsfwEroticError, Nsfw::NsfwHentaiError => e
      nsfw_removed_list.push(image_url)
      self.body_markdown = body_markdown.gsub(/(!)(\[.*\])\(#{image_url}\)/i, "")

      File.delete(image_path) if File.exist?(image_path)
    rescue Exception => e
      p e
    end
  end
end
