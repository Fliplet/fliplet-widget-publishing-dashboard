### **Check iOS Certificate**

* **Endpoint:** POST /v2/apps/:appId/submissions/:submissionId/check-certificate
* **Description:** Check if existing iOS certificate is valid or not
* **Role:** Publisher
* **Platform:** iOS

**200 Response (Valid Certificate):**

```javascript
{
  "validCertificate": true,
  "message": "Certificate provided for the app is valid"
}
```

**400 Response (Invalid Certificate):**

```javascript
{
  "validCertificate": false,
  "message": "Certificate provided for the app is not valid"
}
```

**400 Response (Missing Team ID):**

```javascript
{
  "validCertificate": false,
  "message": "Team ID is required"
}
```

**400 Response (Invalid Platform):**

```javascript
{
  "status": "INVALID_PLATFORM",
  "message": "Certificate check is only available for iOS"
}
```

**500 Response (Server Error):**

```javascript
{
  "status": "ERROR",
  "message": "Internal server error"
}
```

