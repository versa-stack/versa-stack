# @versa-stack

## Getting Started:

To get started with versa-stack, you can clone the repository from Github at https://github.com/versa-stack/versa-stack. From there, you can explore the various tools that are included in the stack and begin configuring them according to your needs.

### CLI Usage:

The versa-stack CLI is a powerful tool that can be used to manage and execute pipelines. With the CLI, you can:

- Plan and build pipelines using a simple, declarative syntax.
- Run pipelines on your local machine, in Docker containers, or on Kubernetes clusters.
- Use configuration files to customize the behavior of the tools.
- Extend the functionality of the tools using plugins.

```
git clone git@github.com:versa-stack/versa-stack.git
pnpm install -r
pnpm run -r build
cd workspace/apps/versa-cli && npm link

versa-cli help
```

- [Configuration Reference](./reference/config.md)

## Kubernetes Operator Usage:

The versa-stack Kubernetes operator can be used to deploy and manage pipelines on Kubernetes clusters. With the operator, you can:

- Manage pipeline execution as Kubernetes resources.
- Use Kubernetes constructs such as ConfigMaps and Secrets to manage configuration.
- Leverage Kubernetes features such as horizontal pod autoscaling and rolling updates to manage pipeline execution.
- We hope that versa-stack provides you with a powerful and flexible toolset for developing, building, and deploying your applications. If you have any questions or feedback, please don't hesitate to reach out to us on Github.
