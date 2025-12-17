### **Delete API key Configuration (For Apple app store apps only)**

* **Endpoint:** DELETE /v2/organizations/:organizationId/credentials/api-keys/teams/:teamId
* **Description:** Delete a specific Apple App Store API key configuration by team ID.
* **Role:** Organization Admin
* **Platform:** iOS

**200 Response:**

```javascript
{
  "message": "API key configuration deleted successfully"
}
```

**400 Response (Error):**

```javascript
{
  "message": "Error deleting API key"
}
```








