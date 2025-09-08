# Team GitHub Workflow

This is a simple workflow guide for how we’ll work together on this project.   
---

## 🛠️ Setup (One-Time Only)

1. **Install Git**  
   Download and install Git for Windows:  
   [Git-2.51.0-64-bit.exe](https://github.com/git-for-windows/git/releases/download/v2.51.0.windows.1/Git-2.51.0-64-bit.exe)

2. **Set your Git identity** (do this once on your computer):  
   ```bash
   git config --global user.name "your_github_username"
   git config --global user.email "your_email@example.com"
   ```
   
--------------------------------------------------------------------------

🔄 Workflow (Every Time You Work on the Project)

1️⃣ Clone the repository (first time only per machine)
```bash
git clone https://github.com/SalmaKhalil2/DIGITOPIA.git
cd DIGITOPIA
```

2️⃣ Create a new branch for your work
Replace member_name with your name or the feature name:
```bash
git checkout -b member_name
```

3️⃣ Work on your files
Make changes locally, then stage them:
```bash
git add .
```

4️⃣ Commit your changes
Use a clear commit message describing your update:
```bash
git commit -m "Describe your update"
```

5️⃣ Push your branch to GitHub
```bash
git push origin member_name
```
---------------------------------------------------------------------------------

🔄 Keeping Your Branch Updated

1.Switch to the main branch:
```bash
git checkout main
```
2.Pull the latest updates:
```bash
git pull origin main
```
3.Go back to your branch:
```bash
git checkout member_name
```
4.Rebase your work on top of the latest main:
```bash
git rebase main
```
--------------------------------------------------------------------------

🔀 Submitting Your Work

1.Go to GitHub.
2.Open a Pull Request from your branch into main.
3.We’ll review each other’s code and then merge.

