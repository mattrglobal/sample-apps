pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        // Local maven repository for the MATTR MobileCredentialVerifier SDK.
        // Unzip the SDK distribution and copy its `global` folder into the `repo`
        // directory at the project root, then sync Gradle. See README for details.
        maven {
            url = uri("repo")
        }
    }
}

rootProject.name = "Remote Verifier Tutorial"
include(":app")
