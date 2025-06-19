// @generated automatically by Diesel CLI.

diesel::table! {
    contacts (id) {
        id -> Integer,
        user_id -> Integer,
        contact_id -> Integer,
        relationship_type -> Nullable<Text>,
        nickname -> Nullable<Text>,
        status -> Nullable<Text>,
        last_seen -> Nullable<Timestamp>,
        notes -> Nullable<Text>,
        is_verified -> Nullable<Bool>,
        is_blocked -> Nullable<Bool>,
        created_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    conversations (id) {
        id -> Integer,
        #[sql_name = "type"]
        type_ -> Text,
        user_id -> Integer,
        other_user_id -> Nullable<Integer>,
        group_id -> Nullable<Integer>,
        stream_id -> Nullable<Integer>,
        last_message_id -> Nullable<Integer>,
        unread_count -> Nullable<Integer>,
        is_pinned -> Nullable<Bool>,
        created_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    files (id) {
        id -> Text,
        sender_id -> Integer,
        conversation_id -> Nullable<Integer>,
        #[sql_name = "type"]
        type_ -> Text,
        name -> Text,
        size -> Integer,
        path -> Text,
        uploaded_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    friend_requests (id) {
        id -> Integer,
        from_user_id -> Integer,
        to_user_id -> Integer,
        content -> Nullable<Text>,
        status -> Text,
        created_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    group_members (id) {
        id -> Integer,
        group_id -> Integer,
        user_id -> Integer,
        role -> Nullable<Text>,
        joined_at -> Nullable<Timestamp>,
        is_online -> Nullable<Bool>,
        last_seen -> Nullable<Timestamp>,
        is_muted -> Nullable<Bool>,
        mute_until -> Nullable<Timestamp>,
        is_banned -> Nullable<Bool>,
    }
}

diesel::table! {
    group_requests (id) {
        id -> Integer,
        group_id -> Integer,
        user_id -> Integer,
        content -> Nullable<Text>,
        status -> Text,
        created_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    groups (id) {
        id -> Integer,
        name -> Text,
        description -> Nullable<Text>,
        creator_id -> Integer,
        avatar_path -> Nullable<Text>,
        created_at -> Nullable<Timestamp>,
        is_encrypted -> Nullable<Bool>,
        encryption_key -> Nullable<Text>,
        visibility -> Nullable<Text>,
        member_count -> Nullable<Integer>,
        last_active -> Nullable<Timestamp>,
    }
}

diesel::table! {
    messages (id) {
        id -> Integer,
        conversation_id -> Integer,
        sender_id -> Integer,
        content -> Text,
        #[sql_name = "type"]
        type_ -> Text,
        status -> Text,
        timestamp -> Nullable<Timestamp>,
        reaction -> Nullable<Text>,
        reply_to -> Nullable<Integer>,
        media_path -> Nullable<Text>,
    }
}

diesel::table! {
    notifications (id) {
        id -> Integer,
        sender_id -> Nullable<Integer>,
        conversation_id -> Nullable<Integer>,
        user_id -> Integer,
        #[sql_name = "type"]
        type_ -> Text,
        content -> Text,
        is_read -> Nullable<Bool>,
        timestamp -> Nullable<Timestamp>,
        expires_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    offline_messages (id) {
        id -> Integer,
        conversation_id -> Integer,
        sender_id -> Integer,
        content -> Text,
        timestamp -> Nullable<Timestamp>,
        is_sent -> Nullable<Bool>,
    }
}

diesel::table! {
    settings (id) {
        id -> Integer,
        key -> Text,
        value -> Text,
        category -> Nullable<Text>,
    }
}

diesel::table! {
    users (id) {
        id -> Integer,
        username -> Text,
        display_name -> Text,
        avatar_path -> Nullable<Text>,
        last_login -> Nullable<Timestamp>,
        registration_date -> Timestamp,
        status -> Text,
        last_active -> Nullable<Timestamp>,
    }
}

diesel::joinable!(messages -> users (sender_id));

diesel::allow_tables_to_appear_in_same_query!(
    contacts,
    conversations,
    files,
    friend_requests,
    group_members,
    group_requests,
    groups,
    messages,
    notifications,
    offline_messages,
    settings,
    users,
);
