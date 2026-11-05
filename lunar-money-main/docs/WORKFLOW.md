# Workflow Guide

This document describes our workflow for collaborating on this project.


## 1. Start From `main`
- Switch to the `main` branch (bottom-left corner in VS Code).
- Run: **Ctrl+Shift+P → Git: Pull** to get the latest changes.

---

## 2. Create a New Branch
- Click the branch name → **Create new branch**.
- Name your branch after your task, e.g.:
  - `feature/login-page`
  - `bugfix/navbar-align`
- VS Code automatically switches to this branch.

---

## 3. Make Your Changes
- Write your code.

---

## 4. Commit Your Changes
- Open the **Source Control** tab.
- Write a commit message, e.g.:
  - `feat: add login form`
- Click **Commit** to save changes locally.
- **Push** to back up your branch on GitHub.

---

## 5. Push Your Branch
- When the feature is complete, click the **cloud with up arrow** to push to GitHub.

---

# Create a Pull Request (PR)

## 1. Open a PR on GitHub
- Go to the repo → **Pull requests** tab.
- Click **New pull request**.
- Fill in:
  - **Title:** short description of your change
  - **Description:** details about your work
  - **Base:** `main`
  - **Compare:** your branch  
  [More info](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)

## 2. Review & Merge
- Another team member should review and approve the PR.
- Once approved, merge it.
- Delete the branch if it’s no longer needed.

---

# After a PR is Merged

1. Switch back to `main`.
2. Pull the latest changes (`Ctrl+Shift+P → Git: Pull`).

---

# Best Practices
- **Always create a new branch** for each feature or fix.
- **Never commit directly to `main`.**
- **Write clear commit messages.**  
  Example: `feat: implement form validation`
  - **Create a new branch** for each feature or fix.
- **Never commit directly to `main`.**
- **Write clear commit messages**:
  - Use **present tense verb** (describe what the commit does, not what it did)
    Example: This -> `feat: implement form validation` Not This -> `Added form validation` 
  - Keep messages short but descriptive (50–70 characters is ideal)
  - Optionally, prefix with type for clarity:
    - `feat:` → new feature
    - `fix:` → bug fix
    - `docs:` → documentation
  