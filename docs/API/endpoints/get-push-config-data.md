### **Get Push config data**

* **Endpoint:** GET v1/widget-instances/com.fliplet.push-notifications?appId=:appId
* **Description:** Get push notifications config for the app
* **Role:** Viewer
* **Platform:** Android & iOS

**200 Response:**

```javascript
{
    "widgetInstance": {
        "id": 29057329,
        "settings": {
            "apn": true,
            "apnKeyId": "CKBB258L37",
            "apnTopic": "com.fliplet.iOsPublishingV2",
            "apnTeamId": "H25Z7T6F52",
            "apnAuthKey": "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgEdKt7dBaBy+1bRk7\n/wuq9pB7Dy9RHIj/QOoi4TI70dSgCgYIKoZIzj0DAQehRANCAARpmXrd3fcVXLvZ\nwjtq1LJFBQPr2Ioex71BUq5j+2+TMCw+Eu9D0wUmtk3RQx04rcvk9yujeLjdJY2Q\nQMRPBrNX\n-----END PRIVATE KEY-----"
        },
        "uuid": "d852f952-f236-4467-8340-ce7c585449f4",
        "createdAt": "2025-03-10T07:17:35.572Z",
        "updatedAt": "2025-06-16T07:13:26.924Z",
        "deletedAt": null,
        "widgetId": 44,
        "parentId": null,
        "widget": {
            "isTheme": false,
            "isFunction": false,
            "isInline": false,
            "package": "com.fliplet.push-notifications",
            "tags": [
                "type:appComponent",
                "visibility:hidden"
            ],
            "id": 44,
            "name": "Push notifications",
            "updatedAt": "2024-10-17T10:34:47.701Z"
        }
    },
    "apps": []
}
```








