---
header: Integration Guide
layout: resources
toc: true
show_toc: 3
description: Documentation for integrating SignPath 
redirect_from: 
  - /integrations
  - /build-system-integration
---

## Abstract

This section describes how SignPath can be integrated into automated builds using continuous integration software. You can use the PowerShell module provided by SignPath, directly call the Web API to submit signing requests, or integrate SignPath as part of your AppVeyor build step.

{:.panel.info}
> **Locating ID values**
>
> All necessary IDs can be found on the signing policy details page, including a code snippet that calls the PowerShell module.

## Authentication {#authentication}

You need an API token to access the API, whether directly or through any connector. 

The following options are available:

* Use a dedicated [CI user](/users#ci).
* [Add an API token](/users#interactive-api-token) to your own user account for personal API access.

## CI/CD integration

SignPath provides native integrations for various CI/CD systems and various.

In addition, PowerShell modules, REST APIs and Webhooks are available for unsupported CI/CD systems and custom integration scenarios.

## PowerShell

[![PowerShell Gallery](https://img.shields.io/powershellgallery/v/SignPath.svg?style=flat-square&label=PowerShell%20Gallery)](https://www.powershellgallery.com/packages/SignPath/)

See the [SignPath PowerShell reference](/powershell).