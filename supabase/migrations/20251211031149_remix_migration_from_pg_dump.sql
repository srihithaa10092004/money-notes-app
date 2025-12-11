CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'user'
);


--
-- Name: get_group_member_profiles(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_group_member_profiles(group_id_param uuid) RETURNS TABLE(id uuid, display_name text, avatar_url text)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT DISTINCT
    p.id,
    p.display_name,
    p.avatar_url
  FROM profiles p
  JOIN group_members gm ON gm.user_id = p.id
  WHERE gm.group_id = group_id_param
    AND is_group_member(auth.uid(), group_id_param);
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number, display_name)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.phone)
  );
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: is_group_admin(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_group_admin(_user_id uuid, _group_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = _group_id
    AND user_id = _user_id
    AND role = 'admin'
  )
$$;


--
-- Name: is_group_member(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.group_id = _group_id
      AND gm.user_id = _user_id
  );
$$;


--
-- Name: join_group_with_invite(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.join_group_with_invite(invite_code text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_invite record;
  v_user_id uuid;
  v_existing_member record;
  v_result json;
BEGIN
  -- Get the current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Find and validate the invite code
  SELECT * INTO v_invite
  FROM public.group_invites
  WHERE code = invite_code
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR uses_count < max_uses);
  
  IF v_invite IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invite code');
  END IF;

  -- Check if user is already a member
  SELECT * INTO v_existing_member
  FROM public.group_members
  WHERE group_id = v_invite.group_id AND user_id = v_user_id;
  
  IF v_existing_member IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'You are already a member of this group');
  END IF;

  -- Add user to the group
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_invite.group_id, v_user_id, 'member');

  -- Increment the uses count
  UPDATE public.group_invites
  SET uses_count = COALESCE(uses_count, 0) + 1
  WHERE id = v_invite.id;

  -- Return success with group info
  RETURN json_build_object(
    'success', true, 
    'group_id', v_invite.group_id,
    'message', 'Successfully joined the group'
  );
END;
$$;


--
-- Name: shares_group_with(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.shares_group_with(_user_id uuid, _other_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM group_members gm1
    JOIN group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = _user_id
      AND gm2.user_id = _other_user_id
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: expense_splits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_splits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    expense_id uuid NOT NULL,
    user_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT expense_splits_amount_check CHECK ((amount >= (0)::numeric))
);


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid NOT NULL,
    paid_by uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text,
    description text NOT NULL,
    category text,
    receipt_url text,
    expense_date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT expenses_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: group_invites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_invites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid NOT NULL,
    code text NOT NULL,
    created_by uuid,
    max_uses integer,
    uses_count integer DEFAULT 0,
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: group_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'member'::text,
    joined_at timestamp with time zone DEFAULT now(),
    CONSTRAINT group_members_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'treasurer'::text, 'viewer'::text, 'member'::text])))
);


