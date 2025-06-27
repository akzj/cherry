use cherrycore::{
    client::stream::StreamClient,
    jwt,
    types::{Message, StreamEvent, StreamReadRequest},
};
use std::time::Duration;
use tokio::time::sleep;
use uuid::Uuid;

pub async fn run_simple_test() -> Result<(), Box<dyn std::error::Error>> {
    let jwt_token = jwt::JwtClaims::new(Uuid::new_v4(), 3600)
        .to_token()
        .unwrap();

    println!("=== Simplified Test: StreamServer Only ===");

    // Wait for server to start
    println!("Waiting for StreamServer to start...");
    sleep(Duration::from_secs(2)).await;

    // Create stream client
    let stream_client = StreamClient::new("http://localhost:8080", Some(jwt_token));

    // Test 1: Send normal message
    let message = Message {
        id: 1,
        user_id: Uuid::new_v4(),
        content: "Hello, StreamServer!".to_string(),
        timestamp: chrono::Utc::now(),
        reply_to: None,
        type_: "text".to_string(),
        image_url: None,
        image_thumbnail_url: None,
        image_metadata: None,
    };

    println!("Sending message: {:?}", message);
    match stream_client.send_message(1, message).await {
        Ok(_) => println!("✅ Message sent successfully"),
        Err(e) => println!("❌ Message sending failed: {}", e),
    }

    // Test 2: Send event
    let event = StreamEvent::ConversationCreated {
        conversation_id: Uuid::new_v4(),
    };

    println!("Sending event: {:?}", event);
    let event_data = event.encode()?;
    match stream_client.append_stream(2, event_data).await {
        Ok(response) => println!("✅ Event sent successfully: {:?}", response),
        Err(e) => println!("❌ Event sending failed: {}", e),
    }

    // Test 3: Read messages
    println!("Attempting to read messages...");
    match stream_client.open_stream().await {
        Ok((req_tx, mut msg_rx)) => {
            println!("✅ WebSocket connection successful");

            let read_request = StreamReadRequest {
                stream_id: 1,
                offset: 0,
            };

            if let Err(e) = req_tx.send(read_request).await {
                println!("❌ Failed to send read request: {}", e);
            } else {
                println!("✅ Read request sent successfully");

                let timeout = tokio::time::timeout(Duration::from_secs(3), msg_rx.recv()).await;
                match timeout {
                    Ok(Some(response)) => {
                        println!("✅ Received message response: {:?}", response);
                    }
                    Ok(None) => {
                        println!("❌ Message channel closed");
                    }
                    Err(_) => {
                        println!("❌ Message reading timeout");
                    }
                }
            }
        }
        Err(e) => {
            println!("❌ WebSocket connection failed: {}", e);
        }
    }

    println!("Simplified test completed!");
    Ok(())
}
