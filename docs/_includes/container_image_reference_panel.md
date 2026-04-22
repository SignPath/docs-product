{:.panel.info}
> **`Image references`**
>
> An **image reference** consists of the following parts:
> * Optionally, the registry host and port, e.g. `docker.io` or `registry.mycompany.com:3000` - while the image is operated locally, this should be omitted
> * The namespace and/or repository, e.g. `jetbrains/teamcity-server`
> * The `$tag` identifying the version, e.g. `latest`

> For images hosted on Docker Hub, the image reference is `docker.io/$namespace/$repository:$tag`, e.g. `docker.io/jetbrains/teamcity-server:latest`. 
> 
> If you are using your own registry, specify the value you would use for Docker CLI commands, e.g. `registry.mycompany.com/myrepo/myimage:latest`.