--
-- Name: group_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    file_url text,
    file_type text,
    reply_to_id uuid,
    edited_at timestamp with time zone,
    CONSTRAINT content_length_check CHECK ((char_length(content) <= 5000))
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    currency text DEFAULT 'USD'::text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: message_reads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_reads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid NOT NULL,
    user_id uuid NOT NULL,
    read_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: personal_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    amount numeric NOT NULL,
    category text,
    notes text,
    payment_mode text DEFAULT 'cash'::text,
    transaction_date timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT personal_transactions_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT personal_transactions_type_check CHECK ((type = ANY (ARRAY['income'::text, 'expense'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    phone_number text,
    display_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: settlements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settlements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid NOT NULL,
    from_user uuid NOT NULL,
    to_user uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text,
    settled_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT settlements_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: expense_splits expense_splits_expense_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_splits
    ADD CONSTRAINT expense_splits_expense_id_user_id_key UNIQUE (expense_id, user_id);


--
-- Name: expense_splits expense_splits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_splits
    ADD CONSTRAINT expense_splits_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: group_invites group_invites_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_invites
    ADD CONSTRAINT group_invites_code_key UNIQUE (code);


--
-- Name: group_invites group_invites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_invites
    ADD CONSTRAINT group_invites_pkey PRIMARY KEY (id);


--
-- Name: group_members group_members_group_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_user_id_key UNIQUE (group_id, user_id);


--
-- Name: group_members group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_pkey PRIMARY KEY (id);


--
-- Name: group_messages group_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_messages
    ADD CONSTRAINT group_messages_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: message_reads message_reads_message_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reads
    ADD CONSTRAINT message_reads_message_id_user_id_key UNIQUE (message_id, user_id);


--
-- Name: message_reads message_reads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reads
    ADD CONSTRAINT message_reads_pkey PRIMARY KEY (id);


--
-- Name: personal_transactions personal_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_transactions
    ADD CONSTRAINT personal_transactions_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_phone_number_key UNIQUE (phone_number);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: settlements settlements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_group_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_group_messages_created_at ON public.group_messages USING btree (created_at);


--
-- Name: idx_group_messages_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_group_messages_group_id ON public.group_messages USING btree (group_id);


--
-- Name: idx_personal_transactions_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personal_transactions_date ON public.personal_transactions USING btree (transaction_date);


--
-- Name: idx_personal_transactions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personal_transactions_user_id ON public.personal_transactions USING btree (user_id);


--
-- Name: expenses update_expenses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: groups update_groups_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: personal_transactions update_personal_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_personal_transactions_updated_at BEFORE UPDATE ON public.personal_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: expense_splits expense_splits_expense_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_splits
    ADD CONSTRAINT expense_splits_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES public.expenses(id) ON DELETE CASCADE;


--
-- Name: expense_splits expense_splits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_splits
    ADD CONSTRAINT expense_splits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_paid_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_paid_by_fkey FOREIGN KEY (paid_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: group_invites group_invites_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_invites
    ADD CONSTRAINT group_invites_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: group_invites group_invites_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_invites
    ADD CONSTRAINT group_invites_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_members group_members_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_members group_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: group_messages group_messages_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_messages
    ADD CONSTRAINT group_messages_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_messages group_messages_reply_to_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_messages
    ADD CONSTRAINT group_messages_reply_to_id_fkey FOREIGN KEY (reply_to_id) REFERENCES public.group_messages(id) ON DELETE SET NULL;


--
-- Name: group_messages group_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_messages
    ADD CONSTRAINT group_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: groups groups_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: message_reads message_reads_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reads
    ADD CONSTRAINT message_reads_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.group_messages(id) ON DELETE CASCADE;


--
-- Name: message_reads message_reads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reads
    ADD CONSTRAINT message_reads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: personal_transactions personal_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_transactions
    ADD CONSTRAINT personal_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: settlements settlements_from_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_from_user_fkey FOREIGN KEY (from_user) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: settlements settlements_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: settlements settlements_to_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_to_user_fkey FOREIGN KEY (to_user) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles Admins can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can update roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: group_invites Allow uses_count update on valid invites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow uses_count update on valid invites" ON public.group_invites FOR UPDATE USING (((expires_at > now()) AND ((max_uses IS NULL) OR (uses_count < max_uses)))) WITH CHECK (((expires_at > now()) AND ((max_uses IS NULL) OR (uses_count <= max_uses))));


--
-- Name: expense_splits Expense creator can create splits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Expense creator can create splits" ON public.expense_splits FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.expenses
  WHERE ((expenses.id = expense_splits.expense_id) AND (expenses.paid_by = auth.uid())))));


--
-- Name: expense_splits Expense creator can delete splits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Expense creator can delete splits" ON public.expense_splits FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.expenses
  WHERE ((expenses.id = expense_splits.expense_id) AND (expenses.paid_by = auth.uid())))));


--
-- Name: expenses Expense creator can delete their expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Expense creator can delete their expenses" ON public.expenses FOR DELETE USING ((auth.uid() = paid_by));


--
-- Name: expense_splits Expense creator can update splits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Expense creator can update splits" ON public.expense_splits FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.expenses
  WHERE ((expenses.id = expense_splits.expense_id) AND (expenses.paid_by = auth.uid())))));


--
-- Name: expenses Expense creator can update their expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Expense creator can update their expenses" ON public.expenses FOR UPDATE USING ((auth.uid() = paid_by));


--
-- Name: group_invites Group admins can create invites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group admins can create invites" ON public.group_invites FOR INSERT WITH CHECK (public.is_group_admin(auth.uid(), group_id));


--
-- Name: group_invites Group admins can delete invites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group admins can delete invites" ON public.group_invites FOR DELETE USING (public.is_group_admin(auth.uid(), group_id));


--
-- Name: group_members Group admins can remove members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group admins can remove members" ON public.group_members FOR DELETE USING (public.is_group_admin(auth.uid(), group_id));


--
-- Name: groups Group admins can update groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group admins can update groups" ON public.groups FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.group_members
  WHERE ((group_members.group_id = groups.id) AND (group_members.user_id = auth.uid()) AND (group_members.role = 'admin'::text)))));


