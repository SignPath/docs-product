---
header: REST APIs
layout: resources
toc: true
show_toc: 3
description: Documentation of SignPath REST API
---

## HTTP REST API {#rest-api}

The SignPath REST API provides endpoints for the following features:

* submit and retreive signing requests 
* access the audit log
* query and change configuration data, such as projects, certificates or users

Use either a dedicated CI user or create an API token for your interactive user account. All APIs enforce the same restrictions as interactive access.

### OpenAPI specification

You can find the full API specification at [https://app.signpath.io/api/swagger/index.html](https://app.signpath.io/api/swagger/index.html). 

The OpenAPI specification is available in JSON format at [https://app.signpath.io/api/swagger/v1/swagger.json](https://app.signpath.io/api/swagger/v1/swagger.json).

### Base URL and authentication

SignPath uses bearer authentication.

| Common API arguments      | Value
|---------------------------|-------------------------------------------- 
| Base URL                  | `{{site.sp_api_url}}/v1/$(OrganizationId)`
| Authorization HTTP header | `Authorization: Bearer $(token)`

You need to provide these values for every single API request.

## Submitting signing requests and  retreiving artifcats

The follwing sections provide additional details for APIs to submit and retreive signing requests.

### Submit a signing request

| Synopsis                    |
|-----------------------------|------
| URL                         | `/SigningRequests/SubmitWithArtifact`
| Method                      | `POST`
| Encoding                    | `multipart/form-data`

| Field name                  | Description
|-----------------------------|------------------
| `projectSlug`               | The project for which you want to create the signing request
| `signingPolicySlug`         | Signing policy for which you want to create the signing request
| `artifactConfigurationSlug` | Optional: artifact configuration to use for the signing request (default if not specified)
| `artifact`                  | Artifact file
| `description`               | Optional: description for your signing request (e.g. version number)

**Example:**

~~~ bash
curl -H "Authorization: Bearer $API_TOKEN" \
     -F "projectSlug=$PROJECT" \
     -F "signingPolicySlug=test-signing" \
     -F "artifactConfigurationSlug=v2.4" \
     -F "artifact=@$PATH_TO_ARTIFACT" \
     -F "description=$DESCRIPTION" \
     https://app.signpath.io/API/v1/$ORGANIZATION_ID/SigningRequests/SubmitWithArtifact
~~~

**Success result:** HTTP status code `201`. A HTTP `Location` response-header field is returned with the URL of the created entity.

#### User-defined parameters

{% include editions.md feature="artifact_configuration.user_defined_parameters" %}

Values for [user-defined parameters](/artifact-configuration/syntax#parameters) in the artifact configuration can be provided by adding another multipart/form-data field prefixed with `parameters.`

Example: `-F "parameters.productVersion=1.2.0"`

### Get signing request data

| Synopsis   |
|------------|----------
| URL        | `/SigningRequests/$(SigningRequestId)` <br> (`Location` response-header from the call that submitted the signing request)
| Method     | GET
| Parameters | none

**Example:**

~~~ bash
curl -H "Authorization: Bearer $API_TOKEN" \
     https://app.signpath.io/API/v1/$ORGANIZATION_ID/SigningRequests/$SIGNING_REQUEST_ID
~~~

**Success result:** HTTP status code `200`. Signing request data in JSON format:

~~~ json
{
  "status":"Completed",
  "isFinalStatus":true,
  "workflowStatus":"Completed",
  "description":"Called by cURL",
  "projectId":"c90eb2c7-d34e-49fc-9e90-c00235ecaf1a",
  "projectSlug":"test-project",
  "projectName":"Test project",
  "artifactConfigurationId":"24b767a6-092f-4104-869d-25f0da159576",
  "artifactConfigurationSlug":"Default",
  "artifactConfigurationName":"Default",
  "signingPolicyId":"137ada35-fc11-4719-a3a4-269983692197",
  "signingPolicySlug":"test-signing",
  "signingPolicyName":"test-signing",
  "unsignedArtifactLink":"https://app.signpath.io/API/v1/c2099ac1-b4b5-4b30-934e-3933c2d9922d/SigningRequests/a4559e13-9e95-480a-9567-5b8a3252bb27/UnsignedArtifact",
  "signedArtifactLink":"https://app.signpath.io1/API/v1/c2099ac1-b4b5-4b30-934e-3933c2d9922d/SigningRequests/a4559e13-9e95-480a-9567-5b8a3252bb27/SignedArtifact",
  "origin": {
    "buildData": {
      "buildSettingsFile": {
        "downloadLink": "https://app.signpath.io/API/v1/c2099ac1-b4b5-4b30-934e-3933c2d9922d/SigningRequests//a4559e13-9e95-480a-9567-5b8a3252bb27/BuildSettingsFile",
        "fileName": "AppVeyorSettings.json"
      },
      "url": "https://ci.appveyor.com/project/TestUser/Test-Project/builds/12345678/job/03rba4p8tlr2t4f7"
    },
    "repositoryData": {
      "url": "https://github.com/name/project",
      "branchName": "main",
      "commitId": "efe8bbc00c5484bfd38ce13a749ea2103a8ea713",
      "sourceControlManagementType": "git"
    }
  },
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  }
}
~~~

* **Available `status` values:** `InProgress`, `WaitingForApproval`, `Completed`, `Failed`, `Denied`, `Canceled`
* **Available `workflowStatus` values:** `Submitted`, `RetrievingArtifact`, `WaitingForApproval`, `QueuedForMalwareScanning`, `ScanningForMalware`, `QueuedForProcessing`, `Processing`, `Completed`, `ProcessingFailed`, `MalwareScanFailed`, `MalwareDetected`, `ArtifactRetrievalFailed`, `Denied`, `Canceled` 
* `origin` is only available for signing requests with origin verification

### Download the signed artifact

Once the signing request is successfully completed, the status response contains a `signedArtifactLink` field with a link to the signed artifact file. It can easily be retrieved by issuing the following command:

| Synopsis   |      
|------------|------
| URL        | `/SigningRequests/$(SigningRequestId)/SignedArtifact` <br> (`signedArtifactLink` field from `GET SigningRequests/`id)
| Method     | GET  
| Parameters | none

**Example:**

~~~ bash
curl -H "Authorization: Bearer $API_TOKEN" \
     -o $LOCAL_PATH_TO_DOWNLOADED_ARTIFACT \
     https://app.signpath.io/API/v1/$ORGANIZATION_ID/SigningRequests/$SIGNING_REQUEST_ID/SignedArtifact
~~~

**Success result:** HTTP status code `200`. Returns the binary content of the signed artifact.

### Resubmit a signing request

See [Resubmit an existing signing request](/signing-code#resubmit) for more information.

| Synopsis                    | 
|-----------------------------|--------------------------
| URL                         | `/SigningRequests/Resubmit`
| Method                      | `POST`
| Encoding                    | `multipart/form-data`
| `originalSigningRequestId`  | ID of the signing request which you want to resubmit
| `signingPolicySlug`         | Signing policy for which you want to create the signing request
| `description`               | Optional: description for your signing request (e.g. version number)

**Example:**

~~~ bash
curl -H "Authorization: Bearer $API_TOKEN" \
     -F "originalSigningRequestId=$ORIGINAL_SIGNING_REQUEST_ID" \
     -F "signingPolicySlug=release-signing" \
     -F "description=$DESCRIPTION" \
     https://app.signpath.io/API/v1/$ORGANIZATION_ID/SigningRequests/Resubmit
~~~

**Success result:** HTTP status code `201`. A HTTP `Location` response-header field is returned with the URL of the created entity.

