### **Create new iOS Certificate**

* **Endpoint:** POST /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate
* **Description:** Create new iOS distribution certificate
* **Role:** Publisher
* **Platform:** iOS

**200 Response:**

```javascript
{
  "credentials": {
"createdAt": 1730816402422,
"type": "apple",
"status": "created",
"email": "arpan.exe@hotmail.com",
"createdFromUserId": 567094,
"updatedAt": 1745913972615,
"verifiedAt": 1745913864647,
"appPassword": "cnoj-rbor-jaik-cmrh",
"teamId": "H25Z7T6F52",
"teamName": "Weboo Online Limited",
"certSigningRequest": "-----BEGIN CERTIFICATE REQUEST-----\nMIICUzCCATsCAQAwDjEMMAoGA1UEAwwDUEVNMIIBIjANBgkqhkiG9w0BAQEFAAOC\nAQ8AMIIBCgKCAQEA3RFlDIMxYgGazaNTpgVgN0XbrfkUI20OHWwuAUVp4By5Wys5\nSLBsZYliVRkHCIXeHCBf1UJAKNixHrXbepmS4iiuGLGNRN+R9BvdpFHHCml5imop\nEqGi79iwMOKkCE+n+yAPe5jZHD9KN8aHwfShkQ6pMyXSlv102SXmaHnq56smAVgd\nn8dQUUqnMannbnS71/qvzFQHzenXc5l8KVf4v58fDDhLL8AwfbWjcRkHH9Q8Owtx\nef2q9c8dzPAC4Ab6Vx3tvYGynCywU8Qy8FqrWUPsx5UG//ZO26P7ldgVY+8iMAQV\nBmgLLAI1mSbiwhipIuvDXCdLcpGm/Hez832gkwIDAQABoAAwDQYJKoZIhvcNAQEL\nBQADggEBAMncMp/cmSYV2i5mBVerniR8x+fi1aAz/14E2FXd0cvJ5Bsf7AuCgLG5\nUqxcShZxmLNk0veEyvfH0CdsP3ZY1uU9faeBjazWglbrrOc9uZCDGsVNIEBaKHVu\ns0zsx3lXEuXKh+UjbQSNsHG22IPfBu9tXiKmpZ5JUaDv4u/tFDofORs3FfSmvK5K\nO4+pInxW7Su1SW/hvpjDW17JCBhjgieD3yBO7hvyCHULBQ5FGvK/fGfNW/GlbyNC\nllnqGwHaOq5uxnTzpDLRRbXQJrS/a4ojR9pb4zJfNBbePDBIMNhfe4UCraNCVRlq\nBxpEWbqnLaRtOpGodhTHaZMWqLVzEMY=\n-----END CERTIFICATE REQUEST-----\n",
"p12": {
"url": "https://cdn.fliplet.com/organizations/2845/credentials/73b77527caabcbea7db61521a534dd52.p12"
},
"iTunesConnectTeamId": 913727,
"certificateName": "WJ287HZG6R.p12"
},
  "message": "Certificate generated successfully"
}
```

**400 Response:**

```javascript
{
  "message": "Submission not found"
}
```

**400 Response:**

```javascript
{
  "message": "Maximum number of certificates reached. Please revoke unused certificates",  "status": "MAX_CERTIFICATES_REACHED"
}
```

**400 Response:**

```javascript
{
  "message": "Insufficient permissions to create distribution certificates",  "status": "INSUFFICIENT_PERMISSIONS"
}
```

**400 Response:**

```javascript
{
  "message": "Failed to generate distribution certificate",  "status": "FAILED_CERTIFICATE_CONFIGURATION"
}
```