--
-- Name: group_invites Group admins can view invites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group admins can view invites" ON public.group_invites FOR SELECT USING (public.is_group_admin(auth.uid(), group_id));


--
-- Name: expenses Group members can create expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group members can create expenses" ON public.expenses FOR INSERT WITH CHECK (((auth.uid() = paid_by) AND (EXISTS ( SELECT 1
   FROM public.group_members
  WHERE ((group_members.group_id = expenses.group_id) AND (group_members.user_id = auth.uid()) AND (group_members.role = ANY (ARRAY['admin'::text, 'treasurer'::text, 'member'::text])))))));


--
-- Name: message_reads Group members can mark messages read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group members can mark messages read" ON public.message_reads FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM (public.group_messages gm
     JOIN public.group_members gmem ON ((gmem.group_id = gm.group_id)))
  WHERE ((gm.id = message_reads.message_id) AND (gmem.user_id = auth.uid()))))));


--
-- Name: group_messages Group members can send messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group members can send messages" ON public.group_messages FOR INSERT WITH CHECK (((auth.uid() = user_id) AND public.is_group_member(auth.uid(), group_id)));


--
-- Name: group_messages Group members can view messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group members can view messages" ON public.group_messages FOR SELECT USING (public.is_group_member(auth.uid(), group_id));


--
-- Name: message_reads Group members can view read receipts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group members can view read receipts" ON public.message_reads FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.group_messages gm
     JOIN public.group_members gmem ON ((gmem.group_id = gm.group_id)))
  WHERE ((gm.id = message_reads.message_id) AND (gmem.user_id = auth.uid())))));


--
-- Name: settlements No settlement deletes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No settlement deletes" ON public.settlements FOR DELETE USING (false);


--
-- Name: settlements No settlement updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No settlement updates" ON public.settlements FOR UPDATE USING (false);


--
-- Name: group_members Users can add themselves or admins can add members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can add themselves or admins can add members" ON public.group_members FOR INSERT WITH CHECK (((auth.uid() = user_id) OR public.is_group_admin(auth.uid(), group_id)));


--
-- Name: groups Users can create groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create groups" ON public.groups FOR INSERT WITH CHECK ((auth.uid() = created_by));


--
-- Name: settlements Users can create settlements they're part of; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create settlements they're part of" ON public.settlements FOR INSERT WITH CHECK ((((auth.uid() = from_user) OR (auth.uid() = to_user)) AND (EXISTS ( SELECT 1
   FROM public.group_members
  WHERE ((group_members.group_id = settlements.group_id) AND (group_members.user_id = auth.uid()))))));


--
-- Name: group_messages Users can delete own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own messages" ON public.group_messages FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: personal_transactions Users can delete own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own transactions" ON public.personal_transactions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: personal_transactions Users can insert own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own transactions" ON public.personal_transactions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: group_messages Users can update own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own messages" ON public.group_messages FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: personal_transactions Users can update own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own transactions" ON public.personal_transactions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: expenses Users can view expenses in their groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view expenses in their groups" ON public.expenses FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.group_members
  WHERE ((group_members.group_id = expenses.group_id) AND (group_members.user_id = auth.uid())))));


--
-- Name: groups Users can view groups they are members of or created; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view groups they are members of or created" ON public.groups FOR SELECT USING (((auth.uid() = created_by) OR (EXISTS ( SELECT 1
   FROM public.group_members
  WHERE ((group_members.group_id = groups.id) AND (group_members.user_id = auth.uid()))))));


--
-- Name: group_members Users can view members of their groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view members of their groups" ON public.group_members FOR SELECT USING (public.is_group_member(auth.uid(), group_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: personal_transactions Users can view own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own transactions" ON public.personal_transactions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: settlements Users can view settlements in their groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view settlements in their groups" ON public.settlements FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.group_members
  WHERE ((group_members.group_id = settlements.group_id) AND (group_members.user_id = auth.uid())))));


--
-- Name: expense_splits Users can view splits in their groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view splits in their groups" ON public.expense_splits FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.expenses
     JOIN public.group_members ON ((group_members.group_id = expenses.group_id)))
  WHERE ((expenses.id = expense_splits.expense_id) AND (group_members.user_id = auth.uid())))));


--
-- Name: expense_splits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

--
-- Name: expenses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

--
-- Name: group_invites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;

--
-- Name: group_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

--
-- Name: group_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: groups; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

--
-- Name: message_reads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

--
-- Name: personal_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.personal_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: settlements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


