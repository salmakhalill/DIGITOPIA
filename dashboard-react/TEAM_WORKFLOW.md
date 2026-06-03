# Team GitHub Workflow

This is a simple workflow guide for how we’ll work together on this project.   
---
## 🛠️ 1. One-Time Setup (First time only on your laptop)

1. **Install Git**  
   Download and install Git for Windows:  
   [Git-2.51.0-64-bit.exe](https://github.com/git-for-windows/git/releases/download/v2.51.0.windows.1/Git-2.51.0-64-bit.exe)

   > 💡 After installation:  
   > Go to the folder where you want to download the repository, then **right-click**:  
   > - On some Windows versions → `Show more options` → **Open Git Bash here**  
   > - On others → you’ll see **Open Git Bash here** directly in the menu

2. **Configure your Git identity** (do this once on your computer):  
   ```bash
   git config --global user.name "your_github_username"
   git config --global user.email "your_email@example.com"
   ```
------------------------------------------------------------

## 🔄 2. Start Working (First time on each device)
Clone the repository:
```bash
git clone https://github.com/SalmaKhalil2/DIGITOPIA.git
cd DIGITOPIA
```
------------------------------------------------------------

## 🌱 3. Daily Workflow (Every time you work)

***👉 Create/Switch to your branch***

**First time only (create new branch):**
```bash
git checkout -b your_name_or_feature
```

**1. After that (just switch to it):**
```bash
git checkout your_name_or_feature
```

***👉 Make your changes***
Edit/add files locally.

**2. Stage changes:**
```bash
git add .
```

**3. Commit with a clear message:**
```bash
git commit -m "Add login page"   # example
```

**4. Push your branch to GitHub:**
```bash
git push origin your_name_or_feature
```
-----------------------------------------------------------

## 🔄 4. Keep Your Branch Updated (Important!)

**1. Switch to main:**
```bash
git checkout main
```

**2. Pull the latest updates:**
```bash
git pull origin main
```

**3. Switch back to your branch:**
```bash
git checkout your_name_or_feature
```

**4. Rebase your branch on top of main:**
```bash
git rebase main
```
------------------------------------------------------------
## 🔀 5. Submitting Your Work

**1. Go to GitHub.**

**2. Open a Pull Request from your branch → main.**

**3. The team reviews your code.**

**4. After approval → Merge into main.**