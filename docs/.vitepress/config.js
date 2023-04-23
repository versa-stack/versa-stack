export default {
  title: "@versa-stack",
  description:
    "simple, configurable tools for developing, building, and deploying apps. CLI and Kubernetes operator, extendable with plugins",
  base: `${process.env.BASE || "/"}`,
  themeConfig: {
    sidebar: [
      {
        text: "Reference",
        items: [
          {
            text: "Configuration",
            link: "/reference/config",
          },
          {
            text: "Pipelines",
            link: "/reference/pipelines",
          },
        ],
      },
    ],
  },
};
