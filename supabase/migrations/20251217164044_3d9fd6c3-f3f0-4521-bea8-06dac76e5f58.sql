-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'expense_added', 'expense_updated', 'settlement_created', 'group_joined'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  related_id UUID, -- expense_id or settlement_id
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Group members can create notifications for other group members
CREATE POLICY "Group members can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (
  (group_id IS NULL) OR 
  (EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = notifications.group_id 
    AND group_members.user_id = auth.uid()
  ))
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;