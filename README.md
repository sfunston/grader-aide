# README #

### REST Contract ###
https://goo.gl/Y846mt

### Final Project ###
    Client
    [] Vue routing
    [] Copy assignment (clipboard.js)
    [] Testing (selenium)
    [] Authentication
    [] Student view and Grader View
    [] Grader must be able to add, delete, change, and list assignments in course
    
    Server
    [] Testing
          - positive and negative test
          - Mocha + Chai (+ Sinon TBD)
          - Must test REST (supertest)
    [] MongoDB running in a Docker container
    [] Routers used by app.js
          - router serving files from public
          - router serving course REST via Mongo collections
          - router serving assignment REST via Mongo Documents within a collection
    [] Security
    [] Authentication, how is up to you
    [] Vue CLI/single page components

    Repo
    [] Github
          - all code
          - readme with example code and/or usage

    All assigned two weeks before the semester ends!

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
    git remote add origin https://github.com/sfunston/grader-aide.git

    3. Change to desired local src directory
    cd /my/src/folder

    4. Do initial pull to get files (same command for subsequent pulls)
    git pull -u origin master

    For subsequent commits
    git commit -m "Comment for this commit"
    git push -u origin master
    
    To add a file to git for tracking:
    git add <filename>
