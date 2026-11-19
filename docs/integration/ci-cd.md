---
header: CI/CD System Integration
layout: resources
toc: true
show_toc: 3
description: Documentation for integrating SignPath with Continuous Integration/Deployment (CI/CD) platforms and pipelines
---

## CI integrations with origin verification

[Origin Verification](/origin-verification) ensures that a signed artifact is the result of building a specific source code version.

It provides verified origin metadata including:

* The repository, branch and commit ID of the source code that was built
* The URL and configuration of the build that created the signing request

SignPath supports the following Trusted Build Systems with origin verification:

* [GitHub](/trusted-build-systems/github)
* [Jenkins](/trusted-build-systems/jenkins)
* [AppVeyor](/trusted-build-systems/appveyor)
* [Azure DevOps](/trusted-build-systems/azure-devops)
* [TeamCity](/trusted-build-systems/teamcity)

## Other CI integrations

### Azure DevOps

[![Azure DevOps installations](https://img.shields.io/visual-studio-marketplace/azure-devops/installs/total/SignPath.signpath-tasks?color=blue&label=Visual+Studio+Marketplace+installs)](https://marketplace.visualstudio.com/items?itemName=SignPath.signpath-tasks)

For Azure DevOps, you can use build pipeline tasks from the [official SignPath extension on Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=SignPath.signpath-tasks).

