# **Sequence Diagrams**

## Table of Contents

- [iOS Publishing Sequence Diagram](#ios-publishing-sequence-diagram)
- [Android Publishing Sequence Diagram](#android-publishing-sequence-diagram)
- [Native App Permissions Management Sequence Diagram (Admin Only)](#native-app-permissions-management-sequence-diagram-admin-only)
- [Common Error Handling Flows](#common-error-handling-flows)

## [**iOS Publishing Sequence Diagram**](https://www.mermaidchart.com/app/projects/f25a08be-ef1b-4013-bbcf-9aea46f48796/diagrams/f5520f14-d645-4b47-9219-2a6d30daa983/share/invite/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb2N1bWVudElEIjoiZjU1MjBmMTQtZDY0NS00YjQ3LTkyMTktMmE2ZDMwZGFhOTgzIiwiYWNjZXNzIjoiRWRpdCIsImlhdCI6MTc1NjExNTk3NX0.lLUmAmg79WOYhCB5b4b3LlWrJEbzDhoc4PJ5N3cW6Is)

```
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Fliplet API
    participant ASC as App Store Connect

    Note over U,ASC: Initial Setup Phase
    U->>FE: Start iOS Publishing
    FE->>API: GET /v2/apps/:appId/submissions/latest?platform=ios
    API-->>FE: Submission state response

    alt No submission or completed submission	or canceled or failed
        Note over FE: Create new submission flow
    else Existing incomplete submission
        Note over FE: Continue existing submission flow
    end

    Note over U,ASC: API Key Selection Phase
    FE->>API: GET /v2/organizations/:organizationId/credentials/api-keys
    API-->>FE: List of API keys

    alt No API keys available
        U->>FE: Create new API key
        FE->>API: POST /v2/organizations/:organizationId/credentials/api-key/validate
        API-->>FE: Validation result
        FE->>API: POST /v2/organizations/:organizationId/credentials/api-key
        API-->>FE: API key created
    else API keys available
        U->>FE: Select API key (teamId)
    end

    Note over U,ASC: Initialize Publishing
    FE->>API: POST /v2/apps/:appId/submissions/initialize
    API-->>FE: Submission created with submissionId

    Note over U,ASC: Bundle ID Selection Phase
    alt New submission
        FE->>API: GET /v2/apps/:appId/submissions/:submissionId/bundleId
        API->>ASC: Fetch bundle IDs using API key
        ASC-->>API: Bundle ID list
        API-->>FE: Available bundle IDs
        U->>FE: Select bundle ID
        FE->>API: GET /v2/apps/:appId/submissions/:submissionId/bundleId/details?bundleId={selected}
        API->>ASC: Get bundle ID details
        ASC-->>API: Bundle ID details
        API-->>FE: Bundle ID details
    else In-progress submission
        FE->>API: GET /v2/apps/:appId/submissions/:submissionId/bundleId/details?bundleId={stored}
        API->>ASC: Get stored bundle ID details
        ASC-->>API: Bundle ID details
        API-->>FE: Stored bundle ID details
    end

    Note over U,ASC: Certificate Management Phase
    FE->>API: POST /v2/apps/:appId/submissions/:submissionId/check-certificate
    API-->>FE: Certificate status

    alt Certificate invalid or not found
        U->>FE: Choose certificate option
        alt Generate new certificate
            FE->>API: POST /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate
            API->>ASC: Generate distribution certificate
            ASC-->>API: Certificate generated
            API-->>FE: Certificate creation success
        else Upload existing certificate
            U->>FE: Upload certificate files
            FE->>API: PUT /v2/apps/:appId/submissions/:submissionId/ios-app-store/certificate
            API-->>FE: Certificate upload success
        end
    else Certificate valid
        Note over FE: Proceed to next step
    end

    Note over U,ASC: Store Configuration Phase
    U->>FE: Enter store configuration
    FE->>API: PUT /v2/apps/:appId/submissions/:submissionId/metadata (STORE_CONFIG)
    API->>ASC: Validate bundle ID and version
    ASC-->>API: Validation result
    API-->>FE: Store config saved

    Note over U,ASC: App Metadata Phase
    U->>FE: Enter app metadata
    FE->>API: PUT /v2/apps/:appId/submissions/:submissionId/metadata (APP_METADATA)
    API-->>FE: Metadata saved

    Note over U,ASC: Push Notifications (Optional)
    opt Push notifications required
        FE->>API: GET /v1/widget-instances/com.fliplet.push-notifications?appId={appId}
        API-->>FE: Existing push config (if any)

        alt No app config found
            FE->>API: GET /v2/organizations/:organizationId/credentials/ios-push-config/:teamId
            API-->>FE: Team push config (if any)
        end

        alt Configure new push notifications
            U->>FE: Enter push notification details
            FE->>API: PUT /v1/widget-instances/com.fliplet.push-notifications/settings?appId=:appId
            API-->>FE: Push configuration saved
        end
    end

    Note over U,ASC: Build Phase
    U->>FE: Trigger build
    FE->>API: POST /v2/apps/:appId/submissions/:submissionId/build
    API-->>FE: Build triggered

    Note over U,ASC: Monitor Progress
    loop Monitor build status
        FE->>API: GET /v2/apps/:appId/submissions/:submissionId
        API-->>FE: Build status updates
    end
```

## [**Android Publishing Sequence Diagram**](https://www.mermaidchart.com/app/projects/f25a08be-ef1b-4013-bbcf-9aea46f48796/diagrams/9dd0ffc4-6c00-4ee3-a811-de9b13caa81f/share/invite/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb2N1bWVudElEIjoiOWRkMGZmYzQtNmMwMC00ZWUzLWE4MTEtZGU5YjEzY2FhODFmIiwiYWNjZXNzIjoiRWRpdCIsImlhdCI6MTc1NjExNjAzM30.5nwCoQVXVOChgPM5v81xh-YcDkTgUp3KK2RDXPBy8-0)

```
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Fliplet API
    participant S3 as File Storage

    Note over U,S3: Initial Setup Phase
    U->>FE: Start Android Publishing
    FE->>API: GET /v2/apps/:appId/submissions/latest?platform=android
    API-->>FE: Submission state response

    alt No submission or completed submission
        Note over FE: Create new submission flow
    else Existing incomplete submission
        Note over FE: Continue existing submission flow
    end

    Note over U,S3: Initialize Publishing
    FE->>API: POST /v2/apps/:appId/submissions/initialize
    API-->>FE: Submission created with submissionId

    Note over U,S3: Store Configuration Phase
    U->>FE: Enter store configuration
    FE->>API: PUT /v2/apps/:appId/submissions/:submissionId/metadata (STORE_CONFIG)
    API-->>FE: Store config saved

    Note over U,S3: App Metadata Phase
    U->>FE: Enter app metadata
    FE->>API: PUT /v2/apps/:appId/submissions/:submissionId/metadata (APP_METADATA)
    API-->>FE: Metadata saved

    Note over U,S3: Keystore Upload (Optional)
    opt Custom keystore required
        U->>FE: Upload keystore file
        FE->>API: POST /v1/media/files?appId={appId}&name={fileName}
        API->>S3: Store keystore file
        S3-->>API: File stored
        API-->>FE: File object returned

        U->>FE: Enter keystore password
        FE->>API: PUT /v2/apps/:appId/submissions/:submissionId/keystore
        API->>S3: Download and validate keystore
        S3-->>API: Keystore file
        API-->>FE: Keystore validation success
    end

    Note over U,S3: Push Notifications (Optional)
    opt Push notifications required
        FE->>API: GET /v1/widget-instances/com.fliplet.push-notifications?appId={appId}
        API-->>FE: Existing push config (if any)

        alt Configure new push notifications
            U->>FE: Upload google-services.json
            FE->>API: POST /v1/media/files?appId={appId}&name=google-services.json
            API->>S3: Store Firebase config file
            S3-->>API: File stored
            API-->>FE: Firebase file object

            U->>FE: Enter service account details
            Note over FE: Extract client_email, private_key, project_id from service account JSON

            FE->>API: PUT /v1/widget-instances/com.fliplet.push-notifications/settings?appId=:appId
            API-->>FE: Push configuration saved

            FE->>API: PUT /v2/apps/:appId/submissions/:submissionId/metadata (PUSH_CONFIG)
            API-->>FE: Firebase config linked to submission
        end
    end

    Note over U,S3: Build Phase
    U->>FE: Trigger build
    FE->>API: POST /v2/apps/:appId/submissions/:submissionId/build
    API-->>FE: Build triggered

    Note over U,S3: Monitor Progress
    loop Monitor build status
        FE->>API: GET /v2/apps/:appId/submissions/:submissionId
        API-->>FE: Build status updates
    end
```

## **Native App Permissions Management Sequence Diagram (Admin Only)**

```
sequenceDiagram
    participant A as Admin User
    participant FE as Frontend (Admin)
    participant API as Fliplet API
    participant Config as Permission Config

    Note over A,Config: Permission Management Flow

    A->>FE: Access app permissions settings
    FE->>API: GET /v2/admin/apps/:appId/submissions/:submissionId/permissions
    API->>Config: Get default permissions for platform
    Config-->>API: Default permission structure
    API->>API: Merge defaults with stored custom changes
    API-->>FE: Complete permission object
    FE->>A: Display current permissions (enable/disable + descriptions for iOS)

    Note over A,Config: Permission Modification

    A->>FE: Modify permission settings
    Note over FE: Validate permission structure

    alt Update permissions
        A->>FE: Save permission changes
        FE->>API: PUT /v2/admin/apps/:appId/submissions/:submissionId/permissions
        API->>Config: Validate against reference permissions
        Config-->>API: Validation result
        API->>API: Compare with defaults and store only changes
        API->>API: Save to app.settings.appPermissions[platform]
        API-->>FE: Permissions updated successfully
        FE->>A: Show success message
    else Reset to defaults
        A->>FE: Reset to default permissions
        FE->>API: PUT /v2/admin/apps/:appId/submissions/:submissionId/permissions/reset
        API->>API: Clear stored custom permissions
        API-->>FE: Permissions reset successfully
        FE->>A: Show reset confirmation
        FE->>API: GET /v2/admin/apps/:appId/submissions/:submissionId/permissions
        API-->>FE: Default permissions
        FE->>A: Display default permissions
    end

    Note over A,Config: Error Handling

    rect rgb(255, 230, 230)
        FE->>API: Invalid permission structure
        API-->>FE: 400 Permission JSON is not valid
        FE->>A: "Invalid permission format. Please check your settings."
    end

    rect rgb(255, 245, 230)
        FE->>API: Missing required permissions
        API-->>FE: 400 Permission JSON is missing fields + requiredFields[]
        FE->>A: "Missing required permissions: [list of missing fields]"
    end

    rect rgb(230, 255, 230)
        FE->>API: Update permissions request
        API-->>FE: 500 Failed to update app permissions
        FE->>A: "Failed to save permissions. Please try again."
    end
```

## **Common Error Handling Flows**

```
sequenceDiagram
    participant FE as Frontend
    participant API as Fliplet API
    participant U as User

    Note over FE,U: Error Handling Patterns

    rect rgb(255, 230, 230)
        Note over FE,U: API Key Errors (iOS)
        FE->>API: API operation
        API-->>FE: 400 MISSING_API_KEY_CONFIGURATION
        FE->>U: "API key configuration missing. Please check your API key setup."
    end

    rect rgb(255, 245, 230)
        Note over FE,U: Certificate Errors (iOS)
        FE->>API: Certificate operation
        API-->>FE: 400 MAX_CERTIFICATES_REACHED
        FE->>U: "Maximum certificates reached. Please revoke unused certificates in App Store Connect and try again."

        FE->>API: Certificate operation
        API-->>FE: 400 INSUFFICIENT_PERMISSIONS
        FE->>U: "API key doesn't have permission to create certificates. Please check API key permissions."

        FE->>API: Certificate operation
        API-->>FE: 400 INVALID_CERTIFICATE
        FE->>U: "Certificate validation failed. Please check your certificate and private key files."
    end

    rect rgb(230, 255, 230)
        Note over FE,U: Build Errors (Both Platforms)
        FE->>API: Build operation
        API-->>FE: 400 MISSING_REQUIRED_METADATA
        FE->>U: "Required fields are missing. Please complete all required sections."

        FE->>API: Build operation
        API-->>FE: 403 Billing Error
        FE->>U: "Your current plan does not allow publishing this type of app. Please upgrade your plan."

        FE->>API: Build operation
        API-->>FE: 400 INVALID_BUILD_STATUS
        FE->>U: "You need to publish this app first. Go to 'Step 1. Prepare your app' to publish your app."
    end

    rect rgb(230, 230, 255)
        Note over FE,U: Keystore Errors (Android)
        FE->>API: Keystore operation
        API-->>FE: 400 INVALID_KEYSTORE
        FE->>U: "Invalid keystore file or incorrect password. Please check your keystore file and password."

        FE->>API: Keystore operation
        API-->>FE: 400 DOWNLOAD_ERROR
        FE->>U: "Failed to download keystore file. Please try uploading again."
    end
```