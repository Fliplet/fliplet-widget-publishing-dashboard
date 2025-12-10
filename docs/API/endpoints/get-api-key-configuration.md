### **Get API Key Configuration (For Apple app store apps only)**

* **Endpoint:** GET /v2/organizations/:organizationId/credentials/api-keys/teams/:teamId
* **Description:** Retrieves a specific Apple App Store API key configuration by team ID
* **Role:** Publisher & AAB token
* **Platform:** iOS

**Required Fields:**

- `teamId` (path parameter): Team ID from App Store Connect

**Optional Query Parameters:**

- `includeSensitiveData` (boolean): Whether to include API key content or not (default: false)

**200 Response (with includeSensitiveData=true):**

```javascript
{
  "teamId": "team123",
  "keyId": "ABC123DEF4",
  "issuerId": "57246b42-0bad-4034-a4c8-123456789012",
  "apiKey": "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...",
  "name": "Production API Key",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "createdFromUserId": 123
}
```

**200 Response (with includeSensitiveData=false or not provided):**

```javascript
{
  "teamId": "team123",
  "keyId": "ABC123DEF4",
  "issuerId": "57246b42-0bad-4034-a4c8-123456789012",
  "hasApiKey": true,
  "name": "Production API Key",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "createdFromUserId": 123
}
```

**404 Response (API key not found):**

```javascript
{
  "message": "API key configuration not found"
}
```

**400 Response (Error):**

```javascript
{
  "message": "Error retrieving API key"
}
```

