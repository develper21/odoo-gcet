# Contributing to Dayflow_HRMS

Thanks for your interest in contributing to **Dayflow_HRMS** 🚀  
This project is a full-stack HRMS built with **Next.js, Tailwind CSS, PostgreSQL, and Drizzle ORM** — and we want your contributions to be smooth, consistent, and high-quality.

## 🚀 Quick Start

If you're new here, follow these steps:

1. **Fork** the repository  
2. **Clone** your fork  
   ```bash
   git clone https://github.com/your-username/Dayflow_HRMS.git
   cd Dayflow_HRMS
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```
4. **Configure environment variables**
   Copy `.env.local.example` → `.env.local` and fill in your own secrets and DB URL.
5. **Set up the database**

   ```bash
   npm run db:push
   ```
6. **Run locally**

   ```bash
   npm run dev
   ```

---

## 🌿 Branching Strategy

Follow a consistent branch naming convention:

| Type     | Format                         | Example                      |
| -------- | ------------------------------ | ---------------------------- |
| Feature  | `feature/<name>`               | `feature/attendance-reports` |
| Bugfix   | `fix/<issue-id-or-short-desc>` | `fix/leave-calc-bug`         |
| Refactor | `refactor/<scope>`             | `refactor/authentication`    |

Always branch off from `main` (or `dev` if specified).

---

## ✍️ Commit Message Convention

Use clear, conventional commit messages:

```
feat: add new attendance calendar filter
fix: resolve incorrect payroll total
docs: update API reference
chore: update dependencies
```

---

## 🎯 Guidelines for Contributions

### 🧪 Code Quality

* Follow existing **coding standards** (TypeScript, Tailwind utility classes, clean React practices).
* Validate inputs and handle errors securely.
* Write modular, reusable code.
* Remove `console.log()` before committing.

### 📦 Testing

* Add tests for any new behavior (Vitest is included).
* Ensure existing tests pass:

  ```bash
  npm test
  ```

---

## 🚨 Pull Request Process

1. Create pull request against the **main branch**.
2. Title should be clear, e.g. `feat: add bulk attendance export`.
3. Describe **what changed** and **why it matters**.
4. Link related GitHub issue if available.
5. Wait for review — maintainers might request changes.

---

## 🐛 Reporting Issues

If you find bugs or want to suggest improvements:

1. Go to **Issues** tab in the repo.
2. Click **New issue**.
3. Provide:

   * **Title**
   * **Steps to reproduce**
   * **Expected vs actual behavior**
   * **Screenshots / logs** (optional but helpful)

---

## 📀 Code of Conduct

Be respectful, constructive, and collaborative.
This is an open project — help it grow with positivity and professionalism.

---

## 🎉 Thank you!

By contributing, you help **Dayflow_HRMS** become better and more reliable for everyone 🙌
We appreciate your efforts!
