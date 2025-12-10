### **Get Push config data from TeamId (For Apple app store apps only)**

* **Endpoint:** GET /v2/organizations/:organizationId/credentials/ios-push-config/:teamId
* **Description:** Get push notifications config for the app stored by teamId
* **Role:** Publisher
* **Platform:** iOS

**200 Response (Push Config Found):**

```javascript
{
  "pushConfig": {
    "apnKeyId": "CKBB258L37",
    "apnAuthKey": "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgEdKt7dBaBy+1bRk7\n/wuq9pB7Dy9RHIj/QOoi4TI70dSgCgYIKoZIzj0DAQehRANCAARpmXrd3fcVXLvZ\nwjtq1LJFBQPr2Ioex71BUq5j+2+TMCw+Eu9D0wUmtk3RQx04rcvk9yujeLjdJY2Q\nQMRPBrNX\n-----END PRIVATE KEY-----",
    "apnTopic": "com.fliplet.iOsPublishingV2",
    "apnTeamId": "H25Z7T6F52"
  }
}
```

**200 Response (No Push Config Found):**

```javascript
{
  "pushConfig": {}
}
```

**400 Response (Missing Team ID):**

```javascript
{
  "message": "Team ID is required",
  "status": "MISSING_TEAM_ID"
}
```

**400 Response (Error):**

```javascript
{
  "message": "Error retrieving push configuration"
}
```

