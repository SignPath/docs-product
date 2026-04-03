---
header: SLSA Build Levels
layout: resources
toc: true
show_toc: 3
description: Describes SignPath SLSA build levels
---

## SLSA attestations by SignPath

This page contains the definitions for SignPath build types and builders for SLSA provenance files.

SignPath creates SLSA attestation in three distinct steps:

1. SignPath Pipeline Integrity gathers and verifies relevant information from a supported _origin_ CI/CD system 
2. SignPath DeepSign creates SLSA provenance build based on that information (along with other code signing operations)
3. SignPath Attest signs the provenance 

{:.panel.info} 
> **Attestation trust explained**
>
> In order to be able to trust an attestation issued by SignPath, clients need to:
> 
> * Verify the signature on the attestation: it must be signed by an official SignPath certificate
> * Trust SignPath to evaluate the attested properties 
>   * SignPath evaluates and continuously monitors the services and APIs it uses from supported CI/CD systems. We do extensive research based on official vendor documentation and perform our own tests to ensure that attested properties reflect the actual configuration and build execution. 
> * Trust all hosted CI/CD system supported by SignPath or verify that the _origin_ system is one that you trust.
>   * SignPath cannot guarantee that the CI/CD system is actually operated in a safe way and safe from manipulation.
> 
> Clients do _not_ need to trust the publisher for these security properties, as they are evaluated on the _control plane_ without relying on the provider's configuration. However, SignPath can only make technical evaluations and enforce technical policies. The quality of the source code (including build scripts) and code reviews is still up to the publisher.
> 
> SignPath cannot attest builds from customer-operated CI/CD systems. However, SignPath provides features for customers to self-attest builds from centrally operated CI/CD systems for individual teams.

## Build type and builder identifier

SignPath identifies build types and builders using the following URIs:

| Provenance field | URI format                                                                             | Example
|------------------|----------------------------------------------------------------------------------------|-----------
| `buildType`      | `https://docs.signpath.io/specs/slsa/buildtypes/$origin/v1`                            | `https://docs.signpath.io/specs/slsa/buildtypes/github/v1`
| `builder.id`     | `https://docs.signpath.io/specs/slsa/builder/$origin/$buildLevel/slsa-$slsaVersion/v1` | `https://docs.signpath.io/specs/slsa/builder/github/build-l3/slsa-1.1/v1`

The following parameters are used for these URIs:

| Parameter       | Values
|-----------------|---------------
| `$origin`       | Origin CI/CD system (see next table)
| `$buildLevel`   | `build-l1` - `build-l3` for SLSA levels Build L1 - L3
| `$slsaVersion`  | Version of the SLSA specification, currently ´1.1´

| Supported hosted CI/CD systems | `$origin` value  | Supported SLSA Build levels 
|--------------------------------|------------------|-----------------------------
| [GitHub Actions]               | `github`         | Build L1 - L3
| [Azure DevOps]                 | `azure-devops`   | Build L1 - L3
| [GitLab CI/CD]                 | `gitlab`         | Build L1 - L3
| [TeamCity]                     | `teamcity`       | Build L1 - L2

[GitHub Actions]: /trusted-build-systems/github
[Azure DevOps]: /trusted-build-systems/azure-devops
[GitLab CI/CD]: /trusted-build-systems/gitlab
[TeamCity]: /trusted-build-systems/teamcity

{:.panel.info}
> **Attestation vs. code signing**
>
> Code signing is usually performed by the publisher, using their own certificates and keys. A digital code signature guarantees that an artifact was published by the entity specified in the certificate (authenticity) and was not modified by a third party (integrity), provided code signing was implemented in a secure way. Signatures might carry implicit guarantees about additional security properties, but there is no way to verify those.
>
> Attestation provides explicit information about security properties attested by a third party. This article specifies specific SLSA attestations by SignPath for other parties. In order to create trustworthy attestations, SignPath gathers and verifies information on the _control plane_ from _hosted_ CI/CD services like GitHub.com. 
>
> SLSA attestations do not contain any explicit publisher information. For Open Source projects, clients can check if source code repository URL and build definition match the expected values of the project. For software from commercial vendors, clients should rely on code signing for publisher verification.

## Build type description

This section describes the build types for SLSA attestations created by SignPath. They are expressed by the `buildDefinition.buildType` field within the provenance, containing the value `https://signpath.io/slsa/buildtypes/$build-system/v1`, where `$build-system` can have one of the following values:

### External parameters

| Field                            | Type   | Example                                    | Description 
|----------------------------------|--------|--------------------------------------------|--------------
| `buildDefinition.git.repository` | string | `https://github.com/my-org/my-repo`        | Source code repository identifier for the build definition
| `buildDefinition.git.path`       | string | `.github/workflows/build.yml`              | Path to the build definition file within the commit
| `buildDefinition.git.branch`     | string | `refs/heads/main`                          | If available, the source code branch containing the build definition at the time of the build
| `buildDefinition.git.commitId`   | string | `d17077cc10b045ead742c397a4caebe1530efaf3` | Source code version of the build definition that was used

### Internal parameters

| Field                | Description
|----------------------|--------------
| `signingRequest.url` | URL of the signing request that created the attestation

### Provenance generation requirements

