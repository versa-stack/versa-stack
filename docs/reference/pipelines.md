# Pipelines Reference

```bash
# runs pipelines glob
versa-cli run # (-p,--pipeline glob to find pipelines, defaults to **/pipeline.yaml)
```

## Pipeline Syntax

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
      scripts:
        - echo "Hello ${configs.repository.organisation}"
  stage3:
    - name: job3
      image: alpine
      depends:
        - stage1:job1
      scripts: $[stages.stage2[?(@.name=="job2")][0].scripts}
    - name: job4
      image: alpine
      scripts:
        - echo "Hello ${configs.repository.organisation | base64e}
```

In a pipeline stages are run in the order defined by `order`.
If not any else specified the first job of the 2nd stage will only run when all jobs in the first stage have finished. In this example `job3` shows that is depends on `job1` in `stage1`.
Instead for `job3` to wait for all jobs of `stage1` and `stage2` to finish, it will only wait for `job1` to finish and then run. This can make slightly more complex pipelines run faster.
