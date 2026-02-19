---
header: Reference
layout: resources
toc: true
show_toc: 3
description: Artifact Configuration Reference
datasource: tables/artifact-configuration
---

## File and directory elements {#file-elements}

{%- include render-table.html table=site.data.tables.artifact-configuration.signing-file-elements -%}
{:.nowrap-code-column-3}

### Composite formats {#containers}

Composite element types such as directories, archives, installers and package formats allow nested file elements. See [Syntax](syntax#structure) for more information.

## Signing methods {#signing-methods}

### Directives and categories

<!-- markdownlint-disable MD026 no trailing punctuation -->

Use signing directives in:

* file elements (e.g. `<authenticode-sign` in `<pe-file>`)
* directory elements (`<clickonce-sign>` in `<directory`)
* [file and directory sets](syntax#file-and-directory-sets) (in the `<for-each>` element)

Signing directives are available for several code signing methods. There are three major categories of signing methods:

{%- include render-table.html table=site.data.tables.artifact-configuration.signing-method-categories -%}
{:.nowrap-code-column-4}

### Embedded signing methods {#embedded-signing-methods}

These signing methods add signatures to existing files. Several platforms including Windows, Apple, and Java provide a variety of file formats that support embedded signatures. 

Since the file's format does not change, the unsigned files are not needed anymore. SignPath will only return the signed files in Signing Requests.

#### Supported embedded formats

* [`<authenticode-sign>`: Authenticode (Windows)](#authenticode-sign)
* [`<nuget-sign>`: NuGet packages](#nuget-sign)
* [`<office-macro-sign>`: Microsoft Office VBA macros](#office-macro-sign)
* [`<opc-sign>`: Open Packaging Convention](#opc-sign)
* [`<jar-sign>`: Java Archives](#jar-sign)
* [`<rpm-sign>`: RPM Package Manager](#rpm-sign)
* [`<debsigs-sign>`: Debian packages](#debsigs-sign)
* [`<xml-sign>`: XML Digital Signature](#xml-sign)

The general syntax for embedded signing methods is: `<`_format_`-sign />`

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
> **Certificate chain support**
>
> Only publisher certificates are embedded in OPC signatures.

<!-- markdownlint-enable MD026 no trailing punctuation -->

#### `<jar-sign>`: Java Archives {#jar-sign}

{% include editions.md feature="file_based_signing.java" %}

{%- include_relative render-ac-directive-table.inc directive="jar-sign" -%}

Android apps and app-bundles: Note that JAR signatures only implement APK signing scheme v1 (v2 and v3 are not yet supported).

##### Verification {#jar-sign-verification}

* **Java** always verifies signatures for client components. For server components, you will need to create a policy. Please consult the documentation of your application server or [Oracle's documentation](https://docs.oracle.com/javase/tutorial/security/toolsign/receiver.html).
* **Android** always verifies App signatures, but current Android versions require signing schemes v2 or v3.
* If you sign **ZIP files**, the receiver needs to manually check the signature before unpacking the file.

For manual verification, use the following command (requires [JDK](https://openjdk.java.net/install/)):

~~~ cmd
jarsigner -verify -strict <file>.zip
~~~

Add the `-verbose` option to see the certificate.


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

#### `<debsigs-sign>`: Debian package {#debsigs-sign}

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

{%- include_relative render-ac-directive-table.inc directive="xml-sign" -%}

Sign XML files with [XMLDSIG](https://www.w3.org/TR/xmldsig-core1/). 

This will create an _enveloped signature_ for the entire document. 

The result is a `Signature` element added to the root element (after all existing children) with the following properties:

| Property          | Value                                                                         | XPath
|-------------------|-------------------------------------------------------------------------------|--------------------------------------------------------------------
| Canonicalization  | Exclusive XML Canonicalization: `http://www.w3.org/2001/10/xml-exc-c14n#`     | `/*/Signature/SignedInfo/CanonicalizationMethod/@Algorithm`
| Signature Method  | RSA SHA-256: `http://www.w3.org/2001/04/xmldsig-more#rsa-sha256`              | `/*/Signature/SignedInfo/SignatureMethod/@Algorithm`
| ReferenceUri      | Whole document: `""`                                                          | `/*/Signature/SignedInfo/Reference/@URI`
| Transformation    | Enveloped signature: `http://www.w3.org/2000/09/xmldsig#enveloped-signature"` | `/*/Signature/SignedInfo/Reference/Transforms/Transform/@Algorithm`
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

### Enveloped signing methods {#enveloped-signing-methods}

These signing methods create new files that contain both the original file and the signature. Enveloped signatures are available for all file types using the `<file>` element. Since the signed file is _added_, this `<file>` element must be contained in a `<zip-file>` element.

While the original file is still available, it often needs to be extracted from the enveloped file in order to be used, ideally after sucessful signature verification. SignPath will preserve the original files in Signing Requests.

#### Supported enveloped formats

* [`<dsse-sign>`: DSSE (Dead Simple Signing Envelope)](#dsse-sign)

The general syntax for enveloped signing methods is: `<`_format_`-sign output-file-name="..." />`

#### `<dsse-sign>`: DSSE (Dead Simple Signing Envelope) {#dsse-sign}

{% include editions.md feature="file_based_signing.dsse" %}

{%- include_relative render-ac-directive-table.inc directive="dsse-sign" -%}

Create a DSSE signature file that contains the signature and the evenloped original file in JSON format.

{:.panel.info}
> **DSSE (Dead Simple Signing Envelope)**
>
> [DSSE] is a signing specification created by the [Secure Systems Lab] at NYU School of Engineering. It has not been formally standardized but is widely used in the context of code signing. 
> Note that DSSE contains no metadata about the singing format, so all signing parameters must be agreed out-of-band.

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

The resulting artifact will contain both the original file `slsa-vsa.json` and the enveloped signature`slsa-vsa.dsse`.

### Detached signing methods {#detached-signing-methods}

These signing methods create new files that contain the signature and a cryptographic hash code of the original file. Detached signatures are available for all file types using the `<file>` element. Since the signature file is _added_, this `<file>` element must be contained in a `<zip-file>` element.

For signature verification, both the original file and the detached signature must be present. SignPath will preserve the original files in Signing Requests.

#### Supported detached formats

* [`<create-cms-signature>`: Cryptographic Message Syntax (CMS)](#create-cms-signature)
* [`<create-gpg-signature>`: Detached GPG signing](#create-gpg-signature)
* [`<create-raw-signature>`: Detached raw signature files](#create-raw-signature)

The general syntax for detached signing methods is: `<create-`_format_`-signature output-file-name="..." />`

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

The resulting artifact will contain both the original file `myfile.bin` and the detached signature in `myfile.bin.cms.pem`.

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
| `version`          | `4`             | `4`                          | Specifies the [signature version](https://datatracker.ietf.org/doc/html/rfc4880#section-5.2). Currently only `4` is supported, the attribute is intended to allow to fixate the version in case the default version will be changed in the future.

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

The resulting artifact will contain both the original file `myfile.bin` and the detached signature in `myfile.bin.asc`.

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
* [Signing _Cosign_ metadata files](/signing-containers/cosign)

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

The resulting artifact will contain both the original file `myfile.bin` and the detached signature in `myfile.bin.sig`.

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

### Other signing methods {#other-signing-methods}

#### Other supported formats

* [`<clickonce-sign>`: Microsoft ClickOnce and VSTO Office add-ins](#clickonce-sign)

#### `<clickonce-sign>`: Microsoft ClickOnce and VSTO Office add-ins {#clickonce-sign}

{%- include_relative render-ac-directive-table.inc directive="clickonce-sign" -%}

ClickOnce signing, also called _manifest signing_, is a method used for ClickOnce applications and Microsoft Office Add-ins created using Visual Studio Tools for Office (VSTO). Using `<clickonce-sign>` is equivalent to using Microsoft's `mage.exe`.

ClickOnce signing applies to directories, not to individual files. Therefore, you need to specify a `<directory>` element for this method. If you want to sign files in the root directory of a composite element, specify `path="."`.

~~~ xml
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <zip-file>
    <directory path=".">
      <clickonce-sign/>
    </directory>
  </zip-file>
</artifact-configuration>
~~~

## Verification methods {#verification}

Verification directives are used to ensure that files in a signing request are already properly signed by their respective publisher.

Use this to

* avoid installing unsigned files with your (signed) installers or packages
* sign each file in it's respective build pipeline rather than signing everything in the final (downstream) pipeline
* re-sign third-party files to comply with your organization's code signing policies

When used to verify a file before signing it, the _verify_ directive must precede any _sign_ directives.

### `<authenticode-verify>`

Verifies that a file has a valid Authenticode signature.

This method verifies signatures according to Windows rules:

* Supported hash digest algorithm and length, signing key type and length
* Valid timestamp (or unexpired publisher certificate)
* Certificate chain ends in Windows trusted root certificate 

May be combined with [`<authenticode-sign>`](#authenticode-sign). 

{:.panel.todo}
> **TODO: add**
>
> Use `append="true"` to add the new signature instead of replacing the existing one (supported formats only).

#### Example

~~~ xml
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <msi-file>
    <pe-file-set>
      <include path="Microsoft.*.dll" max-matches="unbounded" />
      <include path="System.*.dll" max-matches="unbounded" />
      <for-each>
        <authenticode-verify/>
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


**Footnotes:**

[^jscript]: Note that [JScript](https://en.wikipedia.org/wiki/JScript) is not the same as JavaScript. While it is possible to use this option to sign JavaScript files, JavaScript engines will not be able to use this signature.

[DSSE]: https://github.com/secure-systems-lab/dsse
[RFC 5652]: https://datatracker.ietf.org/doc/html/rfc5652
[Secure Systems Lab]: https://ssl.engineering.nyu.edu/
