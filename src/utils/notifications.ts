import { supabase } from "@/integrations/supabase/client";

interface CreateNotificationParams {
  userId: string;
  type: 'expense_added' | 'expense_updated' | 'settlement_created' | 'group_joined';
  title: string;
  message: string;
  groupId?: string;
  relatedId?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  groupId,
  relatedId
}: CreateNotificationParams) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      group_id: groupId,
      related_id: relatedId
    });

  if (error) {
    console.error('Error creating notification:', error);
  }
}

export async function notifyGroupMembers({
  groupId,
  excludeUserId,
  type,
  title,
  message,
  relatedId
}: {
  groupId: string;
  excludeUserId: string;
  type: CreateNotificationParams['type'];
  title: string;
  message: string;
  relatedId?: string;
}) {
  // Get all group members except the one who triggered the action
  const { data: members, error: membersError } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)
    .neq('user_id', excludeUserId);

  if (membersError || !members) {
    console.error('Error fetching group members:', membersError);
    return;
  }

  // Create notifications for all members
  const notifications = members.map(member => ({
    user_id: member.user_id,
    type,
    title,
    message,
    group_id: groupId,
    related_id: relatedId
  }));

  if (notifications.length > 0) {
    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {
      console.error('Error creating notifications:', error);
    }
  }
}
