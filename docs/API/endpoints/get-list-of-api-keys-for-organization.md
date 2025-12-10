### **Get list of API Keys for organization (For Apple app store apps only)**

* **Endpoint:** GET /v2/organizations/:organizationId/credentials/api-keys
* **Description:** Retrieves all Apple App Store API key configurations for an organization across all teams.
* **Role:** Publisher

**Required Fields:**

- None (GET endpoint with no parameters)

**200 Response:**

```javascript
{
  "apiKeys": [
    {
      "teamId": "team123",
      "keyId": "ABC123DEF4",
      "issuerId": "57246b42-0bad-4034-a4c8-123456789012",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "createdFromUserId": 123,
      "name": "Production API Key"
    },
    {
      "teamId": "team456",
      "keyId": "DEF456GHI7",
      "issuerId": "8a9b7c6d-5e4f-3g2h-1i0j-987654321098",
      "updatedAt": "2024-01-17T09:15:00.000Z",
      "createdFromUserId": 456,
      "name": "Team 456 API Key"
    }
  ]
}
```

**200 Response (No API keys configured):**

```javascript
{
  "apiKeys": []
}
```

**400 Response (Error):**

```javascript
{
  "message": "Error retrieving API keys"
}
```

