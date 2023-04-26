# Pipelines Reference

A pipeline is defined as a `YAML` file with the same syntactical sugar as the configuration files, with the difference that the pipeline is validated against a schema:

```yaml
name: my-pipeline
order:
  - stage1
  - stage2

stages:
  stage1:
    - name: job1
      scripts:
        - echo "Hello job1"
  stage2:
    - name: job2
      image: alpine
      when: ${configs.repository.environment} == prod
      scripts:
        - echo "Hello ${configs.repository.organisation}"
  stage3:
    - name: job3
      image: alpine
      depends:
        - stage1:job1
      tags:
        - stage3
        - job3
      scripts: $[stages.stage2[?(@.name=="job2")][0].scripts}
    - name: job4
      image: alpine
      scripts:
        - echo "Hello ${configs.repository.organisation | base64e}
      tags:
        - stage3
        - job4
```

In a pipeline stages are run in the order defined by `order`.
If not any else specified the first job of the 2nd stage will only run when all jobs in the first stage have finished.
In this example `job3` shows that is depends on `job1` in `stage1`.
Instead for `job3` to wait for all jobs of `stage1` and `stage2` to finish, it will only wait for `job1` to finish and then run.
This can allow for slightly more complex pipelines run faster.

## Running pipelines

Pipelines are run with the `versa-cli run` command. By default this command will read the `pipeline` value inside `.versarc` or passed directly to the command line with the `-p/--pipeline` option.

The configuration option `pipeline` inside `.versarc` can be glob or an array of globs.

```bash
versa-cli run # runs all pipelines matching glob in `runconfig.pipeline`
versa-cli run -p ./versa-demo-pipeline.yaml # run the pipeline found in provided glob
```

### Task conditionals

Sometimes tasks should only be run when certain conditions are met.
For this tasks can have a `when` property which contains simple comparision expressions.

```yaml{4}
  stage2:
    - name: job2
      image: alpine
      when: ${configs.repository.environment} == prod
      scripts:
        - echo "Hello ${configs.repository.organisation}"
```

The following operators are supported: `==`, `!=`, `<=`, `<`, `>=`, `>`

### Filtering tasks with tags

Tasks in pipelines can be denoted with `tags` which contains an arbitrary array of strings.
There are special tags like the `always` tag, which makes the task run independentaly on which tag expression was used.

```yaml{6-8,14-16}
  stage3:
    - name: job3
      image: alpine
      depends:
        - stage1:job1
      tags:
        - stage3
        - job3
      scripts: $[stages.stage2[?(@.name=="job2")][0].scripts}
    - name: job4
      image: alpine
      scripts:
        - echo "Hello ${configs.repository.organisation | base64e}
      tags:
        - stage3
        - job4
```

You can run tasks matching tag expressions with the `-t,--tags` option.

Please refer to https://github.com/NimitzDEV/logical-expression-parser for how to build expressions.

```bash
versa-cli run --tags cool --p ./versa-demo-pipeline.yaml
```
