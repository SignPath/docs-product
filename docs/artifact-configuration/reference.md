---
header: Reference
layout: resources
toc: true
show_toc: 3
description: Artifact Configuration Reference
datasource: tables/artifact-configuration
---

## Elements and directives

### File formats and supported code signing directives {#file-elements}

{% assign table-omit-columns = "notes" | split: ',' %}
{%- include render-table.html table=site.data.tables.artifact-configuration.signing-file-elements -%}
{:.nowrap-code-column-3}
{% assign table-omit-columns = nil %}

[MSIX persistent identity]: https://learn.microsoft.com/en-us/windows/msix/package/persistent-identity

### Signature verification 

Supported signature verification methods: 

* [`authenticode-verify`](#authenticode-verify): Verify authenticode signatures

### Attestations

See [Attestations](attestations) for how to create attestation using artifact configurations.

### Composite file formats {#composite-file-formats}

Composite formats support signing multiple files at once.

* `<directory>` and `<zip-file>`: Sign nested files, see [nested signing](syntax#nested-signing).
* Installers and package formats: Sign composite file and nested files, see [deep signing](syntax#deep-signing).

## Signing methods {#signing-methods}

### Directives and categories

<!-- markdownlint-disable MD026 no trailing punctuation -->

Signing directives are typically used in file elements or [file sets](syntax#file-and-directory-sets), e.g. 
* a `<pe-file>` containing an `<authenticode-sign` directive
* a `<pe-file>` set containing a `<for-each>` block with an `<authenticode-sign` directive

There are three major categories of signing methods:

{%- include render-table.html table=site.data.tables.artifact-configuration.signing-method-categories -%}

#### Embedded signatures

Just specify the signing directive to sign the file.

##### Example

~~~ xml
<pe-file path="myapp.exe">
  <authenticode-sign />
</pe-file>
~~~

#### Enveloped and detached signatures

* Since the signed file is _added_, the `<file>` element must be contained in a `<zip-file>` element.
* Use the variable `${file.name}` to reference the original file's name for `output-file-name`.

##### Example

~~~ xml
<zip-file>
  <file path="myfile.bin">
    <create-gpg-signature output-file-name="${file.name}.asc" />
  </file>
</zip-file>
~~~

### Signing directives 

{%- include render-table.html table=site.data.tables.artifact-configuration.signing-directives -%}

#### `<authenticode-sign>`: Authenticode (Windows) {#authenticode-sign}

{%- include_relative render-ac-directive-table.inc directive="authenticode-sign" -%}

Microsoft Authenticode is the primary signing method on the Windows platform. Authenticode is a versatile and extensible mechanism that works for many different file types. Using `<authenticode-sign>` is equivalent to using Microsoft's `SignTool.exe`.

##### Optional attributes {#authenticode-sign-attributes}

{%- include render-table.html table=site.data.tables.artifact-configuration.authenticode-attributes -%}

##### `append` attribute

File formats that support appending signatures:

* `<pe-file>` (.exe, .dll, ...)
* `<cab-file>` (.cab)
* `<catalog-file>` (.cat)

Appending signatures is only needed for edge cases including

* adding an signature to a file that's already signed using another certificate
* adding a signature using different parameters, such as digest algorithm

##### Authenticode examples

Example: append signature, preserving any existing signatures

~~~ xml
<authenticode-sign append="true" />
~~~

Example: sign using SHA1 algorithm, then sign again using default SHA-256 algorithm (explicitly specified for clarity)

~~~ xml
<authenticode-sign hash-algorithm="sha1" />
<authenticode-sign hash-algorithm="sha256" append="true" />
~~~

Example: provide description text and URL

~~~ xml
<authenticode-sign description="ACME program" description-url="https://example.com/about-acme-program" />
~~~

See also:

* Verify existing signatures using [`authenticode-verify`](#authenticode-verify).
* Use [metadata restrictions](#metadata-restrictions) for `<pe-file>` to restrict product name and version.

#### `<nuget-sign>`: NuGet packages {#nuget-sign}

{%- include_relative render-ac-directive-table.inc directive="nuget-sign" -%}

NuGet packages are signed by [NuGet Gallery](https://www.nuget.org/). They can be signed by the publisher too. Using `<nuget-sign>` is equivalent to using Microsoft's `nuget` `sign` command.

Publisher signing has the following additional security advantages:

* NuGet Gallery can be configured to accept only uploads signed with a specific certificate
* Users will be warned if package updates don't match the previous signature
* Users can configure which publishers to trust

Although the NuGet Package format is based on OPC (see next section), it uses its own specific signing format.

{:.panel.warning}
> **No support for private PKI**
>
> Only self-signed certificates or certificates issued by a publicly trusted Certificate Authority are supported by NuGet.

{:.panel.info}
> **Certificate chain support**
>
> If certificate chains can be resolved at signing time, they will be embedded in the signature.

#### `<office-macro-sign>`: Microsoft Office VBA macros {#office-macro-sign}

{% include editions.md feature="file_based_signing.office_macros" %}

Use this directive to sign Visual Basic for Applications (VBA) macros in Microsoft Office documents and templates.
	
Use `<office-oxml-file>` for Microsoft Office Open XML files:

* **Excel:** .xlam, .xlsb, .xlsm, .xltm
* **PowerPoint:** .potm, .ppam, .ppsm, .pptm
* **Visio:** .vsdm, .vssm, .vstm
* **Word:** .docm, .dotm

Use `<office-binary-file>` for binary Microsoft Office files:

* **Excel:** .xla, .xls, .xlt
* **PowerPoint:** .pot, .ppa, .pps, .ppt
* **Project:** .mpp, .mpt
* **Publisher:** .pub
* **Visio:** .vdw, .vdx, .vsd, .vss, .vst, .vsx, .vtx
* **Word:** .doc, .dot, .wiz

Macro signatures apply only to the macros within the document files and are not affected by any other changes in the signed document files.

{:.panel.info}
> **Certificate chain support**
>
> Only publisher certificates are embedded in Office macro signatures.

#### `<opc-sign>`: Open Packaging Convention {#opc-sign}

{%- include_relative render-ac-directive-table.inc directive="opc-sign" -%}

Signs according to the [Open Packaging Conventions](https://en.wikipedia.org/wiki/Open_Packaging_Conventions) (OPC) specification. Using `<opc-sign>` for Visual Studio Extensions is equivalent to using Microsoft's `VSIXSignTool.exe`.

Note that not all OPC-based formats use OPC signatures:

* Office Open XML files (Microsoft Office): OPC signatures are only partially recognized by Office applications
* NuGet packages: ignored, use `<nuget-sign>` instead

{:.panel.info}
> **No certificate chain support**
>
> Only publisher certificates are embedded in OPC signatures.

<!-- markdownlint-enable MD026 no trailing punctuation -->

#### `<jar-sign>`: Java Archives {#jar-sign}

{% include editions.md feature="file_based_signing.java" %}

{%- include_relative render-ac-directive-table.inc directive="jar-sign" -%}

**Supported options:**

| Option                    | Default value  | Available values             | Description
|---------------------------|----------------|------------------------------|---------------------------------------------------
| `manifest-hash-algorithm` | `sha256`       | `sha256`, `sha384`, `sha512` | Hash algorithm to use when digesting the entries of a JAR file for the manifest file (`META-INF/MANIFEST.MF`) and the `META-INF/*.SF` file. Corresponds to the [`jarsigner -digestalg`][jarsigner-options] parameter.
| `hash-algorithm`          | `sha256`       | `sha256`, `sha384`, `sha512` | Hash algorithm to use for the actual signature. Corresponds to the hash algorithm specified with the [`jarsigner -digestalg`][jarsigner-options] parameter (the _signature algorithm_ is determined by the certificate's key).

[jarsigner-options]: https://docs.oracle.com/en/java/javase/26/docs/specs/man/jarsigner.html#options-for-jarsigner

##### Verification {#jar-sign-verification}

* **Java** always verifies signatures for client components. For server components, you need to create a policy. Please consult the documentation of your application server or [Oracle's documentation](https://docs.oracle.com/javase/tutorial/security/toolsign/receiver.html).
* For signed **ZIP files**, the receiver needs to check the signature explicitly before unpacking the file.

For verification, use the following command (requires [JDK](https://openjdk.java.net/install/)):

~~~ cmd
jarsigner -verify -strict <file>.zip
~~~

Add the `-verbose` option to see the certificate.

{:.panel.info}
> ** No longer supported for Android packages
>
> Current Android versions require signing schemes v2 or v3. Use [`<apk-sign>'](#apk-sign) instead of `<jar-sign>`.

#### `<apk-sign>`: Android app packages {#apk-sign}

{% include editions.md feature="file_based_signing.apk" %}

{%- include_relative render-ac-directive-table.inc directive="apk-sign" -%}

Android app package files support [signatures](https://source.android.com/docs/security/features/apksigning) in different schema versions depending on the app's SDK.

**Supported options:**

| Option                 | Optional | Description
|------------------------|----------|----------------
| `min-sdk-version`      | Yes      | The lowest Android framework API level that `apk-sign` uses for verification compatibility. By default, `apk-sign` uses the value of the minSdkVersion attribute from the app's manifest file.
| `max-sdk-version`      | Yes      | The highest Android framework API level that `apk-sign` uses for verification compatibility.


##### Example

~~~ xml
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <apk-file>
    <apk-sign />
  </apk-file>
</artifact-configuration>
~~~

#### `<rpm-sign>`: RPM Package Manager {#rpm-sign}

{% include editions.md feature="file_based_signing.rpm" %}

{%- include_relative render-ac-directive-table.inc directive="rpm-sign" -%}

RPM is the package manager format for many Linux distributions including Fedora, RedHat, and openSUSE. RPM is based on GPG signatures and requires [signing policies](/projects#signing-policies) with a [GPG key](/managing-certificates#certificate-types) certificate.

##### Example

~~~ xml
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <rpm-file>
    <rpm-sign />
  </rpm-file>
</artifact-configuration>
~~~

##### Verification {#rpm-sign-verification}

Package verification is typically performed automatically by package management tools like yum and DNF.

To manually verify `.rpm` files, use the following commands:

~~~ bash
rpm --import my_key.asc # Import, i.e. trust, the GPG public key

rpm --verbose --checksig my_package.rpm
~~~

#### `<debsigs-sign>`: Debian packages {#debsigs-sign}

{% include editions.md feature="file_based_signing.deb" %}

{%- include_relative render-ac-directive-table.inc directive="debsigs-sign" -%}

Create embedded signatures for Debian packages (`.deb` files). Package signatures are based on GPG and require [signing policies](/projects#signing-policies) with a [GPG key](/managing-certificates#certificate-types) certificate. SignPath signs packages using the [`debsigs`] specification.

**Supported options:**

| Option                 | Optional | Description
|------------------------|----------|----------------
| `signature-type`       | No       | The [signature-type][debsigs-sigtype], e.g. `origin`, `maint`, or `archive`. Debian packages can contain multiple signatures _of different type_. Note that verification requires at least an `origin` signature.

##### Example

~~~ xml
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <deb-file>
    <debsigs-sign signature-type="origin" />
  </deb-file>
</artifact-configuration>
~~~

##### Verification {#debsigs-verification}

Package signatures are verified implicitly during [`dpkg --install`][dpkg] operations unless the `--no-debsig` parameter is specified.

{:.panel.note}
> **Package signature verification is not the default**
>
> Many popular Linux distributions including Ubuntu and Debian set `no-debsig` by default in `/etc/dpkg/dpkg.cfg`. The reason is that rather than individual Debian package files, these distros verify the whole package _repository_ via [`Release.gpg`].

The `dpkg` command internally uses [`debsig-verify`]. You can also use this tool directly to verify a `.deb` file after importing the GPG key and setting up the policies (`.pol`) XML file (see [man page][`debsig-verify`] for details).

[`debsigs`]: https://manpages.debian.org/stable/debsigs/debsigs.1p.en.html
[debsigs-sigtype]: https://manpages.debian.org/stable/debsigs/debsigs.1p.en.html#SIGNATURE_TYPES
[dpkg]: https://manpages.debian.org/stable/dpkg/dpkg.1.en.html
[`Release.gpg`]: https://wiki.debian.org/SecureApt#How_apt_uses_Release.gpg
[`debsig-verify`]: https://manpages.debian.org/stable/debsig-verify/debsig-verify.1.en.html

#### `<xml-sign>`: XML Digital Signature {#xml-sign}

{% include editions.md feature="file_based_signing.xml" %}

{:.panel.tip}
> XMLDSIG can be used to sign CycloneDX XML SBOMs.

{%- include_relative render-ac-directive-table.inc directive="xml-sign" -%}

Sign XML files with [XMLDSIG](https://www.w3.org/TR/xmldsig-core1/). 

This creates an _XMLDSIG enveloped signature_ for the entire document: a `<ds:Signature>` element is added to the existing root element. 

{:.panel.info}
> **Terminology**
>
> XMLDSIG terminology names this method [_enveloped signature_](https://www.w3.org/TR/xmldsig-core1/#def-SignatureEnveloped) although it does not create an envelope. Since it preserves the existing XML document and structure, it can be treated as an [_embedded signature_](#embedded-signing-methods) for most purpuses. However, the new element might break the root element's schema if signing is not expected by the target schema. 

The result is a `Signature` element added to the root element (after all existing children) with the following properties:

| Property          | Value                                                                         | XPath
|-------------------|-------------------------------------------------------------------------------|--------------------------------------------------------------------
| Canonicalization  | Exclusive XML Canonicalization: `http://www.w3.org/2001/10/xml-exc-c14n#`     | `/*/Signature/SignedInfo/CanonicalizationMethod/@Algorithm`
| Signature Method  | RSA SHA-256: `http://www.w3.org/2001/04/xmldsig-more#rsa-sha256`              | `/*/Signature/SignedInfo/SignatureMethod/@Algorithm`
| ReferenceUri      | Whole document: `""`                                                          | `/*/Signature/SignedInfo/Reference/@URI`
| Transformation    | Enveloped signature: `http://www.w3.org/2000/09/xmldsig#enveloped-signature`  | `/*/Signature/SignedInfo/Reference/Transforms/Transform/@Algorithm`
| Transformation    | Exclusive XML Canonicalization: `http://www.w3.org/2001/10/xml-exc-c14n#`     | `/*/Signature/SignedInfo/Reference/Transforms/Transform/@Algorithm`
| Digest method     | SHA-256: `http://www.w3.org/2001/04/xmlenc#sha256`                            | `/*/Signature/SignedInfo/Reference/DigestMethod/@Algorithm`
| X.509 Certificate | _See `key-info-x509-data` option_                                             | `/*/Signature/KeyInfo/X509Data`
{:.break-code}

**Supported options:**

| Option                       | Optional | Description
|------------------------------|----------|------------------------------------------------------------------------------
| `key-info-x509-data`         | Yes      | `none`: Do not include any X.509 data in the signature<br/> `leaf` (Default): Include only the leaf certificate in the signature<br/> `whole-chain`: Include the whole certificate chain in the signature<br/> `exclude-root`: Include the whole certificate chain in the signature, but exclude the root certificate<br/> **Note**: `whole-chain` and `exclude-root` only work with public CA trusted certificates|

See also:

* Use [metadata restrictions](#metadata-restrictions) for `<xml-file>` to restrict root element and namespace.

#### `<jsf-sign>`: JSON Signature Format {#jsf-sign}

{% include editions.md feature="file_based_signing.jsf" %}

{:.panel.tip}
> JSF can be used to sign CycloneDX v1.x JSON SBOMs.

{%- include_relative render-ac-directive-table.inc directive="jsf-sign" -%}

Sign JSON files with [JSON Signature Format (JSF)](https://cyberphone.github.io/doc/security/jsf.html). 

This creates signature of the whole document: a `signature` property is added at the root level. Note that a JSON object is expected, JSON arrays are not supported at the root level.

**Supported options:**

| Parameter          | Default value             | Available values             | Description
|--------------------|---------------------------|------------------------------|-------------------------------------------------
| `hash-algorithm`   | `sha256`                  | `sha256`, `sha384`, `sha512` | Hash algorithm used to create the signature.
| `rsa-padding`      | (mandatory for RSA keys)  | `pkcs1`, `pss`               | Padding algorithm (ignored for non-RSA keys).

#### `<notation-sign>`: Notary (Notation) container signature {#notation-sign}

Sign container images using [Notation (Notary)](/signing-containers#notary).

{%- include_relative render-ac-directive-table.inc directive="notation-sign" -%}

This places the signature at the right place within the OCI layout and add relevant references.

**Supported options:**

| Option                 | Optional | Description
|------------------------|----------|----------------
| `tag`                  | No       | The image tag, e.g. `latest` or `v3.1.2`. Consider using [user-defined parameters](/artifact-configuration/syntax#parameters).

##### Example

~~~ xml
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <oci-image-layout-archive-file>
    <notation-sign tag="latest" />
  </oci-image-layout-archive-file>
</artifact-configuration>
~~~

_Note: You can create both Notary and [Cosign](#cosign-sign) signatures for the same image._

#### `<cosign-sign>`: Sigstore Cosign container signature {#cosign-sign}

Sign container images using [Sigstore Cosign](/signing-containers#cosign).

{%- include_relative render-ac-directive-table.inc directive="cosign-sign" -%}

This places the signature at the right place within the OCI layout and add relevant references.

**Supported options:**

| Option                 | Optional | Description
|------------------------|----------|----------------
| `tag`                  | No       | The image tag, e.g. `latest` or `v3.1.2`. Consider using [user-defined parameters](/artifact-configuration/syntax#parameters).

##### Example

~~~ xml
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <oci-image-layout-archive-file>
    <cosign-sign tag="latest" />
  </oci-image-layout-archive-file>
</artifact-configuration>
~~~

_Note: You can create both [Notary](#notation-sign) and Cosign signatures for the same image._

#### `<dsse-sign>`: DSSE (Dead Simple Signing Envelope) {#dsse-sign}

{% include editions.md feature="file_based_signing.dsse" %}

{%- include_relative render-ac-directive-table.inc directive="dsse-sign" -%}

Create a DSSE signature file that contains the signature and the enveloped original file in JSON format.

{:.panel.info}
> **DSSE (Dead Simple Signing Envelope)**
>
> [DSSE] is a signing specification created by the [Secure Systems Lab] at NYU School of Engineering. It has not been formally standardized but is widely used in the context of code signing. 
> Note that DSSE contains no metadata about the signing format, so all signing parameters must be agreed out-of-band.

DSSE is an [enveloped](#enveloped-signing-methods) signing method and must be used in `<zip-file>` elements.

The `dsse-sign` directive supports the following parameters:

| Parameter          | Default value             | Available values             | Description
|--------------------|---------------------------|------------------------------|-------------------------------------------------
| `output-file-name` | (mandatory)               |                              | Name of the output file containing the signature. Use `${file.name}` to reference the source file name.
| `payload-type`     | (mandatory)               |                              | A [MIME type or URI](https://github.com/secure-systems-lab/dsse/blob/master/protocol.md) which describes the payload type.
| `hash-algorithm`   | `sha256`                  | `sha256`, `sha384`, `sha512` | Hash algorithm used to create the signature.
| `rsa-padding`      | (mandatory for RSA keys)  | `pkcs1`, `pss`               | Padding algorithm (ignored for non-RSA keys).

##### DSSE example

This example signs SLSA Verification Summary Attestations using DSSE:

~~~ xml
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <zip-file>
    <file path="slsa-vsa.json">
      <dsse-sign payload-type="application/vnd.in-toto+json" 
                 hash-algorithm="sha256" rsa-padding="pkcs1"
                 output-file-name=" ${file.name}.dsse" />
    </file>
  </zip-file>
</artifact-configuration>
~~~

The resulting artifact contains both the original file `slsa-vsa.json` and the enveloped signature`slsa-vsa.dsse`.

#### `<smime-sign>`: S/MIME signing {#smime-sign}

{% include editions.md feature="file_based_signing.smime" %}

{%- include_relative render-ac-directive-table.inc directive="smime-sign" -%}

S/MIME signing can be used to sign arbitrary "messages" with an X.509 certificate. Usually the input is in text form (e.g. the output of the `shasum` utility). The resulting file is a text file which contains both, the input (text), and a CMS signature and can be verified e.g. via `openssl` commands (see below).

S/MIME is an [enveloped](#enveloped-signing-methods) signing method and must be used in `<zip-file>` elements.

The `smime-sign` directive supports the following parameters:

| Parameter          | Default value             | Available values             | Description
|--------------------|---------------------------|------------------------------|-------------------------------------------------
| `output-file-name` | (mandatory)               |                              | Name of the output file containing the signature. Use `${file.name}` to reference the source file name.
| `normalization`    | `line-endings`            | `line-endings`, `none`       | Use `line-endings` to normalize line endings to `<CR><LF>` (see [RFC 8551](https://datatracker.ietf.org/doc/html/rfc8551)), else no normalization happens (the input file is treated as binary).
| `hash-algorithm`   | `sha256`                  | `sha256`, `sha384`, `sha512` | Hash algorithm used to create the signature.
| `rsa-padding`      | (mandatory for RSA keys)  | `pkcs1`, `pss`               | Padding algorithm (ignored for non-RSA keys).

##### S/MIME signing example

This example signs a hash sum text file as `hashes.txt.msg`:

~~~ xml
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <zip-file>
    <file path="hashes.txt">
      <smime-sign
        normalization="line-endings"
        hash-algorithm="sha256"
        rsa-padding="pkcs1"
        output-file-name="${file.name}.msg" />
    </file>
  </zip-file>
</artifact-configuration>
~~~

##### S/MIME verification

S/MIME signature files can be verified with both, the `openssl cms` or `openssl smime` commands:

~~~ bash
openssl cms -verify -purpose codesign -in "hashes.txt.msg" -out "hashes.txt"

openssl smime -verify -purpose codesign -in "hashes.txt.msg" -out "hashes.txt"
~~~

{:.panel.warning}
> **OpenSSL CMS verification**
>
> * Prior to OpenSSL 3.2, the `-purpose` flag does not support `codesign`. Use `any` instead.
> * When the certificate is not trusted on the target system, specify `-CAfile` with the path of the root certificate. Make sure that the root certificate is distributed in a secure way.

#### `<create-cms-signature>`: Cryptographic Message Syntax (CMS) {#create-cms-signature}

{% include editions.md feature="file_based_signing.cms" %}

{%- include_relative render-ac-directive-table.inc directive="create-cms-signature" -%}

Create CMS signatures to sign any file with an X.509 certificate. Tools like `openssl cms` can be used to verify these signatures. 

{:.panel.info}
> **Cryptographic Message Syntax (CMS)**
>
> CMS is an IETF standard for cryptographically protected messages, as defined in [RFC 5652]. It is often referred to as _PKCS #7_, although this is technically the name of the standard preceding CMS.

CMS is a [detached](#detached-signing-methods) signing method and must be used in `<zip-file>` elements.

The `create-cms-signature` directive supports the following parameters:

| Parameter          | Default value             | Available values             | Description
|--------------------|---------------------------|------------------------------|-------------------------------------------------
| `output-file-name` | (mandatory)               |                              | Name of the output file containing the signature. Use `${file.name}` to reference the source file name.
| `output-encoding`  | (mandatory)               | `pem`, `der`                 | The encoding of the output file containing the signature.
| `hash-algorithm`   | `sha256`                  | `sha256`, `sha384`, `sha512` | Hash algorithm used to create the signature.
| `rsa-padding`      | (mandatory for RSA keys)  | `pkcs1`, `pss`               | Padding algorithm (ignored for non-RSA keys).

##### CMS example

~~~ xml
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <zip-file>
    <file path="myfile.bin">
      <create-cms-signature output-encoding="pem" output-file-name="${file.name}.cms.pem"
         hash-algorithm="sha256" rsa-padding="pkcs1" />
    </file>
  </zip-file>
</artifact-configuration>
~~~

The resulting artifact contains both the original file `myfile.bin` and the detached signature in `myfile.bin.cms.pem`.

##### CMS signature verification

Multiple tools support verification of CMS signature. One popular option is `openssl cms`:

~~~ bash
openssl cms -verify -purpose codesign -content myfile.bin -binary -inform PEM -in myfile.bin.cms.pem -out /dev/null
~~~

{:.panel.warning}
> **OpenSSL CMS verification**
>
> * Prior to OpenSSL 3.2, the `-purpose` flag does not support `codesign`. Use `any` instead.
> * When the certificate is not trusted on the target system, specify `-CAfile` with the path of the root certificate. Make sure that the root certificate is distributed in a secure way.

#### `<create-gpg-signature>`: Detached GPG signing {#create-gpg-signature}

{% include editions.md feature="file_based_signing.gpg" %}

{%- include_relative render-ac-directive-table.inc directive="create-gpg-signature" -%}

Create detached GPG signatures to sign any file with a GPG key.

{:.panel.info}
> **Naming: GPG and OpenPGP, keys and certificates**
>
> Our documentation uses the term GPG for these key and signature types. While OpenPGP would be the technically correct term, is often referred to via its de-facto standard implementation, _GNU Privacy Guard_ (GPG or GnuPG). The first implementation was _Pretty Good Privacy_ (PGP), and the format was ultimately standardized as OpenPGP by the IETF.
>
> The GPG community uses various terms for certificates, including _GPG Key_, _Public Key_, _Transferable Public Key_ and _Certificate_. To avoid confusion with the public key of a asymmetric key pair, and for consistency within our documentation, we use the term _GPG Key_ as a specific type of _Certificate_. See [Managing Certificates](/managing-certificates#certificate-types) for more information.

GPG is a [detached](#detached-signing-methods) signing method and must be used in `<zip-file>` elements. It is only available for [signing policies](/projects#signing-policies) with a [GPG key](/managing-certificates#certificate-types) certificate.

The `create-gpg-signature` directive supports the following parameters:

| Parameter          | Default value   | Available values             | Description
|--------------------|-----------------|------------------------------|-------------------------------------------------
| `output-file-name` | (mandatory)     |                              | Name of the output file containing the signature. Use `${file.name}` to reference the source file name.
| `output-encoding`  | `ascii-armored` | `ascii-armored`, `binary`    | The encoding of the output file containing the signature. Either [ASCII armored, i.e. text-only](https://datatracker.ietf.org/doc/html/rfc4880#section-6.2) (default) or the binary OpenPGP packet format.
| `hash-algorithm`   | `sha256`        | `sha256`, `sha384`, `sha512` | Hash algorithm used to create the signature.
| `version`          | `4`             | `4`                          | Specifies the [signature version](https://datatracker.ietf.org/doc/html/rfc4880#section-5.2). Currently only `4` is supported, the attribute is intended to allow pinning the version in case the default version changes in the future.

##### Example

~~~ xml
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <zip-file>
    <file path="myfile.bin">
      <create-gpg-signature output-encoding="ascii-armored" output-file-name="${file.name}.asc" />
    </file>
  </zip-file>
</artifact-configuration>
~~~

The resulting artifact contains both the original file `myfile.bin` and the detached signature in `myfile.bin.asc`.

##### GPG signature verification

Signature verification can be performed with any [OpenPGP-compliant](https://datatracker.ietf.org/doc/html/rfc4880) tool. Example using [GnuPG](https://www.gnupg.org/):

~~~ bash
# Import the GPG key (unless done before):
gpg --import my_key.asc

# Verify `myfile.bin` against the detached signature file `myfile.bin.asc`:
gpg --verify myfile.bin.asc myfile.bin
~~~

#### `<create-raw-signature>`: Detached raw signature files {#create-raw-signature}

{% include editions.md feature="file_based_signing.raw" %}

{%- include_relative render-ac-directive-table.inc directive="create-raw-signature" -%}

Create raw signatures for any binary or text file. A raw signature is the output of the key algorithm, or cipher (e.g. RSA, ECDSA), without any additional data. 

Use cases for raw signatures include:

* Signing for lightweight verification, e.g. on embedded systems 
* Creating signature blocks for subsequent use with other tools and formats
* [Signing _Cosign_ metadata files](/signing-containers#cosign)

Raw signing is a [detached](#detached-signing-methods) signing method and must be used in `<zip-file>` elements.

The `create-raw-signature` directive supports the following parameters:

| Parameter          | Default value             | Values                       | Description
|--------------------|---------------------------|------------------------------|-------------------------------------------------
| `output-file-name` | (mandatory)               |                              | Name of the output file containing the signature. Use `${file.name}` to reference the source file name.
| `hash-algorithm`   | (mandatory)               | `sha256`, `sha384`, `sha512` | Hash algorithm used to create the signature.
| `rsa-padding`      | (mandatory for RSA keys)  | `pkcs1`, `pss`               | Padding algorithm (ignored for non-RSA keys).

(All cryptographic parameters are mandatory because raw signatures contain no metadata for agnostic verification.)

##### Raw signature example

~~~ xml
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <zip-file>
    <file path="myfile.bin">
      <create-raw-signature output-file-name="${file.name}.sig" hash-algorithm="sha256" />
    </file>
  </zip-file>
</artifact-configuration>
~~~

The resulting artifact contains both the original file `myfile.bin` and the detached signature in `myfile.bin.sig`.

##### Raw signature verification

Extract the public key from the certificate, then use any tool that can process raw signature blocks to verify the detached signature. 

Extract the public key:
~~~ bash
openssl x509 -in certificate.cer -inform DER -pubkey -out pubkey.pem -noout
~~~

Verify the signature using the public key:

~~~ bash
openssl dgst -verify pubkey.pem -signature file.sig
~~~

If you use this method directly to verify signatures, make sure that the public key is distributed in a secure way and independently from the file to be verified. 

#### `<clickonce-sign>`: Microsoft ClickOnce and VSTO Office add-ins {#clickonce-sign}

{%- include_relative render-ac-directive-table.inc directive="clickonce-sign" -%}

ClickOnce signing, also called _manifest signing_, is a method used for ClickOnce applications and Microsoft Office Add-ins created using Visual Studio Tools for Office (VSTO). Using `<clickonce-sign>` is equivalent to using Microsoft's `mage.exe`.

ClickOnce signing applies to directories, not to individual files. Therefore, you need to specify a `<directory>` element for this method. If you want to sign files in the root directory of a composite element, specify `path="."`.

##### Example

~~~ xml
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <zip-file>
    <directory path=".">
      <clickonce-sign/>
    </directory>
  </zip-file>
</artifact-configuration>
~~~

#### `<custom-sign>` and `<create-custom-signature>`: Custom signing methods {#custom-signing}

* Use [embedded](#embedded-signing-methods) custom signing methods: `<custom-sign method="..." />`
* Use [detached](#detached-signing-methods) custom signing methods: `<create-custom-signature method="..." output-file-name="..." />`

Contact [SignPath Support](https://signpath.io/support) for adding and registering custom signing methods.

Provide the registered method name and any parameters defined by that method.

##### `<custom-sign` example (embedded)

Sign the input file using the custom signing method `demo-pkcs11tool` with a custom parameter `signature-hash-algorithm`.

~~~ xml
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <file>
  	<custom-sign method="demo-pkcs11tool" signature-hash-algorithm="sha256"/>
  </file>
</artifact-configuration>
~~~

##### `<create-custom-signature` example (detached)

Create a `.sig` signature file for each `.txt` file using the custom signing method `demo-pkcs11tool`.

~~~ xml
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <zip-file>
    <file path="*.txt" max-matches="unbounded">
      <create-custom-signature method="demo-pkcs11tool" output-file-name="${file.name}.sig">
    </directory>
  </zip-file>
</artifact-configuration>
~~~

## Verification methods {#verification}

Verification directives are used to ensure that files in a signing request are already properly signed by their respective publisher.

Use them to

* avoid installing unsigned files with your (signed) installers or packages
* sign each file in it's respective build pipeline rather than signing everything in the final (downstream) pipeline
* re-sign third-party files to comply with your organization's code signing policies

When used to verify a file before signing it, the _verify_ directive must precede any _sign_ directives.

### `<authenticode-verify>` {#authenticode-verify}

{% comment %} available for all formats that support authenticode-sign {% endcomment %}
{%- assign table-omit-columns = "notes" | split: ',' %}
{%- include_relative render-ac-directive-table.inc directive="authenticode-sign" -%} 

Verifies that a file has a valid Authenticode signature.

This method verifies signatures according to Windows rules:

* Supported hash digest algorithm and length, signing key type and length
* Valid timestamp (or unexpired publisher certificate)
* Certificate chain ends in Windows trusted root certificate 

May be combined with [`<authenticode-sign>`](#authenticode-sign) to replace the signature. For supported formats, you may add an additional signature using  the [`append` attribute](#authenticode-sign-attributes).

#### Example

~~~ xml
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <msi-file>
    <pe-file-set>
      <include path="Microsoft.*.dll" max-matches="unbounded" />
      <include path="System.*.dll" max-matches="unbounded" />
      <for-each>
        <authenticode-verify/>
        <authenticode-sign append="true"/>
      </for-each>
    </pe-file-set>
  </msi-file>
</artifact-configuration>
~~~

## File metadata restrictions {#metadata-restrictions}

Some element types support restricting certain metadata values. 

The restrictions can be applied to file elements, [file set elements](syntax#file-and-directory-sets), or `<include>` elements. Attributes on `<include>` elements override those on file set elements.

| File element | Supported restriction attributes                                                                                        | Example
|--------------|-------------------------------------------------------------------------------------------------------------------------|--------
| `<pe-file>`  | PE file headers: `product-name`, `product-version`, `file-version`, `company-name`, `copyright`, `original-filename`    | [PE file restrictions](examples#msi-and-pe-restriction)
| `<msi-file>` | MSI properties: `subject`, `author`                                                                                     | [MSI file restrictions](examples#msi-and-pe-restriction)
| `<xml-file>` | Root element name and namespace: `root-element-name`, `root-element-namespace`                                          | [SBOM restrictions](examples#sbom-restriction)

[DSSE]: https://github.com/secure-systems-lab/dsse
[RFC 5652]: https://datatracker.ietf.org/doc/html/rfc5652
[Secure Systems Lab]: https://ssl.engineering.nyu.edu/