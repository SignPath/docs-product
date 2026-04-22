---
header: Signing Container Images
layout: resources
toc: true
show_toc: 2
description: Documentation for signing container images with SignPath
redirect_from: /docker-signing
datasource: tables/signing-containers
---

<!-- TODO: this is not correct -->
{% include editions.md feature="file_based_signing.docker" %}

## Overview

There are multiple technologies available for signing container images and they all differ from classic code signing methods as used by most platforms. The different technologies follow their individual philosophies and have their specific advantages and shortcomings.

## Why use SignPath for container signing?

SignPath provides the following advantages:

* Your **signing keys are securely stored** on a Hardware Security Module (HSM)
* You can use the full power of SignPath **signing policies**, including permission, approval, and origin verification
* You can use all **CI integration** features of SignPath <!-- TODO: rename to Pipeline Integrity? -->
* Configuration and policy management is **aligned with other signing methods**, such as Authenticode or Java signing
* SignPath maintains a **full audit log** of all signing activities including metadata such as the registry URL and signed image tag
* You can **sign multiple images in a single signing request**, making audits/reviews of multi-image releases a lot easier

For _Notary (Notation)_ and _Sigstore Cosign_, there are additional specific advantages:

* You can **sign your images before they are pushed**, making sure that only signed images are available in your registry
* Signing tools can be **centrally managed** and updates/changes in technology have zero effect on your build pipelines

For _Sigstore Cosign_, there are additional specific advantages:

* You can **authenticate automated build systems instead of individual developers** and leverage origin verification for CI systems that do not support Cosign workload identities (currently only Github and Gitlab in their SaaS offerings)
* You can use your own key material and **keep your signature data private** without having to operate an own Fulcio certificate authority system

<!--
For _Notary v1 / Docker Content Trust (DCT)_, there are additional specific advantages:

* **You don't need to keep the target key** (a powerful key without hardware protection option that you would otherwise need for every new developer)
* **Developers don't need to keep their own delegation keys**
* SignPath controls **signing on a semantic level**, where DCT would just verify signatures on manifest files (i.e. with SignPath, a signing request that claims to add a signature to a specific image and/or label can be trusted to do just that and nothing else)-->

## Different technologies

SignPath fully supports these technologies for signing container images:

* **[Notary (Notation)](/signing-containers/notary)**: Sign containers using Notary - recommended by Microsoft (AKS) and Amazon (EKS)
* **[Sigstore Cosign](/signing-containers/cosign)**: Sign containers using Cosign by Sigstore (a Linux foundation project)

SignPath _Code Signing Gateway_ additionally supports

* **[GPG](/signing-containers/gpg)**: Signing containers using GPG keys for RedHat OpenShift

{:.panel.info}
> **Docker Content Trust (DCT) is deprecated**
>
> SignPath also supports the deprecated [Docker Content Trust (DCT)](/signing-containers/docker-content-trust) signing method.


### Recommendation

SignPath recommends using [Notary (Notation)](/signing-containers/notary) for Enterprises and [Cosign](/signing-containers/cosign) for open source projects.

### Detailed comparison

{%- include render-table.html table=site.data.tables.signing-containers.methods-comparison -%}
{: .row-headers }




