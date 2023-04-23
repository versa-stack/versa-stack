# Configuration Reference

```bash
# prints configuration to terminal
versa-cli config # (-r,--raw, print raw json)
```

## Configuration syntax

Configuration for versa-stack is generally written in `YAML` format with a little bit of extra on top.
The configuration is self-referencing using jsonpath syntax and some filters are supported as well. In order to make use of a jsonpath, a query is enclosed with `${}`. If the query should produce more than one item in an array, the selector should be enclosed with `$[}`.

An example `.versa` configuration file.

```yaml{4-5,9-10}
# Repository meta information
name: example-repository
organisation: example-org
registry: docker.io/${repository.organisation}
git: github.com:${repository.organisation}/${repository.name}
# Versioning
version: 1.0.0
# Read package.json
packageJsonPath: ${repository.workingDir}/package.json
packageJson: ${packageJsonPath | file | fromJson}
```

A configuration value may also contain a javascript function, for example in order to set `repository.version` to have either the value of the environment variable `VERSION`, or if `VERSION` does not exist or has a falsy value, `repository.version` is set to `"0.0.0"`

```yaml{7}
# Repository meta information
name: example-repository
organisation: example-org
registry: docker.io/${repository.organisation}
git: github.com:${repository.organisation}/${repository.name}
# Dynamic versioning
version: (config) => config.env.VERSION ?? 1.0.0
# Read package.json
packageJsonPath: ${repository.workingDir}/package.json
packageJson: ${packageJsonPath | file | fromJson}
```

Furthermore, other `yaml` files can be included in order to build a flexible and DRY configuration for your stack.

```yaml
imports:
  # Repository meta information
  - ./repository-meta.yaml
  # Read package.json
  - https://example.com/load-package-json.yaml

# Dynamic versioning
version: (config) => config.env.VERSION ?? 1.0.0
```

This loading pattern allows versa-stack to be configured by stichting together configuration layers.

## Example file Structure

A simplified repository could have the following configuration file structure:

```
|- .versa               # Provider specific configurations
|  |- local.yaml        # Configuration for local
|  |- prod.yaml         # Configuration for prod
|  |- base.yaml         # Configuration forming the base for all environments
|
|- .env                 # Environment Variables
|- .versarc             # Runtime configuration
```

- `.versarc`

  ```yaml
  configPath: .versa/${runconfig.env.ENVIRONMENT}.yaml
  ```

- `.versa/base.yaml`

  ```yaml
  imports:
    # Repository meta information
    - ./repository-meta.yaml
    # Read package.json
    - https://example.com/load-package-json.yaml

  # Dynamic versioning
  version: (config) => config.env.VERSION ?? 1.0.0
  ```

- `.versa/local.yaml`

  ```yaml
  imports:
    - ./base.yaml

  domain: example.local
  ```

- `.versa/local.yaml`

  ```yaml
  imports:
    - ./base.yaml

  domain: example.com
  ```

Running `ENVIRONMENT=local versa-cli config` would produce the following output:

```json
{
  "repository": {
    "name": "example-repository",
    {...},
    "domain": "example.local",
    "workingDir": "..."
  },
  "runconfig": {
    "configPath": "./config/local.yaml",
    "env": {...},
    "hostinfo": {...},
    "pipeline": "**/pipeline.yaml",
  }
}
```

## Filter Reference

| Filter   | Description                                 |
| -------- | ------------------------------------------- |
| base64e  | Encodes string to its base64 representation |
| base64d  | Decodes base64 representation to utf8       |
| sha256   | Create sha256 hash                          |
| sha512   | Create sha512 hash                          |
| file     | Read path as string to file to be read      |
| toJson   | Serialize value to JSON string              |
| fromJson | Deserialise JSON                            |
| toYaml   | Serialize value to YAML string              |
| fromYaml | Deserialise YAML                            |
