---
header: GitHub
layout: resources
toc: true
show_toc: 2
description: GitHub
---

## Prerequisites

* Use the predefined Trusted Build System _GitHub.com_ (see [configuration](/trusted-build-systems#configuration))
  *  add it to the Organization
  *  link it to each SignPath Project for GitHub
* Required for [source code and build policies](#define-policies-for-source-code-and-builds): Install the [SignPath GitHub App](https://github.com/apps/signpath) and allow access to the code repositories.

{:.panel.info}
> **GitHub Enterprise Server**
>
> SignPath hosts an instance of the GitHub connector which is linked to GitHub.com For integrating self-hosted GitHub Enterprise Server instances, contact our [support](https://signpath.io/support) team.

## Checks performed by SignPath

The GitHub connector performs the following checks:

* A build was actually performed by a GitHub workflow, not by some other entity in possession of the API token
* [Origin metadata](/origin-verification) is provided by GitHub, not the build script, and can therefore not be forged
* The artifact is stored as a GitHub workflow artifact before it is submitted for signing
* For OSS projects: All jobs of the GitHub worfklow leading up to the signing request were executed on GitHub-hosted agents

## Usage

We provide a [`submit-signing-request` action](https://github.com/SignPath/github-action-submit-signing-request) that can be integrated into a GitHub Actions workflow:

{% raw %}
```yaml
steps:
  # required for the artifact to be available on the GitHub server
- name: upload unsigned artifact
  id: upload-unsigned-artifact
  uses: actions/upload-artifact@v7
  with: 
    path: path/to/your/artifact
    
- name: submit signing request
  uses: signpath/github-action-submit-signing-request@v2
  with:
    api-token: '${{ secrets.SIGNPATH_API_TOKEN }}'
    organization-id: '<SignPath organization id>'
    project-slug: '<SignPath project slug>'
    signing-policy-slug: '<SignPath signing policy slug>'
    github-artifact-id: '${{ steps.upload-unsigned-artifact.outputs.artifact-id }}'
    wait-for-completion: true
    output-artifact-directory: '/path/to/signed/artifact/directory'
    parameters: |
      version: ${{ toJSON(some.userinput) }}
      myparam: "another param"
```
{% endraw %}

{:.panel.info}
> **ZIP archives**
>
> By default, the `upload-artifact` action creates a ZIP archive, which requires the root element of your [Artifact Configurations](/artifact-configuration) to be of type `<zip-file>`.
> If you want to specify your artifact type directly, specify `archive: false` in the `upload-artifact` action. See [Usage](#usage).
>
> <i class='la la-exclamation-triangle'></i> Note that there is an open bug in GitHub's `upload-artifact` action where the `name` parameter is ignored and the action fails if another artifact with the same filename has already been uploaded. See issues [#769](https://github.com/actions/upload-artifact/issues/769) and [#785](https://github.com/actions/upload-artifact/issues/785).

{:.panel.info}
> **Workflow permissions**
>
> If _all_ of the following conditions apply, the required permissions have to be enabled in the workflow definition:
> 
>  * the the GitHub repository is private
>  * the workflow permissions are set to the default "Read repository contents and packages permissions"
>  * The SignPath GitHub App is _not_ installed
>
> You can use the following snippet:
> ```
>   permissions:
>      actions: read
>      contents: read
> ```

### Action input parameters

{% raw %}
| Parameter                                     | Default Value                                  | Description 
|-----------------------------------------------|------------------------------------------------|-------------
| `connector-url`                               | `https://githubactions.connectors.signpath.io` | The URL of the SignPath connector. Required if self-hosted.
| `api-token`                                   | (mandatory)                                    | The _Api Token_ for a user with submitter permissions in the specified project/signing policy.
| `organization-id`                             | (mandatory)                                    | The SignPath organization ID.
| `project-slug`                                | (mandatory)                                    | The SignPath project slug.
| `signing-policy-slug`                         | (mandatory)                                    | The SignPath signing policy slug.
| `artifact-configuration-slug`                 | default artifact configuration                 | The SignPath artifact configuration slug.
| `github-artifact-id`                          | (mandatory)                                    | ID of the Github Actions artifact. Must be uploaded using the [actions/upload-artifact] v4+ action before it can be signed. Use `${{ steps.<step-id>.outputs.artifact-id }}` from the preceding actions/upload-artifact action step.
| `wait-for-completion`                         | `true`                                         | Wait for the signing request to complete.
| `output-artifact-directory`                   |                                                | Path to where the signed artifact will be extracted. If not specified, the task will not download the signed artifact from SignPath.
| `github-token`                                | [`secrets.GITHUB_TOKEN`][token-auth]           | GitHub access token for reading job details and downloading the artifact. Requires the `action:read` and `content:read` permissions.
| `wait-for-completion-timeout-in-seconds`      | `600`                                          | Maximum time in seconds that the action will wait for the signing request to complete.
| `service-unavailable-timeout-in-seconds`      | `600`                                          | Total time in seconds that the action will wait for a single service call to succeed (across several retries).
| `download-signed-artifact-timeout-in-seconds` | `300`                                          | HTTP timeout when downloading the signed artifact.
| `parameters`                                  |                                                | Multiline-string of values that map to [user-defined parameters] in the Artifact Configuration. Use one line per parameter with the format `<name>: "<value>"` where `<value>` needs to be a valid JSON string.
| `skip-decompress`                             | `false`                                        | Set to `true` if the `archive` parameter in the `upload-artifact` action is set to `true` (i.e. the artifact is not stored as a ZIP archive)
{:.break-code}
{% endraw %}

[token-auth]: https://docs.github.com/en/actions/security-guides/automatic-token-authentication
[actions/upload-artifact]: https://github.com/actions/upload-artifact
[user-defined parameters]: /artifact-configuration/syntax#parameters

### Action output parameters

The action supports the following output parameters:
- `signing-request-id`: ID of the newly created signing request
- `signing-request-web-url`: URL of the signing request in SignPath
- `signed-artifact-download-url`: download URL of the signed artifact

## Policies

{% include editions.md feature="pipeline_integrity.extended_policies" %}

You can define pipeline policies <!-- TODO: link --> that restrict source code and build settings.

Steps to create a policy file:

* create the policy file in the `default` branch of the source code repository
* name it `.signpath/policies/<project-slug>/<signing-policy-slug>.yml` 
* restrict write permissions to the policy files using GitHub's [code owners] feature

There are separate policy sections for GitHub's CI sytem, [GitHub Actions](#github-actions-policies) and [GitHub's source code management system](#github-scm-policies).

### Example

```yaml
github-actions-policies:
  disallow_reruns: false
  runners:
    require_github_hosted: true
    allowed_groups:
      - Hardened Runners

github-scm-policies:
  ruleset_constraints:
  - enforced_from: 2025-01-01
    allow_bypass_actors: true
    rules:
    - type: non_fast_forward
    - type: pull_request
      parameters:
        required_approving_review_count: 2
        require_last_push_approval: true
```


### `github-actions-policies`

Allows to restrict the GitHub Actions build with the following policies:

| Top-Level Policy  | Description 
|-------------------|-------------------------
| `disallow_reruns` | Set to `true` to prevent signing builds from re-runs. By enforcing this policy, old, temporarily failed builds cannot be re-run and signed under the false impression that they include recent changes, such as vulnerability fixes. These builds would still be identified by their branch name, e.g. `main`.
| `runners`         | Runner-specific settings, see table below.

#### `runners` section

| Policy                   | Description
|--------------------------|-------------------
| `required_github_hosted` | Set to `true` to ensure that all jobs of the workflow are executed on Github-hosted runners.
| `alllowed_groups`        | Provide a list of GitHub runner group names. Ensures that all jobs of the workflow are executed on runners from one of the listed groups.

### `github-scm-policies`

Allows to define `ruleset_constraints` for [GitHub branch rulesets]. All specified constraints must be covered by one or multiple active branch rulesets defined in GitHub. Multiple `ruleset_constraints` with different parameters can be defined.

#### General parameters for `ruleset_constraints`

| Parameter               | Values                         | Description
|-------------------------|--------------------------------|----------------------------
| `allow_bypass_actors`   | boolean                        | If `true`, the branch ruleset is allowed to define bypassers 
| `enforced_from`         | None, timestamp, or `EARLIEST` | By default, the constraints are only evaluated at the time of signing. When `enforced_from` is set, the constraints must have been continously fulfilled from the specified date (YAML ISO timestamp) or earliest availability of audit log entries (`EARLIEST`). 

{:.panel.info}
> **About `enforced_from` evaluation**
> 
> Depending on your GitHub subscription, the continuous enforcement of policies is either based on:
>
> * **Audit log events** for _GitHub Enterprise_ subscriptions. Audit log events are only available for the last 180 days, any prior policy violations will not be detected.
> * The **last modified date** of the branch rulesets for all other subscriptions. At least one branch ruleset that has not been modified since the specified timestap must implement the rule.

TODO: better explain relation between GitHub branch rulesets and ruleset constraints

#### Supported rules

The following rules are supported:

{%- include render-github-policies.html schema=site.data.pipeline-policy-schemas.github -%}

TODO: What does the `policy_type: array` mean (e.g. for code scanning tool)
TODO: Provide sample values for integers and strings? (e.g. not `value`)
TODO: Why are all the pull request parameters required?
TODO: Explain min/max

[code owners]: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
[GitHub branch rulesets]: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets
