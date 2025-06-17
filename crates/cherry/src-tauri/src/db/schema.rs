// @generated automatically by Diesel CLI.

diesel::table! {
    chat_messages (id) {
        id -> Integer,
        sender_id -> Text,
        sender_name -> Text,
        content -> Text,
        timestamp -> Integer,
        message_type -> Text,
        text -> Nullable<Text>,
        url -> Nullable<Text>,
        width -> Nullable<Integer>,
        height -> Nullable<Integer>,
        duration -> Nullable<Integer>,
    }
}

diesel::table! {
    posts (id) {
        id -> Nullable<Integer>,
        title -> Text,
        body -> Text,
        published -> Bool,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    chat_messages,
    posts,
);
