---
header: Signing Container Images
layout: resources
toc: true
show_toc: 3
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

SignPath supports these technologies for signing container images:

* **[Notary (Notation)](#notary)**: Sign containers using Notary - recommended by Microsoft (AKS) and Amazon (EKS)
* **[Sigstore Cosign](#cosign)**: Sign containers using Cosign by Sigstore (a Linux foundation project)

The _Code Signing Gateway_ additionally supports

* **[GPG](#gpg)**: Signing containers using GPG keys for RedHat OpenShift

{:.panel.info}
> **Docker Content Trust (DCT) is deprecated**
>
> SignPath also supports the deprecated [Docker Content Trust (DCT)](/signing-containers/docker-content-trust) signing method.

### Recommendation

SignPath recommends using [**Notary (Notation)**](#notary) for Enterprises and [Cosign](#cosign) for open source projects.

_For a detailed comparison between the different technologies, see the [appendix](#appendix-comparison)._

### Notary (Notation) {#notary}

The _[Notary project](https://notaryproject.dev/)_ (aka Notary v2) is the successor of Docker Content Trust. It is developed by the [Cloud Native Computing Foundatio](https://cncf.io/). Both Microsoft and Amazon recommend Notation for signing container images deployed in their respective Kubernetes offerings.

Notation uses standard PKI, is easy to set up and has a mature trust model. SignPath recommends Notation for signing container images in Enterprise environments.

### Sigstore Cosign {#cosign}

_Cosign_ is part of the [Sigstore](https://www.sigstore.dev/) project. It is primarily targeted at the open source community, allowing individual developers to sign container images using OpenID user accounts from GitHub, Google or Microsoft. For those developers, Sigstore eliminates the need for certificates or locally stored private keys.

{:.panel.info}
> **Sigstore architecture**
>
> Sigstore combines the _Cosign_ tool, the _Fulcio_ certificate authority and the _Rekor_ transparency log as follows:
>
> 1. Cosign creates a metadata file for signing
> 2. Fulcio authenticates the user account using OpenID Connect (OIDC)
> 3. Fulcio creates a short-lived certificate for the OIDC identity using an ephemeral key and signs the metadata digest
> 4. Rekor logs the signature in its public transparency log
> 5. Cosign uploads signature and metadata to the image's repository

{:.panel.warning}
> **No Fulcio support in SignPath**
>
> SignPath only supports cosign signatures based on public/private key pairs, not Fulcio-issued X.509 certificates. These certificates require specific additional attributes. The sigstore project is actively working on supporting custom certificates from traditional PKIs.

## How to sign

### With Advanced Code Signing

To sign container images with SignPath, the following steps are required:

#### 1. Store the container image in an OCI-compliant layout

We recommend signing the image before it is pushed to a container registry. This requires the image to be stored in a `.tar` archive locally. You can either use `docker buildx build` using a [build driver](https://docs.docker.com/build/builders/) that supports building OCI tarballs, like `docker-container`. Then you can simply specify a tarball as an output destination while building your image:

    docker buildx build -o type=oci,dest=image.tar ...

Alternatively, you can use the default `docker` driver and save the image to a tarball after building:

    docker save -o image.tar <identifier>

#### 2. Optional: Strip the content layers

If you do not want to upload the entire container image to SignPath, we provide a utility tool to strip the content layers before signing and repack them afterwards. In this case, only the metadata is sent to SignPath. 

<!-- TODO: Do we want to include signature verification here? -->
<!-- TODO: change URL -->

    curl -s https://download.signpath.io/cryptoproviders/sp-oci/latest-main/linux/x64/sp-oci.tar.gz | tar -xzf - sp-oci
    ./sp-oci strip image.tar --reference <image-reference> --directory /tmp/image-binary-layers

{:.panel.info}
> **No security degradation**
>
> All layer references are cryptographically secure and included in the metadata. There is no security degradation by not including them when signing.

#### 3. Sign the tarball with SignPath

* Create an artifact configuration for signing containers with [Notation](/artifact-configuration/reference#notation-sign) or [Cosign](/artifact-configuration/reference#cosign) respectively.
* Submit the tarball for signing using any of the native [build system integrations](/trusted-build-systems), the [PowerShell module](/powershell) or the [REST API](/build-system-integration).

#### 4. If stripped, repack the content layers again

In case you stripped the content layers of the image in step 2, now it is time to repack them:

    ./sp-oci repack image-signed.tar --reference <image-reference> --directory /tmp/image-binary-layers

#### 5. Publish the signed image

Use the [oras tool](https://github.com/oras-project/oras) to publish the container image including the signatures to your registry:

    oras cp -r --from-oci-layout image-signed.tar:<tag> myregistry.com/<image-reference>

{:.panel.info}
> **Image references**
>
> An **image reference** consists 
> For images hosted on Docker Hub, the image reference is `docker.io/$namespace/$repository:$tag`, e.g. `docker.io/jetbrains/teamcity-server:latest`. 
> 
> If you are using your own registry, specify the value you would use for Docker CLI commands, e.g. `myregistry.com/myrepo/myimage:latest`.

### With the Code Signing Gateway

#### Notary (Notation)

Notary signatures are created using the [Notation CLI tool](https://github.com/notaryproject/notation). SignPath provides a plugin for signing. See the [SignPath Notation Plugin](/crypto-providers/notation) page for details.

#### Sigstore Cosign

The [cosign CLI tool](https://github.com/sigstore/cosign) supports keys stored on HSMs via the PKCS11 protocol. You can use [SignPath's PKCS#11 module](/crypto-providers/cryptoki) to sign your container image. See [cosign's official documentation](https://docs.sigstore.dev/cosign/signing/pkcs11/) for details.

#### GPG {#gpg}

Standard GPG signatures can be used to sign container images and verify them using [podman](https://podman.io/). See [Red Hat’s official documentation](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/8/html/building_running_and_managing_containers/assembly_signing-container-images_building-running-and-managing-containers) on how to perform the signing.

There is no standard way of distributing GPG-based container image signatures (e.g. in an OCI-compliant registry), they have to be transferred out-of-band to the target system.

To integrate SignPath, refer to our [GPG CryptoProvider documentation](/crypto-providers/gpg).

## Appendix: Detailed comparison between the different technologies {#appendix-comparison}

{%- include render-table.html table=site.data.tables.signing-containers.methods-comparison -%}
{: .row-headers }




