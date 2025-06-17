use std::env;

use diesel::{
    query_dsl::methods::{FindDsl, SelectDsl},
    Connection, RunQueryDsl, SelectableHelper, SqliteConnection,
};
use dotenvy::dotenv;

use crate::db::{models::*, schema::*};

pub fn establish_connection() -> SqliteConnection {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

pub fn get_user_by_id(conn: &mut SqliteConnection, id: i32) -> Result<User, diesel::result::Error> {
    users::table.find(id).select(User::as_select()).first(conn)
}

pub fn contact_list_all(
    conn: &mut SqliteConnection,
) -> Result<Vec<Contact>, diesel::result::Error> {
    contacts::table.select(Contact::as_select()).load(conn)
}
