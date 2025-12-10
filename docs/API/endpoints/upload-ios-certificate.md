### **Upload iOS Certificate**

* **Endpoint:** PUT /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate
* **Description:** Upload iOS distribution certificate and private key
* **Role:** Publisher
* **Platform:** iOS

**Required Fields:**

- `privateKey` (string): Private key content in PEM format
- `certificate` (string): Certificate content in PEM format

**Request Body:**

```javascript
{
  "privateKey": "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA1gfHx9oOy+wqOCYF6VQKcrKnhCrVZgXxW553D/gu0ZjzAhFd\n3VN6fJKm6lK3V2i0SNcfzImD7JmW6SHQD9lGZrDvZK9J8nI/caWgjca9nyfDO5rM\ndXBMPpPGgSGBqyxmt8UcWX2JxwlvCAw9WeVunQYwb155lxWfnQlHnj3t2/ayCy0t\nS0afovSQeqeU9/9apZ84u3LLJ241E56uzX8d84K1D22Nidsu8gLzYGWa03UjnxvB\ni7wmtYAov12cMEF4tFnUsN/ZUWm4nkDAB+SlURbIFb9biel/SxiBEEsCW0FqpfoO\ncoBIsT/FiZQU6/NXuYC03WYdS6x5y/A5KOqx0QIDAQABAoIBAQCVDdwTEYhmefU5\nHznUsiOIl2TURaRSJeddn/FZHMU2UOdD1GZjQcS2xscZvztR02hipfbOUiKe/qO7\nfkHRF8bQs340x2KfRvNqKSe0NOlP0rhDZV3ol6lxlyaSPYx5cjWi29IPfL8b7zT1\nDNkZJxAuqOXIWaoiDvwWuCS5TnW9Tjz9m5VWCgDEKwLt/2+NfCOG+zyx64IoO/XS\nOGqlJ7gB/XljKdMO1+pWIz9wZrpzjjH4CPIOapCUnPDytUah2ZxSUSIvUJNPM+lH\n3E1frYOJdLFFLZgiJmZKRKkFhwuIjaxnfMSRSgwiuopZb5iHp4CACXT9bN3d7LbL\nlRSC69yFAoGBAPsx5FPKUSSt+A0/XMDiB0ZTybbHFqe4Oaz6hJCvjihXAFOxJtW8\n5Z0bwj/sYUEJ6wEuoeuZlb1zMhyjqMcfha0E6BhaaP5Pr1DaOz147LVNVxZH67+0\nYKiYLU616K/YEvhxNA2Igjt8d9tOym2ktcWlEiNAHzGVLHgxLR0EfY5nAoGBANof\n5JhF9i1JzopwabsdcpRme2anmYdFMXUk7hfqcttuIxZJ0D5cuTXWg1lymkNZhj6b\nPrX4/VHYmEpWGx8exBLUh0QLd8FKb69r/xBe59r5uWiNIhxFLyMfj0Ch67hHU6O7\njnrXi+xMqnNTIvuAYn5mg56EBUKgGZ2d8uGVm6sHAoGAMaHBAIFIGRw6l7t+Qyol\nz9J8V53srwTqeHAjQ0c8qmHOUbr99ltVbv5uGh1FdglUoq4pFhkJih45t4jqrzVe\nPzpp9W3fsufhtvL3o4TCGGyImYFqZj1on8c5pISyzhO+Y9JSO55ORRypve5KdvGF\nbODZvZdM0oor+C+XP1WEzV8CgYBVgoM/Hs4vWuvZYdBRRm4Qt0xRJgsN+JY28k9U\nmNiGJVsj9bPpfrgs3veHLWJEXOg/yuR+uim02FB7c94WCR2ctCyDBGviHqhCAPhx\nFoOWWKfS0OE6a/TatBiYoeGi0HN9kJ1+ktmLvVJk+4aPSflSzCV1ExRs1g60t6Lr\nxJbOKQKBgENemy7fDWpVStv1n4TG9nR2O+nN16IXY0SDIsixIDF5sOd6csd8F1H1\nvi980wrOwq1L/SGE4vgH6fXnj/vFLHy1OnAVD1QUUOy0lAaL4QMDJaK9PC0t1mtq\nzP6IeGY6GJ01xHQRnYaj1X1r9BYe0ixWxOOTRpEFS7OiZN5HOFEC\n-----END RSA PRIVATE KEY-----\n", // required
  "certificate": "-----BEGIN CERTIFICATE-----\nMIIFwzCCBKugAwIBAgIQC7ibXmbzMA6wsrp2H1hNeDANBgkqhkiG9w0BAQsFADB1\nMUQwQgYDVQQDDDtBcHBsZSBXb3JsZHdpZGUgRGV2ZWxvcGVyIFJlbGF0aW9ucyBD\nZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTELMAkGA1UECwwCRzMxEzARBgNVBAoMCkFw\ncGxlIEluYy4xCzAJBgNVBAYTAlVTMB4XDTI1MDQyMzE1MDgwMVoXDTI2MDQyMzE1\nMDgwMFowgZ4xGjAYBgoJkiaJk/IsZAEBDApIMjVaN1Q2RjUyMT8wPQYDVQQDDDZp\nUGhvbmUgRGlzdHJpYnV0aW9uOiBXZWJvbyBPbmxpbmUgTGltaXRlZCAoSDI1WjdU\nNkY1MikxEzARBgNVBAsMCkgyNVo3VDZGNTIxHTAbBgNVBAoMFFdlYm9vIE9ubGlu\nZSBMaW1pdGVkMQswCQYDVQQGEwJHQjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC\nAQoCggEBANYHx8faDsvsKjgmBelUCnKyp4Qq1WYF8Vuedw/4LtGY8wIRXd1TenyS\npupSt1dotEjXH8yJg+yZlukh0A/ZRmaw72SvSfJyP3GloI3GvZ8nwzuazHVwTD6T\nxoEhgassZrfFHFl9iccJbwgMPVnlbp0GMG9eeZcVn50JR5497dv2sgstLUtGn6L0\nkHqnlPf/WqWfOLtyyyduNROers1/HfOCtQ9tjYnbLvIC82BlmtN1I58bwYu8JrWA\nKL9dnDBBeLRZ1LDf2VFpuJ5AwAfkpVEWyBW/W4npf0sYgRBLAltBaqX6DnKASLE/\nxYmUFOvzV7mAtN1mHUusecvwOSjqsdECAwEAAaOCAiMwggIfMAwGA1UdEwEB/wQC\nMAAwHwYDVR0jBBgwFoAUCf7AFZD5r2QKkhK5JihjDJfsp7IwcAYIKwYBBQUHAQEE\nZDBiMC0GCCsGAQUFBzAChiFodHRwOi8vY2VydHMuYXBwbGUuY29tL3d3ZHJnMy5k\nZXIwMQYIKwYBBQUHMAGGJWh0dHA6Ly9vY3NwLmFwcGxlLmNvbS9vY3NwMDMtd3dk\ncmczMDIwggEeBgNVHSAEggEVMIIBETCCAQ0GCSqGSIb3Y2QFATCB/zCBwwYIKwYB\nBQUHAgIwgbYMgbNSZWxpYW5jZSBvbiB0aGlzIGNlcnRpZmljYXRlIGJ5IGFueSBw\nYXJ0eSBhc3N1bWVzIGFjY2VwdGFuY2Ugb2YgdGhlIHRoZW4gYXBwbGljYWJsZSBz\ndGFuZGFyZCB0ZXJtcyBhbmQgY29uZGl0aW9ucyBvZiB1c2UsIGNlcnRpZmljYXRl\nIHBvbGljeSBhbmQgY2VydGlmaWNhdGlvbiBwcmFjdGljZSBzdGF0ZW1lbnRzLjA3\nBggrBgEFBQcCARYraHR0cHM6Ly93d3cuYXBwbGUuY29tL2NlcnRpZmljYXRlYXV0\naG9yaXR5LzAWBgNVHSUBAf8EDDAKBggrBgEFBQcDAzAdBgNVHQ4EFgQUjfISr7Aa\nmfXIMXgv/OWWOEiKrcEwDgYDVR0PAQH/BAQDAgeAMBMGCiqGSIb3Y2QGAQQBAf8E\nAgUAMA0GCSqGSIb3DQEBCwUAA4IBAQAb1uTAdN6nWnYIV9pSSEhAmrkoTrTqdDHP\n8HfhtPQrhEbpSUXRB7oAiwOY6dGX2GWue4Pd9cVTYds3ujmaTwcLNPepwAl70i+j\n7YzajHlKZm9rtbJaxo2cn/ORdq7MUje3+2LD/A8TIwQCiBBkY6AcREso86HxLZhG\nfwrCxpjF3cyLckKV+rLarpJFXIjWZRUOwkNH1GsYAONy5eaOcjhJHo1/QPVKoJhu\nxwPe1pNJ8q7nusJvbLLixH4y4F6GNM5DjqKxXspakWU2oPyGkkVnJcXwqpOEPzA8\nFLPldVaSEJMXToI2B5mcOt9arUWMhlBGGxqVBW4o33C+2gsGRnJF\n-----END CERTIFICATE-----" // required
}
```

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
  "message": "Missing required parameters: privateKey and certificate are required",  "status": "MISSING_CERTIFICATE_CONFIGURATION"
}
```

**400 Response:**

```javascript
{
  "message": "Team ID is required for iOS platform",  "status": "MISSING_API_KEY_CONFIGURATION"
}
```

**400 Response:**

```javascript
{
  "message": "Certificate provided for the app is not valid",  "status": "INVALID_CERTIFICATE"
}
```

