---
header: Notation Plugin
layout: resources
toc: true
show_toc: 3
description: SignPath Notation Plugin
---

## General instructions

[notation] is a command line tool to creating and verifying signatures of artifacts stored in an OCI registry. It is most commonly used for container images. See the [section on signing container images with notation](/signing-containers#notation) for more details.

### Installation

#### Linux

The notation plugin can be installed using the following commands:

~~~bash
# download and extract the plugin binary
curl -s https://download.signpath.io/cryptoproviders/notation-plugin/6-latest/linux/x64/notation-signpath.tar.gz \
  | tar -C /tmp -xzf - notation-signpath

# install the plugin
notation plugin install --file /tmp/notation-signpath

# clean up
rm /tmp/notation-signpath
~~~

{:.panel.info}
> **Verifying the `notation-signpath` signature**
>
> You can verify the signature of the `notation-signpath` executable using our [public GPG key](/assets/other/signpath_release_public_key.asc) by also extracting the detached signature file `notation-signpath.asc` from the `.tar.gz`
> ~~~bash
> curl -s ... | tar -C /tmp -xzf - notation-signpath notation-signpath.asc
> gpg --verify /tmp/notation-signpath.asc /tmp/notation-signpath
> ~~~

#### Windows

The notation plugin can be installed using the following commands:

~~~ powershell
# download an extract the plugin binary
Invoke-WebRequest "https://download.signpath.io/cryptoproviders/notation-plugin/6-latest/windows/x64/notation-signpath.zip" `
  -OutFile "${env:TEMP}\notation-signpath.zip"
Expand-Archive -DestinationPath "${env:TEMP}\notation-signpath" "${env:TEMP}\notation-signpath.zip"

# install the plugin
notation plugin install --file "${env:TEMP}\notation-signpath\notation-signpath.exe"

# clean up
Remove-Item -Recurse -Confirm:$false ${env:TEMP}\notation-signpath*
~~~

{:.panel.info}
> **Verifying the `notation-signpath.exe` signature**
>
> You can verify the signature of the `notation-signpath.exe` executable by calling
> ~~~ powershell
> Get-AuthenticodeSignature "${env:TEMP}\notation-signpath\notation-signpath.exe"
> ~~~

### Configuration

See [SignPath Crypto Providers](/crypto-providers/#crypto-provider-configuration) for general configuration options.

### Usage

* The available [configuration values](/documentation/crypto-providers#crypto-provider-configuration) can also be passed in via the command line arguments `--plugin-config "Key=<Value>"`. 
* The notation _key id_ is comprised of the _project slug_ and _signing policy slug_, separated by a forward slash, e.g. `"MyProject/release-signing"`

{% raw %}
~~~bash
export IMAGE_DIGEST=`docker inspect --format='{{index .RepoDigests 0}}' "$FQN:$TAG"`

export SIGNPATH_API_KEY=...your-api-key...
notation sign \
  --signature-format cose \
  --id "$SIGNPATH_PROJECT_SLUG/$SIGNPATH_SIGNING_POLICY_SLUG" \
  --plugin signpath \
  --plugin-config "OrganizationId=$SIGNPATH_ORGANIZATION_ID" \
  $IMAGE_DIGEST
~~~
{% endraw %}

{% include container_image_reference_panel.md %}

[notation]: https://github.com/notaryproject/notation