# Contributing

## Process/Workflow

UIO+'s [source code](https://github.com/fluid-project/uio-plus) is hosted on GitHub. All of the code that is
included in a release lives in the master branch. The intention is that the master branch is always in a working state.

UIO+ uses a workflow where contributors fork the project repository, work in a branch created off of master,
and submit a Pull Request against the project repo's master branch.

### Issues

Issues are tracked using [GitHub Issues](https://github.com/fluid-project/uio-plus/issues). When creating a new issue,
please pick the most appropriate type (e.g. bug, enhancement) and fill out the template with all the necessary
information. Issues should be meaningful and describe the task, bug, or feature in a way that can be understood by the
community. Opaque or general descriptions should be avoided. If you have a large task that will involve a number of
substantial commits, consider breaking it up into subtasks.

### Commit Logs

Commit logs should follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) format.

### Unit Tests

Production-level code needs to be accompanied by a reasonable suite of unit tests. This helps others confirm that the
code is working as intended, and allows the community to adopt more agile refactoring techniques while being more
confident in our ability to avoid regressions. Please view the Documentation for using
[jqUnit](https://docs.fluidproject.org/infusion/development/jqUnit.html) and the
[IoC Testing Framework](https://docs.fluidproject.org/infusion/development/IoCTestingFramework.html) for writing tests.

### Linting

JavaScript is a highly dynamic and loose language, and many common errors are not picked up until run time. In order to
avoid errors and common pitfalls in the language, all code should be regularly checked using the provided Grunt lint
task. You may also wish to setup linting in your IDE.

```bash
# Runs UIO+'s linting tasks
grunt lint

# or using npm
npm run lint
```

### Pull Requests and Merging

After a Pull Request (PR) has been submitted, one or more members of the community will review the contribution. This
typically results in a back and forth conversation and modifications to the PR. Merging into the project repo is a
manual process and requires at least one Maintainer to sign off on the PR and merge it into the project repo.

When merging a Pull Request, it is recommended to use a [Squash Merge](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-request-merges#squash-and-merge-your-pull-request-commits). While this does
modify commit history, it will enable us to more easily establish a link between code changes and Issues that
precipitated them.
