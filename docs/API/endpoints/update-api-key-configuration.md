### **Update API key Configuration (For Apple app store apps only)**

* **Endpoint:** PUT /v2/organizations/:organizationId/credentials/api-keys/teams/:teamId
* **Description:** Update a specific Apple App Store API key name by team ID.
* **Role:** Organization Admin
* **Platform:** iOS

**Required Fields:**

- `name` (string): Display name for the API key

**Request Body:**

```javascript
{
  "name": "Fliplet org" // required
}
```

**200 Response:**

```javascript
{
  "teamId": "AFIG8RX79F",
  "config": {
    "keyId": "ABC123DEF4",
    "issuerId": "57246b42-0bad-4034-a4c8-123456789012",
    "teamId": "AFIG8RX79F",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "name": "Fliplet org"
  },
  "message": "API key name updated successfully"
}
```

**400 Response (Missing Name):**

```javascript
{
  "message": "API key name is required",
  "status": "MISSING_API_KEY_CONFIGURATION"
}
```

**404 Response (API key not found):**

```javascript
{
  "message": "API key configuration not found",
  "status": "MISSING_API_KEY_CONFIGURATION"
}
```

**500 Response (Server Error):**

```javascript
{
  "message": "Internal server error"
}
```








