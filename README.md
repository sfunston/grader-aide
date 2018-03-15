# README #

### Team Milestone Checklist ###

    [x] save (storing the json) via axios
    [x] recover/restore deleted rule in memory stack
    [x] edit rule
    [x] edit name
    [x] edit totalPts
    [x] list of comments (no points up or down)
    [x] edit list of comments (no points up or down)
    [x] delete list of comments/recovering
    [x] create a new assignment

### Setting up Git ###
    1. Install git if you haven't already - https://git-scm.com/download/win

    2. Add repository
    git remote add origin https://<username>@bitbucket.org/sfunston/grader-aide.git

    3. Change to desired local src directory
    cd /my/src/folder

    4. Do initial pull to get files (same command for subsequent pulls)
    git pull -u origin master

    For subsequent commits
    git commit -m "Comment for this commit"
    git push -u origin master
    
    To add a file to git for tracking:
    git add <filename>