For a detailed list, see the [original definition by SLSA](https://slsa.dev/spec/v1.1/requirements).

#### SLSA Level 1: A provenance must exist

{:.quote}
> The build process MUST generate provenance that unambiguously identifies the output package by cryptographic digest and describes how that package was produced.

Guarantee: SignPath created a complete provenance.

#### SLSA Level 2: The provenance is authentic

{:.quote}
> Authenticity: Consumers MUST be able to validate the authenticity of the provenance attestation in order to ensure integrity and define trust.

Guarantee: The provenance was digitally signed.

{:.quote}
> Accuracy: The provenance MUST be generated by the control plane and not by a tenant of the build platform.

Guarantee: SignPath created the provenance. All contents are obtained from a trusted build system on the control plane and cannot be tampered with.

#### SLSA Level 3: The provenance is unforgeable

{:.quote}
> Accuracy: Provenance MUST be strongly resistant to forgery by tenants.

Guarantee: The signing key is stored on SignPath and is not accessible by the environment running the user-defined build steps.

### Isolation strength requirements

#### SLSA Level 2: Hosted builds

{:.quote}
> All build steps ran using a hosted build platform on shared or dedicated infrastructure, not on an individual’s workstation.

Guarantee: All builds were reported through a [Trusted Build System](/trusted-build-systems). If the provenance is signed by SignPath, SignPath will guarantee that the build system is hosted in the cloud (e.g. GitHub.com or GitLab.com). Otherwise, the signer of the provenance confirms that they connected a self-managed build system with SignPath.

#### SLSA Level 3: Isolated builds

{:.quote}
> It MUST NOT be possible for a build to access any secrets of the build platform, such as the provenance signing key, because doing so would compromise the authenticity of the provenance.

Guarantee: If the provenance is signed by SignPath, the build was executed on a cloud-hosted trusted build system which ensures access restrictions to build platform secrets. Otherwise, the signer of the provenance confirms that they configured the self-managed build system accordingly.

{:.quote}
> It MUST NOT be possible for two builds that overlap in time to influence one another, such as by altering the memory of a different build process running on the same machine.

| Build System   | Guarantee                      |
| --             | ------------------------------ |
| Azure DevOps   | The build was executed on a runner from the Microsoft-hosted pools, which offer isolation (see [the official documentation](https://learn.microsoft.com/en-us/azure/devops/pipelines/security/misc))
| GitHub Actions | The build was executed on a GitHub-hosted runner, each job is run in a fresh instance of the runner image (see [the official documentation](https://docs.github.com/en/actions/how-tos/manage-runners/github-hosted-runners/use-github-hosted-runners))
| GitLab CI/CD   | The build was executed on a GitLab-hosted runner, each job runs in a newly provisioned VM (see [the oficial documentation](https://docs.gitlab.com/ci/runners/hosted_runners/))

{:.quote}
> It MUST NOT be possible for one build to persist or influence the build environment of a subsequent build. In other words, an ephemeral build environment MUST be provisioned for each build.

| Build System   | Guarantee                      |
| --             | ------------------------------ |
| Azure DevOps   | The build was executed on a runner from the Microsoft-hosted pools, which provide a clean virtual machine for each build run (see [the official documentation](https://learn.microsoft.com/en-us/azure/devops/pipelines/security/misc))
| GitHub Actions | The build was executed on a GitHub-hosted runner, each job is run in a fresh instance of the runner image (see [the official documentation](https://docs.github.com/en/actions/how-tos/manage-runners/github-hosted-runners/use-github-hosted-runners))
| GitLab CI/CD   | The build was executed on a GitLab-hosted runner, each job runs in a newly provisioned VM (see [the oficial documentation](https://docs.gitlab.com/ci/runners/hosted_runners/))

{:.quote}
> It MUST NOT be possible for one build to inject false entries into a build cache used by another build, also known as “cache poisoning”. In other words, the output of the build MUST be identical whether or not the cache is used.

| Build System   | Guarantee                      |
| --             | ------------------------------ |
| Azure DevOps   | Cache usage has to be explicitly defined in the pipeline definition and cannot be shared across pipelines or branches (see [the official documentation](https://learn.microsoft.com/en-us/azure/devops/pipelines/release/caching?view=azure-devops&tabs=bundler#cache-isolation-and-security))
| GitHub Actions | Cache usage has to be explicitly defined in the workflow definition (see [the official definition](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching))
| GitLab CI/CD   | TODO: https://docs.gitlab.com/ci/caching/

{:.quote}
> The build platform MUST NOT open services that allow for remote influence unless all such interactions are captured as externalParameters in the provenance

| Build System   | Guarantee                      |
| --             | ------------------------------ |
| Azure DevOps   | The build was executed on a runner from the Microsoft-hosted pools, which do not provide the ability to remotely connect (see [the official documentation](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/hosted)).
| GitHub Actions | The build was executed on a GitHub-hosted runner which does not provide the ability to remotely connect, unless explicitly specified in the build definition (see [the official documentation](https://docs.github.com/en/actions/how-tos/manage-runners/github-hosted-runners/connect-to-a-private-network)) 
| GitLab CI/CD   | The build was executed on a GitLab-hosted runner wich does not allow remote connections (see [the official documentation](https://docs.gitlab.com/ci/runners/hosted_runners/))
