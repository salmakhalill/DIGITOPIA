Team GitHub Workflow

This is a simple workflow guide for how we’ll work together on this project.

🛠️ 1. One-Time Setup (First time only on your laptop)

Install Git:
👉 Download Git for Windows

Configure your Git identity:

git config --global user.name "your_github_username"
git config --global user.email "your_email@example.com"

🔄 2. Start Working (First time on each device)

Clone the repository:

git clone https://github.com/SalmaKhalil2/DIGITOPIA.git
cd DIGITOPIA

🌱 3. Daily Workflow (Every time you work)
👉 Create/Switch to your branch

First time only (create new branch):

git checkout -b your_name_or_feature


After that (just switch to it):

git checkout your_name_or_feature

👉 Make your changes

Edit/add files locally.

Stage changes:

git add .


Commit with a clear message:

git commit -m "Add login page"   # example


Push your branch to GitHub:

git push origin your_name_or_feature

🔄 4. Keep Your Branch Updated (Important!)

Switch to main:

git checkout main


Pull the latest updates:

git pull origin main


Switch back to your branch:

git checkout your_name_or_feature


Rebase your branch on top of main:

git rebase main

🔀 5. Submitting Your Work

Go to GitHub.

Open a Pull Request from your branch → main.

The team reviews your code.

After approval → Merge into main.