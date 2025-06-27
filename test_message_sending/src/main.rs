mod simple_test;

use cherrycore::{
    client::stream::{StreamClient, StreamRecordDecoderMachine},
    jwt,
    types::{DataFormat, Message, StreamEvent, StreamReadRequest},
};
use std::time::Duration;
use tokio::time::sleep;
use uuid::Uuid;

pub(crate) const JWT_SECRET: &str = "cherryjwt_secret";

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("debug"));
    let jwt_secret = std::env::var("JWT_SECRET").unwrap_or(JWT_SECRET.to_string());
    std::env::set_var("JWT_SECRET", jwt_secret);

    let jwt_token = jwt::JwtClaims::new(Uuid::new_v4(), 3600)
        .to_token()
        .unwrap();

    let args: Vec<String> = std::env::args().collect();

    if args.len() > 1 && args[1] == "simple" {
        // Run simplified test (StreamServer only)
        return simple_test::run_simple_test().await;
    }

    // Full test (requires CherryServer and database)
    println!("=== Full Test: Requires CherryServer and Database ===");

    // Wait for servers to start
    println!("Waiting for servers to start...");
    sleep(Duration::from_secs(3)).await;

    // Create stream client
    let stream_client = StreamClient::new("http://localhost:8080", Some(jwt_token));

    // Test message sending
    println!("Starting message sending tests...");

    // Test 1: Send normal message
    let message = Message {
        id: 1,
        user_id: Uuid::new_v4(),
        content: "Hello, this is a test message!".to_string(),
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

    // Test 2: Send reply message
    let reply_message = Message {
        id: 2,
        user_id: Uuid::new_v4(),
        content: "This is a reply to message 1".to_string(),
        timestamp: chrono::Utc::now(),
        reply_to: Some(1),
        type_: "text".to_string(),
        image_url: None,
        image_thumbnail_url: None,
        image_metadata: None,
    };

    println!("Sending reply message: {:?}", reply_message);
    match stream_client.send_message(1, reply_message).await {
        Ok(_) => println!("✅ Reply message sent successfully"),
        Err(e) => println!("❌ Reply message sending failed: {}", e),
    }

    // Test 3: Send event
    let event = StreamEvent::ConversationCreated {
        conversation_id: Uuid::new_v4(),
    };

    println!("Sending event: {:?}", event);
    let event_data = event.encode()?;
    match stream_client.append_stream(2, event_data).await {
        Ok(response) => println!("✅ Event sent successfully: {:?}", response),
        Err(e) => println!("❌ Event sending failed: {}", e),
    }

    // Test 4: Batch send messages
    let messages = vec![
        Message {
            id: 3,
            user_id: Uuid::new_v4(),
            content: "Batch message 1".to_string(),
            timestamp: chrono::Utc::now(),
            reply_to: None,
            type_: "text".to_string(),
            image_url: None,
            image_thumbnail_url: None,
            image_metadata: None,
        },
        Message {
            id: 4,
            user_id: Uuid::new_v4(),
            content: "Batch message 2".to_string(),
            timestamp: chrono::Utc::now(),
            reply_to: None,
            type_: "text".to_string(),
            image_url: None,
            image_thumbnail_url: None,
            image_metadata: None,
        },
    ];

    println!("Batch sending messages...");
    for (i, msg) in messages.into_iter().enumerate() {
        println!("Sending batch message {}: {:?}", i + 1, msg);
        match stream_client.send_message(1, msg).await {
            Ok(_) => println!("✅ Batch message {} sent successfully", i + 1),
            Err(e) => println!("❌ Batch message {} sending failed: {}", i + 1, e),
        }
        sleep(Duration::from_millis(100)).await; // Short delay
    }

    let mut decoder_machine = StreamRecordDecoderMachine::new();

    // Test 5: Read messages
    println!("Starting message reading test...");
    match stream_client.open_stream().await {
        Ok((req_tx, mut msg_rx)) => {
            println!("✅ WebSocket connection successful");

            // Send read request
            let read_request = StreamReadRequest {
                stream_id: 1,
                offset: 0,
            };

            if let Err(e) = req_tx.send(read_request).await {
                println!("❌ Failed to send read request: {}", e);
            } else {
                println!("✅ Read request sent successfully");

                loop {
                    // Wait for message response
                    let timeout = tokio::time::timeout(Duration::from_secs(5), msg_rx.recv()).await;
                    match timeout {
                        Ok(Some(response)) => {
                            println!("✅ Received message response: {:?}", response);
                            let records = decoder_machine.decode(
                                response.stream_id,
                                response.offset,
                                response.data.as_slice(),
                            );
                            match records {
                                Ok(Some(records)) => {
                                    for (record, offset) in records {
                                        println!("✅ Offset: {}", offset);
                                        match record.meta.data_format {
                                            DataFormat::JsonMessage => {
                                                let decoded_message: Message =
                                                    serde_json::from_slice(&record.content)
                                                        .unwrap();
                                                println!(
                                                    "✅ Decoded message: {:?}",
                                                    decoded_message
                                                );
                                            }
                                            DataFormat::JsonEvent => {
                                                let decoded_event: StreamEvent =
                                                    serde_json::from_slice(&record.content)
                                                        .unwrap();
                                                println!("✅ Decoded event: {:?}", decoded_event);
                                            }
                                        }
                                    }
                                }
                                Ok(None) => {
                                    println!("❌ No records decoded");
                                }
                                Err(e) => {
                                    println!("❌ Error decoding records: {}", e);
                                }
                            }
                        }
                        Ok(None) => {
                            println!("❌ Message channel closed");
                        }
                        Err(_) => {
                            println!("❌ Message reading timeout");
                            break;
                        }
                    }
                }
            }
        }
        Err(e) => {
            println!("❌ WebSocket connection failed: {}", e);
        }
    }

    println!("Test completed!");
    Ok(())
}
