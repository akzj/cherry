use diesel::PgConnection;
use std::env;

pub fn get_connection() -> PgConnection {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgConnection::establish(&database_url).expect("Failed to connect to database")
}