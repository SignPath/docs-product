---
header: Pipeline Policies
layout: resources
toc: false
description: Documentation for using Pipeline Policies in SignPath
---

{% include editions.md feature="pipeline_integrity.pipeline_policies" %} 

Pipeline policies allow restricting source code and build settings of your CI/CD pipeline.

Steps to create a Pipeline Policy:
1. In SignPath, create a Pipeline Policy with either an _internal_ definition, i.e. YAML pasted in the web interface or an _external_ definition stored in a source code repository.
2. For each [signing policy](/projects#signing-policies), one or more pipeline policies can be added. At submit time, the build system and source code management system settings are evaluated and compliance with the policy definition is checked. If the level is set to _Log_, a respective information entry is shown on the signing request page. If the level is set to _Enforce_, the signinig request is denied.

# Example

```yaml
github-build-policies:
  version: '1.0'
  disallow_reruns: false
  runners:
    require_github_hosted: true
    allowed_groups:
      - Hardened Runners

github-scm-policies:
  version: '1.0'
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

# Reference

Pipeline Policies for the following systems are supported. See the respective pages for details:

* Source Code Management (SCM) systems:
  * [GitHub](/trusted-build-systems/github#github-scm-policies) (`github-scm-policies`)
* CI/CD systems:
  * [GitHub Actions](/trusted-build-systems/github#github-build-policies) (`github-build-policies`)
  * [Azure DevOps](/trusted-build-systems/azure-devops#azure-devops-build-policies) (`azure-devops-build-policies`)
