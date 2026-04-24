---
header: GitLab
layout: resources
toc: true
show_toc: 3
description: GitLab
---

## Prerequisites

* Use the predefined Trusted Build System _GitLab.com_ (see [configuration](/documentation/trusted-build-systems#configuration))
  *  add it to the Organization
  *  link it to each SignPath Project for GitLab

{:.panel.info}
> **Self-managed installations**
>
> SignPath hosts an instance of the GitLab connector which is linked to GitLab.com For integrating self-managed GitLab instances, contact our [support](https://signpath.io/support) team.

## Checks performed by SignPath

The GitLab connector performs the following checks:

* The artifact was built by a GitLab Pipeline, not by some other entity in possession of the API token
* [Origin metadata](/documentation/origin-verification) is provided by GitLab, not the build script, and can therefore not be forged
* The artifact is stored as a GitLab pipeline artifact before it is submitted for signing

## Usage

We provide a `submit-signing-request` component that can be integrated into a GitLab Pipeline:

```yaml
include:
  - component: gitlab.com/signpath-test-root/components/submit-signing-request@0.1.0
    inputs:
      stage: sign
      job_name: sign_my_component_a
      api_token_var_name: SIGNPATH_MY_COMPONENT_A_API_TOKEN
      gitlab_access_token_var_name: SIGNPATH_GITLAB_ACCESS_TOKEN
      organization_id: f437cdbb-2ec0-4958-9a85-c2c0cd5dfa1a
      project_slug: MyComponentA
      signing_policy_slug: release-signing
      gitlab_artifact_job_name: build_job
      gitlab_artifact_path: output/my-executable
      output_artifact_path: output/my-signed-executable
      parameters:
        - myparam: myvalue

stages:
  - build
  - sign

build_job:
  stage: build
  script:
    - echo "Building some software..."
  artifacts:
    paths:
    - output/my-signed-executable
```

See the [parameter list](#supported-parameters) for a complete list of all supported inputs. 

{:.panel.info}
> **Signing multiple files**
>
> If you want to sign multiple files in a single signing request, you have to create and publish a dedicated ZIP archive in your build step and modify your artifact configuration on SignPath accordingly.

### Setups that don't include _Docker Executors_

For all organizations that don't support _Docker Executors_, we provide a CLI tool can be directly invoked. Please contact our [support team](https://signpath.io/support) for details.

## Supported parameters

| Input                                         | Default Value                           | Description 
|-----------------------------------------------|-----------------------------------------|---------------------------
| `stage`                                       | `sign`                                  | The GitLab pipeline stage at which the component should be executed.
| `job_name`                                    | `submit-signing-request`                | The name of the given signing job.
| `connector_url`                               | `https://gitlab.connectors.signpath.io` | The URL of the SignPath connector. Required if self-managed.
| `api_token_var_name`                          | `SIGNPATH_API_TOKEN`                    | The _Api Token_ for a user with submitter permissions in the specified project/signing policy. The component only allows providing the token via an environment variable. The name of the environment variable can be overwritten using this input.
| `gitlab_access_token_var_name`                | `SIGNPATH_GITLAB_ACCESS_TOKEN`          | The _GitLab Access Token_ that is used to retrieve [origin metadata](/documentation/origin-verification) from the GitLab instance. Requires the `read_api` scope. The component only allows providing the token via an environment variable. The name of the environment variable can be overwritten using this input.
| `organization_id`                             | (mandatory)                             | The SignPath organization ID.
| `project_slug`                                | (mandatory)                             | The SignPath project slug.
| `signing_policy_slug`                         | (mandatory)                             | The SignPath signing policy slug.
| `artifact_configuration_slug`                 |                                         | The SignPath artifact configuration slug.
| `gitlab_artifact_job_name`                    | (mandatory)                             | The name of the job that published the artifact to be signed.
| `gitlab_artifact_path`                        | (mandatory)                             | The path within the GitLab artifact.
| `output_artifact_path`                        |                                         | Path to where the signed artifact will be stored. If not specified, the task will not download the signed artifact from SignPath.
| `wait_for_completion`                         | `true`                                  | Wait for the signing request to complete. If set to true, the signed artifact will be published.
| `parameters`                                  |                                         | List of key/value pairs that map to [user-defined parameters](/artifact-configuration/syntax#parameters) in the Artifact Configuration.
| `wait_for_completion_timeout_in_seconds`      | `600`                                   | Maximum time in seconds that the job/tool will wait for the signing request to complete.
| `service_unavailable_timeout_in_seconds`      | `600`                                   | Total time in seconds that the job/tool will wait for a single service call to succeed (across several retries).
| `download_signed_artifact_timeout_in_seconds` | `300`                                   | HTTP timeout when downloading the signed artifact.

[user-defined parameters]: /documentation/artifact-configuration/syntax#parameters

## Environment variables for subsequent jobs

The component invocation will publish a dotenv report and make the following environment variables available in subsequent jobs:

* `${PREFIX}_SIGNPATH_SIGNING_REQUEST_ID`: The id of the newly created signing request.
* `${PREFIX}_SIGNPATH_SIGNING_REQUEST_WEB_URL`: The url of the signing request in SignPath.
* `${PREFIX}_SIGNPATH_SIGNED_ARTIFACT_DOWNLOAD_URL`: The url where the signed artifact can be downloaded.

`${PREFIX}` defaults to the capitalized name of the signing job in GitLab (`SIGN` by default).

