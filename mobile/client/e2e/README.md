End to end tests are using Protractor to drive the app.

Source code is composed of 2 primary types of files: page definitions (e.g. first-page.ts)
and test scenarios (e.g. first-page.e2e-spec.ts).

Page definitions describe the page, its UI elements and possible operations that
can be performed with the page (e.g. login() or register()).

Test scenarios are using page definitions (sometimes multiple page definitions,
e.g. registration-flow.e2e-spec.ts) to interact with pages on higher level.

The extraction of page definitions into separate files allows updating UI element
definitions in one place when the app's UI is changed and minimizes the maintenance
cost of tests. Always aim to write test scenarios in terms of high-level operations
that are in page definition files.
