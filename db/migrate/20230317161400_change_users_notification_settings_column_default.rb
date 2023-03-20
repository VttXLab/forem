class ChangeUsersNotificationSettingsColumnDefault < ActiveRecord::Migration[7.0]
  def change
    change_column_default(:users_notification_settings, :email_badge_notifications, false)
    change_column_default(:users_notification_settings, :email_comment_notifications, false)
    change_column_default(:users_notification_settings, :email_follower_notifications, false)
    change_column_default(:users_notification_settings, :email_mention_notifications, false)
    change_column_default(:users_notification_settings, :email_unread_notifications, false)
  end
end
