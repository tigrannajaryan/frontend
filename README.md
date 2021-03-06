[![Build Status](https://travis-ci.com/madebeauty/monorepo.svg?token=E27wTPpcxaCRjQW243pX&branch=develop)](https://travis-ci.com/madebeauty/monorepo)

# Introduction
MadeBeauty frontend source code. This repo contains all source code
for all our mobile applications.

# Directory Structure

The repository has the following structure:
```
/mobile  - mobile apps.
```


# Contributing

Below are general guidelines that you need to follow
when contributing to this repo. See also additional guidance
on specific apps in `/mobile/README.md`.

Use supplied `/.gitcommit` commit message template. You can enable
it this way:
`git config commit.template .gitcommit`

## Branching Model

We practice Continuous Deployment with 1 mainline branch:
`develop`.

Committing to `develop` branch will trigger automatic build
and deployment of staging environment, and upon success - automatic
build and deployment of production environment.

We keep linear commit history on `develop` branch.
Don't use merge commits on this branch. Always use rebase and
fast-forward when merging.

Commits on `develop` branch should be the smallest
possible logical change that makes sense but not smaller. It should
be single cohesive idea, like "Added ability to upload a photo on
profile page". There should be one-to-one mapping between ideas
and commits.

We use feature branches temporarily during development
of features. Feature branches use
`feature/<your-slack-name>/<feature-name>` convention.
Feature branches must be short-lived and exist only while
the feature is being developed or is under code review.
Do not keep long-lasting feature branches, otherwise you
risk facing merge conflicts which are never fun.

Feel free to make as many commits as you want on your feature
branch as you make progress on the work. These intermediate
commits are a convenient savepoints and it is up to you
how many intermediate commits you want to do and what to
include in each. However before merging your work to develop
branch make sure your commits are squashed into one logical commit
(an exception to this rule when you can have more than one logical
commit is if you are introducing a large feature - however see
the section below about large features).

While you work on your feature branch it is advised to rebase it
often from `develop` branch to make sure your changes are fresh and
will be easy to merge later. You can rebase using git (assuming
your feature branch is checked out and your changes are commited
locally):

```
git fetch
git rebase origin/develop
```

## Large changes and feature flags

If you work on a large feature that can take more than a few
days to develop and requires multiple commits then break down
the large change to separately deliverable smaller logical changes,
create separate commit and Pull Request for each change,
and deliver each to `develop` as you make progress.

However make sure that partially implemented feature is not
exposed to end users. To achieve it disable the feature in production
using feature flags. For mobile app the easiest way would be
to do something like this:

```
if (!ENV.ffEnableIncomplete) {
  // code for your new feature that should not be
  // exposed to for the particular environment
}
```

## Pull Requests and Code Reviews

Every change must be peer reviewed before it is merged to mainline
branches. Push your feature branch to origin then go to Github
and create a pull request from that branch. If your change is
about UI then include screenshots showing what you did.

Once the pull request is created it will automatially trigger
a build. Wait until the build succeeds and add appropriate
reviewers. Now wait for reviewers to comment.

After receiving comments fix the issues, work with the reviewer
to refine your work. If you need to make changes you can make
additional commits on your feature branch or you can amend the
original commit. Push your changes to origin and reply to comments
in Github.

Once you and the reviewer are satisfied merge you pull request
using stashing. Use "Squash changes when merging" option in Github.
Delete your feature branch after closing the pull request.

## Automated Tests

All non-trivial functionality must be covered by automated tests.
Both web backend and mobile frontend have automated test suites.
Add your tests for any new feature you create or for any bug you fix.
The final commit that you merge to the develop branch must include
the automated tests for the new feature.

