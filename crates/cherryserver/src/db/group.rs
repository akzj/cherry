use deadpool_postgres::Pool;
use log::info;
use serde::Serialize;
#[derive(Debug, Serialize)]
pub struct Group {
    pub id: u32,
    pub name: String,
    pub description: Option<String>,
    pub member_count: u32,
}

pub async fn get_user_groups(
    pool: &Pool,
    user_id: i32,
) -> Result<Vec<Group>, Box<dyn std::error::Error + Send + Sync>> {
    info!("Fetching groups for user ID: {}", user_id);
    
    let client = pool.get().await?;
    
    let stmt = client
        .prepare(
            "SELECT g.id, g.name, g.stream_id, COUNT(gm.user_id) as member_count
             FROM groups g 
             JOIN group_members gm ON g.id = gm.group_id 
             WHERE g.id IN (SELECT group_id FROM group_members WHERE user_id = $1)
             GROUP BY g.id, g.name, g.stream_id"
        )
        .await?;
    
    let rows = client.query(&stmt, &[&user_id]).await?;
    
    let mut groups = Vec::new();
    for row in rows {
        groups.push(Group {
            id: row.get::<_, i32>(0) as u32,
            name: row.get(1),
            description: row.get::<_, Option<String>>(2),
            member_count: row.get::<_, i64>(3) as u32,
        });
    }
    
    info!("Found {} groups for user ID: {}", groups.len(), user_id);
    Ok(groups)
} 