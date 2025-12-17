### **Reset App Permissions**

* **Endpoint:** PUT /v2/admin/apps/:appId/submissions/:submissionId/permissions/reset
* **Description:** Reset Native apps permissions for the app to the default
* **Role:** Fliplet Admin
* **Platform:** Android & iOS

**Request Body:**

```javascript
{

}
```

**200 Response**

```javascript
{
  "message": "App permissions are reset to default"
}
```

**400 Response:**

```javascript
{
  "message": "An error occured in resetting the app permissions"
}
```








