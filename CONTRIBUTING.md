# Contributing

## Process/Workflow

UIO+'s [source code](https://github.com/fluid-project/uio-plus) is hosted on GitHub. All of the code that is
included in a release lives in the main branch. The intention is that the main branch is always in a working state.

UIO+ uses a workflow where contributors fork the project repository, work in a branch created off of main,
and submit a Pull Request against the project repo's main branch.

### Issue Tracker

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
avoid errors and common pitfalls in the language, all code should be regularly checked using the provided lint task. You
may also wish to setup linting in your IDE.

```bash
npm run lint
```

### Pull Requests and Merging

After a Pull Request (PR) has been submitted, one or more members of the community will review the contribution. This
typically results in a back and forth conversation and modifications to the PR. Merging into the project repo is a
manual process and requires at least one Maintainer to sign off on the PR and merge it into the project repo.

When merging a Pull Request, it is recommended to use a [Squash Merge](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-request-merges#squash-and-merge-your-pull-request-commits).
While this does modify commit history, it will enable us to more easily establish a link between code changes and Issues
that precipitated them.

## Class name conventions

Class names can either be used as CSS selectors for styling or an element selector for JavaScript actions. To reduce
confusion when styling, modifying HTML, or refactoring code; the same classes must not be used for both. The following
outlines the conventions used.

### Classes for styling

Styling classes must be prefixed with `uioPlus-`. Styling classes for components coming from Infusion may be prefixed
with `fl-`.

### Classes used by JavaScript

Classes used by JavaScript to locate and manipulate DOM elements must be prefixed with `uioPlusJS-`. Classes used by
Infusion components may be prefixed with `flc-`

## Publishing to the Chrome Web Store

1. Prepare Code.
   1. Ensure that all of the code, that should be published, has been merged into the main branch.
   2. Ensure that the code in main is working as expected.
      1. Run tests: `npm test`
      2. Lint: `npm run lint`
      3. Manual test build.
         1. Create a build: "npm run build"
         2. Load unpacked extension into Chrome.
            1. In Chrome, go to [chrome://extensions](chrome://extensions)
            2. Ensure that "Developer mode" is enabled.
            3. Click "Load unpacked".
            4. From the File Dialog, navigate to the "uio-plus" repo and select the "dist" directory.
         3. Test all of the preferences and ensure that they apply to web page content correctly.
            1. Refresh any Browser Tabs/Windows that were open prior to installing the extension.
            2. The preferences should be tested individually and in combinations to ensure that interactions between the
               preferences are working properly. For example (Text-to-Speech and Syllabification, Text-to-Speech with
               Reading Mode).
            3. Multiple web pages should be tested. However, not all preferences will work with all sites.
2. Create the release package.
   1. This Project uses release-please to automatically generate release PRs based on commits to the `main` branch.
      To create a release simply merge the release PR into the `main` branch. This will update the version numbers
      in the `package.json` and `manifest.json` files, update the change logs, create the GitHub release and generate
      the git tag.
   2. Create a release build
      1. Checkout the tag created after merging the release PR.
      2. Run: `npm run build`
      3. Copy the zip archive and rename after the version number, e.g. `uio_plus_vX.Y.Z`
      4. Create a zip archive of the directory.
      5. Add this zip archive to the GitHub release page
3. Publish to the [Chrome Web Store](https://chrome.google.com/webstore/category/extensions).
   1. Go to the [Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard/g02818309428530539805)
      on the Chrome Web Store and log in using the fluid team account.
   2. On the Developer Dashboard, click “Edit”; located on the right-hand side of the UI Options Plus (UIO+) listing.
   3. On the UI Options Plus (UIO+) edit page, click “upload updated package” and upload the zip created in step 2.4
      above.
   4. Update the “Detailed description” field as necessary. Similar information is contained in this README.
   5. Update the screenshots if necessary. They will need to be the exact size requested.
   6. Click "Preview Changes".
      1. Verify that everything appears correct. Pay particular attention to anything that was changed,
         e.g., version number/name, descriptions, screenshots, etc.
   7. When everything appears correct, publish the changes.
      1. The actual publishing to the Chrome Web Store will take about an hour, but could be longer depending on
         their review process.
4. Verify Published UIO+.
   1. Ensure that the contents of the [UIO+](https://chrome.google.com/webstore/detail/ui-options-plus-uio%20/okenndailhmikjjfcnmolpaefecbpaek)
      page on the Chrome Web Store appear correct. Double check things like version number/name, descriptions,
      screenshots, etc.
   2. Install the version from the Chrome Web Store, and run through the manual testing again. (See: step 1.2.3 above)
   3. If everything is working, announce release where required (e.g., fluid-work list, project teams, etc.). If there
      are any issues, fix them and repeat the process.
