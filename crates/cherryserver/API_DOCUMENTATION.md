# Cherry Server API Documentation

## Update Stream Offset API

### Endpoint
`POST /api/v1/streams/update_offset`

### Description
Updates the offset of a specific stream. This API requires authentication and the user must have access to the stream (checked via ACL).

### Authentication
Requires a valid JWT token in the Authorization header.

### Request Body
```json
{
  "stream_id": 123,
  "offset": 456
}
```

### Request Fields
- `stream_id` (integer): The ID of the stream to update
- `offset` (integer): The new offset value to set

### Response
```json
{
  "stream_id": 123,
  "offset": 456,
  "success": true
}
```

### Response Fields
- `stream_id` (integer): The ID of the stream that was updated
- `offset` (integer): The new offset value that was set
- `success` (boolean): Always true when the operation succeeds

### Error Responses

#### 401 Unauthorized
Returned when the JWT token is invalid or missing.

#### 403 Forbidden
Returned when the user doesn't have access to the specified stream.

#### 500 Internal Server Error
Returned when there's a database error or other internal issue.

### Example Usage

#### cURL
```bash
curl -X POST http://localhost:8080/api/v1/streams/update_offset \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "stream_id": 123,
    "offset": 456
  }'
```

#### JavaScript
```javascript
const response = await fetch('/api/v1/streams/update_offset', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  },
  body: JSON.stringify({
    stream_id: 123,
    offset: 456
  })
});

const result = await response.json();
console.log(result);
```

### Implementation Details

The API performs the following steps:
1. Validates the JWT token and extracts the user ID
2. Checks if the user has access to the specified stream using ACL
3. Updates the stream offset in the database
4. Returns a success response with the updated values

The stream offset is stored in the `stream_meta` JSONB field of the streams table as a nested value. 