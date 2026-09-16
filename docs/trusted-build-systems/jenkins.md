---
header: Jenkins Plugin
layout: resources
toc: true
show_toc: 2
description: Jenkins Plugin
---

## Prerequisites

* The Jenkins plugin has been installed on the respective Jenkins instance (Jenkins 2.359 or higher are supported).
* A Pipeline Connector instance ([Contact our support team](https://signpath.io/support) for details) is configured to reach the Jenkins server.
* The following plugins are installed on the Jenkins server: 
  * [Credentials binding](https://plugins.jenkins.io/credentials-binding/)
  * [Git](https://plugins.jenkins.io/git/)
  * [Pipeline (Workflow aggregator)](https://plugins.jenkins.io/workflow-aggregator/)

## Performed checks

SignPath ensures that
* A build was actually performed by a specific Jenkins CI instance, not by some other entity in possession of the API token
* [Origin metadata](/origin-verification) is provided by Jenkins CI, not the build script, and can therefore not be forged
* The artifact originated from the Jenkins build

## Installation

See the [official plugin page](https://plugins.jenkins.io/signpath/) on how the plugin can be installed.

### Configuration

* In the _Code Signing with SignPath_ section of the System settings, set the _Connector URL_ and _Endpoint Slug_ of the installed Pipeline Connector and optionally define a default organization ID.
* The _Api Token_ of a SignPath user with submitter permissions needs to be available to the build pipelines of the respective projects.

## Usage

### Provided steps

Include the `submitSigningRequest` and optionally, the `getSignedArtifact` steps in your build pipeline.

#### General parameters

| Parameter                                  | Default Value                             | Description 
|--------------------------------------------|-------------------------------------------|--------------
| `apiTokenCredentialId`                     | `SignPath.ApiToken`                       | ID of the credential containing the **API Token**. Recommended in scope "Global".
| `trustedBuildSytemTokenCredentialId`       | Configured in global plugin configuration | ID of the credential containing the **Trusted Build System Token**. Needs to be in scope "System".
| `serviceUnavailableTimeoutInSeconds`       | `600`                                     | Total time in seconds that the step will wait for a single service call to succeed (across several retries).
| `uploadAndDownloadRequestTimeoutInSeconds` | `300`                                     | HTTP timeout used for upload and download HTTP requests. Defaults to 300.
| `waitForCompletionTimeoutInSeconds`        | `600`                                     | Maximum time in seconds that the step will wait for the signing request to complete.

#### Parameters for the `submitSigningRequest` step

| Parameter                    | Default Value                             | Description
|------------------------------|-------------------------------------------|---------------
| `organizationId`             | Configured in global plugin configuration | ID of the SignPath organization
| `projectSlug`                | (mandatory)                               | Slug of the SignPath project 
| `signingPolicySlug`          | (mandatory)                               | Slug of the SignPath signing policy
| `artifactConfigurationSlug`  |                                           | SignPath artifact configuration slug. If not specified, the default is used.
| `inputArtifactPath`          | (mandatory)                               | Relative path of the artifact to be signed
| `outputArtifactPath`         |                                           | Relative path where the signed artifact is stored after signing
| `waitForCompletion`          | (mandatory)                               | Set to `true` for synchronous and `false` for asynchronous signing requests
| `parameters`                 |                                           | [User-defined parameters](/artifact-configuration/syntax#parameters) as `Map<String, String>` key/value pairs
| `inputArtifactRetrievalUrl`  |                                           | Can be used to retrieve the unsigned artifact from a HTTPS URL instead of uploading it from the agent. _Note: To ensure that the artifact is part of the build process, the `inputArtifactPath` must also be specified and reference the same file (same SHA256 hash). The HTTPS URL needs to be reachable from the SignPath installation._
| `inputArtifactRetrievalHttpHeaders` |                                    | HTTP headers used for retrieving the artifact, as `Map<String, String>` key/value pairs.

#### Parameters for the `getSignedArtifact` step

| Parameter                    | Default Value                             | Description
|------------------------------|-------------------------------------------|--------------
| `organizationId`             | Configured in global plugin configuration | ID of the SignPath organization
| `signingRequestId`           | (mandatory)                               | ID of the signing request (is returned by the `submitSigningRequest` step)
| `outputArtifactPath`         | (mandatory)                               | Relative path where the signed artifact is stored after signing

### Examples

#### Example: Submit a synchronous signing request

```scala
stage('Sign with SignPath') {
  steps {
    submitSigningRequest(
      projectSlug: "${PROJECT_SLUG}",
      signingPolicySlug: "${SIGNING_POLICY_SLUG}",
      artifactConfigurationSlug: "${ARTIFACT_CONFIGURATION_SLUG}",
      inputArtifactPath: "build-output/my-artifact.exe",
      outputArtifactPath: "build-output/my-artifact.signed.exe",
      waitForCompletion: true
    )
  }
}
```

#### Example: Submit an asynchronous signing request with parameters

```scala
stage('Sign with SignPath') {
  steps {
    script {
      signingRequestId = submitSigningRequest(
        projectSlug: "${PROJECT_SLUG}",
        signingPolicySlug: "${SIGNING_POLICY_SLUG}",
        artifactConfigurationSlug: "${ARTIFACT_CONFIGURATION_SLUG}",
        inputArtifactPath: "build-output/my-artifact.exe",
        outputArtifactPath: "build-output/my-artifact.signed.exe",
        waitForCompletion: false,
        parameters: [
          "version": "1.0",
          "my-param": "another param"
        ]
      )
    }
  }
}
stage('Download Signed Artifact') {
  input {
    id "WaitForSigningRequestCompleted"
    message "Has the signing request completed?"
  }
  steps{
    getSignedArtifact( 
      signingRequestId: "${signingRequestId}",
      outputArtifactPath: "build-output/my-artifact.exe"
    )
  }
}
```

#### Example: Submit a signing request, but download the unsigned artifact from a HTTPS URL

```scala
stage('Sign with SignPath') {
  steps {
    submitSigningRequest(
      projectSlug: "${PROJECT_SLUG}",
      signingPolicySlug: "${SIGNING_POLICY_SLUG}",
      artifactConfigurationSlug: "${ARTIFACT_CONFIGURATION_SLUG}",
      inputArtifactPath: "build-output/my-artifact.exe",
      outputArtifactPath: "build-output/my-artifact.signed.exe",
      waitForCompletion: true,
      inputArtifactRetrievalUrl: "https://my.download.share.com/my-artifact.exe",
      inputArtifactRetrievalHttpHeaders: [
        "Authorization": "Bearer mysupersecretauth"
      ]
    )
  }
}
```
