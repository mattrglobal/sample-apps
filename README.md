[![MATTR](./docs/assets/mattr-logo-square.svg)](https://github.com/mattrglobal)

# Welcome to the MATTR Sample Apps Repo

A collection of developer apps and API tooling that you can use to interface with the MATTR Platform.

## Projects
* [claims-source-app](/claims-source-app/README.md) – A mock Claims Source that you can use for our [Claims source tutorial](https://learn.mattr.global/docs/issuance/claims-source/tutorial) and [Claim sets tutorial](https://learn.mattr.global/docs/issuance/claim-sets/tutorial).
* [verifier-web-tutorial](/verifier-web-tutorial/README.md) – A NextJS app that uses MATTRs Verifier Web SDK to verify mDocs presented via an online presentation workflow as per ISO/IEC 18013-7:2024 and OID4VP.
* [webhook-app](/webhook-app/README.md) – A webhook receiver for MATTR VII webhooks with HTTP signature validation.

## Utilities

* [Credential templates](/credential-templates/README.md)
* [Postman Collection](/postman/README.md)

## Dependency updates

Every Monday morning (NZ time) two things run:

* **Weekly refresh** (`.github/workflows/deps-weekly-refresh.yml`) re-resolves every JS app's lockfile to the newest versions its `package.json` ranges allow, transitive dependencies included, and opens or updates one PR from `deps/weekly-refresh`. It never edits `package.json`. Releases newer than 3 days are skipped. The PR body has a look-ahead: the direct dependencies still behind after merging (and whether Dependabot, a range change or a deliberate upgrade moves them), plus any advisories the refreshed lockfiles still carry.
* **Dependabot** (`.github/dependabot.yml`) only opens what the refresh can't do: major upgrades, grouped by dependency across apps, and security fixes. It also covers the Android Gradle apps, the Dockerfiles and GitHub Actions.

Expo, React Native and MATTR SDK majors in the React Native tutorials are excluded from automation. Upgrade them together with the matching Learn tutorial using `npx expo install --fix`. If a refresh would move a package that has a `patches/` file, that app's lockfile is left alone and the PR says so. Regenerate the patch against the new version to unblock it.

To run the refresh locally: `node scripts/deps/refresh.mjs --only <app-dir>`.

---

<p align="center"><a href="https://mattr.global" target="_blank"><img height="40px" src ="./docs/assets/mattr-logo-tm.svg"></a></p><p align="center">Copyright © MATTR Limited. <a href="./LICENSE">Some rights reserved.</a><br/>“MATTR” is a trademark of MATTR Limited, registered in New Zealand and other countries.</p>
