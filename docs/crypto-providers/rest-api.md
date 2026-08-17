---
header: REST API
layout: resources
toc: true
show_toc: 3
description: Direct usage of the REST API for hash signing
datasource: tables/crypto-providers
---

## Overview

Signing requests to [hash signing data](/crypto-providers#signpath-project-configuration) projects can be performed directly via SignPath's REST API.

See [HTTP REST API](/build-system-integration#rest-api) for basic API instructions.

## `SignHash` REST endpoint

To sign a single hash code, use the `SignHash` endpoint. It accepts the hash data in the JSON body and returns the result immediately.

| Synopsis                    |
|-----------------------------|----------------
| URL                         | `/SigningRequests/SignHash`
| Method                      | `POST`
| Encoding                    | `application/json` 

### Request fields

| JSON property               | Description
|-----------------------------|------------------
| `projectSlug`               | The project for which you want to create the signing request
| `signingPolicySlug`         | Signing policy for which you want to create the signing request
| `artifactConfigurationSlug` | Optional: artifact configuration to use for the signing request (default if not specified)
| `description`               | Optional: description for your signing request (e.g. version number)
| `hashSigningData`           | Hash data to sign and metadata (see below)

**`hashSigningData` properties:**

{%- include render-table.html table=site.data.tables.crypto-providers.hashSigningData-format -%}

This endpoint creates an artifact with the file name `HashSigningData.json`.

### Response fields

| JSON property                 | Description
|-------------------------------|------------------
| `signingRequestid`            | ID of the signing request
| `webLink`                     | Link to the UI form for the signing request
| `hashSigningData.hash`        | Input hash
| `hashSigningResult.signature` | Base64-encoded signature block (format and length according to the key type used for signing)

### Example 

#### Request

~~~ bash
curl -X POST https://app.signpath.io/API/v1/$ORGANIZATION_ID/SigningRequests/SignHash \
     -H "Authorization: Bearer $API_TOKEN" \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{
        "projectSlug": "hash-signing",
        "signingPolicySlug": "test-signing",
        "hashSigningData": {
            "signatureAlgorithm": "Rsa",
            "rsaOptions": {
                "hashAlgorithmName": "Sha256", 
                "paddingMode": "Pkcs1"
            },
            "hash": "ZOyIygCyaOW6GjVnihtTFtIS9PNmskdyMlNKiuyjfzw=",
            "metadata": {
                "sourceProcess": { "commandLine": "SampleCommand -SampleArgument", "user": "SampleUser" }
            }
        }
     }'
~~~

#### Response

~~~ json
{
    "signingRequestId": "01486688-aa8b-44f3-9d15-071412df043f",
    "webLink": "https://app.signpath.io/Web/[...]/SigningRequests/01486688-aa8b-44f3-9d15-071412df043f",
    "hashSigningData": {
        "hash": "ZOyIygCyaOW6GjVnihtTFtIS9PNmskdyMlNKiuyjfzw="
    },
    "hashSigningResult": {
        "signature": "wGI2oiHHVSVGHR1rtjv83Pir1SEVLmnLNGuJD4..."
    }
}
~~~

# Retrieve Signing Policy details {#retrieve-signing-policy-details}

Use `GET {{site.sp_api_url}}/v1/$OrganizationId/Cryptoki/MySigningPolicies?``projectSlug=$Project&signingPolicySlug=$SigningPolicy` to get information about the signing policy, including the X.509 certificate and RSA key parameters.

(If project and signing policy are not specified, this API returns all signing policies where user identified by the API token is assigned as _Submitter_.)

**Example response:**

~~~ json
{
    "signingPolicies": [
        {
            "signingPolicySlug": "test-signing",
            "projectSlug": "hash-signing-test",
            "keySizeInBits": 2048,
            "rsaParameters": {
                "publicExponent": "AQAB",
                "modulus": "2e4JTm..."
            },
            "signingPolicyId": "eacd4b78-6038-4450-9eec-4acd1c7ba6f1",
            "certificateBytes": "MIIC5zCC...",
            "keyType": "Rsa",
            "publicKeyBytes": "MIIBCgKC..."
        }
    ]
}
~~~~