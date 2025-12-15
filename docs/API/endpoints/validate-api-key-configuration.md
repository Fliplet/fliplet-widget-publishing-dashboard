### **Validate API Key Configuration (For Apple app store apps only)**

* **Endpoint:** POST /v2/organizations/:organizationId/credentials/api-key/validate
* **Description:** Validate API key for apple app store submission
* **Role:** Publisher
* **Platform:** iOS

**Required Fields:**

- `apiKey` (string): Private key content (p8 file content) from App Store Connect
- `issuerId` (string): Issuer ID from App Store Connect
- `keyId` (string): Key ID from App Store Connect
- `teamId` (string): Team ID from App Store Connect

**Request Body:**

```javascript
{
  "apiKey": "-----BEGIN PRIVATE KEY-----\nMIGTAgIBAQQg7Iy3Yrr98r4iT8+g\n0nKz77xWDYOu3hjnJ7peRD8iYUmgCgYIKoZIzj0DAQehRANCAARQ7rBBRkby3Rv0\nDEqMVzXtPeOuRQxywmndSRSMKxigamJoIpoitdzSCm3A8jsa0Zl2iQRF8A9dS/oD\npjQpDHJ6\n-----END PRIVATE KEY-----", // required
  "issuerId": "69b9rh75-b5e2-47e3-e078-5b8c7c11a4d1", // required
  "keyId": "977G8RX79F", // required
  "teamId": "AFIG8RX79F" // required
}
```

**200 Response (Valid API Key):**

```javascript
{
  "isValid": true,
  "message": "API key is valid"
}
```

**200 Response (Invalid API Key):**

```javascript
{
  "isValid": false,
  "message": "API key is not valid",
  "details": "Invalid key format or credentials"
}
```

**400 Response (Missing Parameters):**

```javascript
{
  "message": "Missing required parameters: name, keyId, issuerId, teamId and apiKey are required",
  "status": "MISSING_API_KEY_CONFIGURATION"
}
```

**400 Response (Validation Error):**

```javascript
{
  "message": "API key validation error"
}
```








