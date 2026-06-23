# Local SDK repository

This folder is the local Maven repository for the MATTR mDocs Verifier SDK. It is
referenced from `settings.gradle.kts` as `maven { url = uri("repo") }`.

To set up the SDK:

1. Unzip the `mobile-credential-verifier-<version>.zip` package supplied by MATTR.
2. Drag the unzipped `global` folder into this `repo` folder, so the layout is
   `repo/global/...`.
3. Sync the project with Gradle files to pick up the new module.

> The SDK contents (`repo/global/`) are intentionally excluded from version
> control via `.gitignore`. This README keeps the otherwise-empty `repo` folder
> present after cloning or downloading the project.
