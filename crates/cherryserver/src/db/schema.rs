// @generated automatically by Diesel CLI.

diesel::table! {
    contact_details (contact_id, user_id) {
        contact_id -> Uuid,
        user_id -> Uuid,
        custom_fields -> Nullable<Jsonb>,
        last_interaction -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    contacts (contact_id) {
        contact_id -> Uuid,
        owner_id -> Uuid,
        target_id -> Uuid,
        #[max_length = 20]
        relation_type -> Varchar,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        #[max_length = 100]
        remark_name -> Nullable<Varchar>,
        tags -> Nullable<Jsonb>,
        is_favorite -> Bool,
        mute_settings -> Nullable<Jsonb>,
    }
}

diesel::table! {
    conversations (conversation_id) {
        conversation_id -> Uuid,
        #[sql_name = "type"]
        #[max_length = 10]
        type_ -> Varchar,
        members -> Jsonb,
        meta -> Jsonb,
        message_stream_id -> Int8,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

diesel::table! {
    streams (stream_id) {
        stream_id -> Int8,
        owner_id -> Uuid,
        #[sql_name = "type"]
        #[max_length = 20]
        type_ -> Varchar,
        stream_meta -> Jsonb,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

diesel::table! {
    users (user_id) {
        user_id -> Uuid,
        #[max_length = 50]
        username -> Varchar,
        #[max_length = 100]
        email -> Varchar,
        password_hash -> Text,
        profile -> Jsonb,
        app_config -> Jsonb,
        stream_meta -> Jsonb,
        created_at -> Timestamptz,
        last_active -> Timestamptz,
    }
}

diesel::joinable!(contact_details -> contacts (contact_id));
diesel::joinable!(contact_details -> users (user_id));
diesel::joinable!(streams -> users (owner_id));

diesel::allow_tables_to_appear_in_same_query!(
    contact_details,
    contacts,
    conversations,
    streams,
    users,
);
