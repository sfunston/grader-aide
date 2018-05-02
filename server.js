console.log('\nLoading Server');

const PORT = 8080;

const mongoEnabled = true; // false will resort to reading/storing files on server's local filesystem

// load modules
const express = require('express');
const logger = require('morgan');
const compression = require('compression');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const fs = require('fs');
const assert = require('assert');
const mongo = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const session = require('express-session');

const mongoUrl = 'mongodb://cloud9:2MJp3b3DpMmN7W48@mongo.parkerhill.me:27017/test';
const webRoot = path.join(__dirname, 'client');

let sessions = [];
let authorizedStudents = [];
let authorizedGraders = [];

// create express server
const server = express();

// have express server use middleware
server.use(favicon(path.join(webRoot, 'favicon.ico')));
server.use(logger('dev'));
server.use(compression());
server.use(bodyParser.urlencoded({ extended: false })); //serverlication/x-www-form-urlencoded
server.use(bodyParser.json()); //serverlication/json
server.use(helmet());
//server.use(express.static(webRoot)); // commented to prevent direct file access
server.use(session({ secret: 'gra1d3rA1d3', cookie: { maxAge: 3600000 }})); // used for tracking user login sessions - 3600000 = 1 hour

// Use connect method to connect to the server
let mongoClient;
let docs, assignments, classes, users;
mongo.connect(mongoUrl, function(err, client) {

    mongoClient = client;
    assert.equal(err, null);

    // Define working databases
    docs = mongoClient.db('documents'); // test database
    assignments = mongoClient.db('assignments'); // stores class assignments
    classes = mongoClient.db('classes'); // stores information about classes
    users = mongoClient.db('users'); // used for authenticating users

    console.log('Connected successfully to database');
});

///////////////
// FUNCTIONS //
///////////////

var insertDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('documents');
    // Insert some documents
    collection.insertMany([
        { a: 1 }, { a: 2 }, { a: 3 }
    ], function(err, result) {
        assert.equal(err, null);
        assert.equal(3, result.result.n);
        assert.equal(3, result.ops.length);
        console.log("Inserted 3 documents into the collection");
        callback(result);
    });
}
var emptyDatabase = function(db, callback) {

    const collection = db.collection('users');

    collection.deleteMany({}, function(err, result) {

        assert.equal(err, null);
        callback(result);

    });

}
var registerUser = function(user, db, callback) {

    const collection = db.collection('users');
    // Insert some documents
    collection.update(user, user, { upsert: true }, function(err, result) { // by using "update", you eliminate possibility of creating duplicate DB entries
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        console.log(`User ${user.name} registered`);
        callback(result);
    });

    /*
    collection.insert(user, function(err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      console.log(`User ${user.name} registered`);
      callback(result);
    });    
    */

}
var listUsers = function(db, callback) {

    const collection = db.collection('users');
    collection.find({}).toArray(function(err, result) {
        assert.equal(err, null);
        callback(result);

    });

}
function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 8; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

/*
var checkUser = function(user, db, callback) {
    
    const collection = db.collection('users');

    var result = collection.find({"name": user.name}).toArray();
    if(result.length > 0) {
        callback(true);
    } else {
        callback(false);
    }
    
}
*/

//TODO 7 add course CRUD
//TODO 9 spike solution for MongoDB CRUD, 
//       admin console
//       mongoose, crest

// C)reate R)ead U)pdate D)elete

////////////
// CREATE //
////////////


//////////
// READ //
//////////

// R)ead session info
server.get('/session', function(req, res) {
    
    // If session is tracked, show info
    if(sessions.indexOf(req.session.id) >= 0) {
        
        res.send(`Session is being tracked: ${JSON.stringify(req.session)} ID: ${JSON.stringify(req.session.id)}`);
        
    }
    
    // If session is not tracked, show info
    else {
        
        res.send(`Session is NOT tracked: ${JSON.stringify(req.session)}`);
        
    }
    
});

// R)ead default assignment - REQUIRES AUTH Student|Grader
server.get('/api/v1/assignments/default', function(req, res) {
    
    if(authorizedStudents.indexOf(req.session.id) >= 0 || authorizedGraders.indexOf(req.session.id) >= 0) {
    
    /* LOAD FROM MONGO */
    if(mongoEnabled) {
        
        const collection = assignments.collection('assignments');
        collection.find({}).toArray(function(err, result) {
            
            
            if(err) {
                
                res.status(500).send("Could not read from database");
                
            }
            
            else {
                
                res.writeHead(200, {
                
                    'Content-Type': 'text/json',
                    'Access-Control-Allow-Origin': '*',
                    'X-Powered-By': 'nodejs'
                    
                });
                
                res.write(result);
                res.end();
                
            }
            
        });

        
    }
    
    /* LOAD FROM FILE */
    else {
        
        fs.readdir(path.join(__dirname, 'client', 'assignments'), (err, files) => {
            
            if (err) {
                res.status(500).send('Server could not read assignments directory.');
            }
    
            let fileList = { assignments: [] };
            files.forEach(file => {
                
                if (file.indexOf('.json') > -1) {
                    
                    fileList.assignments.push(file);
                    
                }
                
            });
    
            // Get the first file
            fs.readFile(path.join(__dirname, 'client', 'assignments', fileList.assignments[0]), function(err, content) {
                
                res.writeHead(200, {
                    'Content-Type': 'text/json',
                    'Access-Control-Allow-Origin': '*',
                    'X-Powered-By': 'nodejs'
                });
                if (err) {
                    console.log(err);
                }
                res.write(content);
                res.end();
                
            });
    
        });
        
    }
    
    }
    
    else {
        
        res.status(403).send('Not authorized');
        
    }
    
});

// R)ead assignment - REQUIRES AUTH Student|Grader
server.get('/api/v1/assignments/:name', function(req, res) {
    
    if(authorizedStudents.indexOf(req.session.id) >= 0 || authorizedGraders.indexOf(req.session.id) >= 0) {
        
        if (req.params.name != 'null') {
            
            /* LOAD FROM MONGO */
            if(mongoEnabled) {
                
                const collection = assignments.collection('assignments');
                collection.find({}).toArray(function(err, result) {
                    
                    if(err) {
                        
                        res.status(500).send("Could not read from database");
                        
                    }
                    
                    else {
                        
                        res.writeHead(200, {
                        
                            'Content-Type': 'text/json',
                            'Access-Control-Allow-Origin': '*',
                            'X-Powered-By': 'nodejs'
                            
                        });
                        
                        res.write(result);
                        res.end();
                        
                    }
                    
                });
    
                
            }
            
            /* LOAD FROM FILE */
            else {
             
                fs.readFile(path.join(__dirname, 'client', 'assignments', `${req.params.name}.json`), function(err, content) {
    
                    assert.equal(err,null);
                    
                    res.writeHead(200, {
                        'Content-Type': 'text/json',
                        'Access-Control-Allow-Origin': '*',
                        'X-Powered-By': 'nodejs'
                    });
    
                    res.write(content);
                    res.end();
                    
                });
                
            }

        }
        else {
            res.status(404).send('<null> file requested!');
        }
    }
    
    else {
        
        res.status(403).send('Not authorized');
        
    }

})

// R)ead assignments - REQUIRES AUTH Student|Grader
server.get('/api/v1/assignments', function(req, res) {
    
    if(authorizedStudents.indexOf(req.session.id) >= 0 || authorizedGraders.indexOf(req.session.id) >= 0) {
    
        /* LOAD FROM MONGO */
        if(mongoEnabled) {
            
            const collection = assignments.collection('assignments');
            collection.find({}).toArray(function(err, result) {
                
                if(err) {
                    
                    res.status(500).send("Could not read from database");
                    
                }
                
                else {
                    
                    res.writeHead(200, {
                    
                        'Content-Type': 'text/json',
                        'Access-Control-Allow-Origin': '*',
                        'X-Powered-By': 'nodejs'
                        
                    });
                    
                    res.write(result);
                    res.end();
                    
                }
                
            });
            
        }
        
        
        /* LOAD FROM FILE */
        else {
         
            fs.readdir(path.join(__dirname, 'client', 'assignments'), (err, files) => {
                if (err) {
                    res.status(500).send('Server could not read assignments directory.');
                }
        
                let fileList = { assignments: [] };
                files.forEach(file => {
                    if (file.indexOf('.json') > -1) {
                        fileList.assignments.push(path.basename(file, '.json'));
                    }
                });
        
                res.status(200).send(JSON.stringify(fileList));
        
            });
            
        }
    
    }
    
    else {
        
        res.status(403).send('Not authorized');
        
    }

});

// R)ead users - REQUIRES AUTH Grader
server.get('/users', function(req, res) {
    
    if(authorizedGraders.indexOf(req.session.id) >= 0) {

        listUsers(users, function(userlist) {
    
            res.status(200).send(JSON.stringify(userlist));
    
        });
        
    }
    
    else {
        
        res.status(403).send('Not authorized');
        
    }

});


////////////
// UPDATE //
////////////

// U)pdate session info
server.post('/session', function(req, res) {
    
    // If session is not already tracked, track it
    if(sessions.indexOf(req.session.id) < 0) {
        req.session.id = makeid();
        sessions.push(req.session.id);
        res.send(`Added user session`);
    } 
    // Else, ignore
    else {
        res.send(`Session already exists`);
    }
    
});

// U)pdate register & login
server.post('/login', function(req, res) {

    if (req.body.username && req.body.group && req.body.password) {

        var user = new Object();
        user.name = req.body.username;
        user.group = req.body.group;
        user.pass = req.body.password;
        
        //console.log(`Name: ${req.body.username} Pass: ${req.body.password} Reg: ${req.body.register} Group: ${req.body.group}`);
        
        // REGISTRATION (if checked)
        if (req.body.register) { // if checkbox checked, register user instead
            registerUser(user, users, function() {
                res.status(200).send(`Registered user ${user.name}`);
            });
        }
        
        // AUTHENTICATION & AUTHORIZATION (for existing users)
        // TODO - Salt and hash passwords. Maybe use more complicated means of generating session IDs to prevent spoofing.
        else {
            listUsers(users, function(userlist) {
                let status = 0;
                userlist.forEach(function(dbuser) {
                    if (dbuser.name == user.name) {
                        
                        status = 1; // user found
                        
                        if (dbuser.group == user.group) {
                            status = 2; // group valid
                            
                            if(dbuser.pass == user.pass) {
                                status = 3; // password correct - add session to authorized list!
                                
                                req.session.id = makeid();
                                if(user.group == 'grader') {
                                    
                                    authorizedGraders.push(req.session.id);
                                    
                                } else {
                                    
                                    authorizedStudents.push(req.session.id);
                                    
                                }
                            }
                        }

                    }
                });
                
                switch(status) {
                    case 0:
                        res.status(403).send(`User does not exist`);
                        break;
                    case 1:
                        res.status(403).send(`${user.name} is not a ${user.group}`);
                        break;
                    case 2:
                        res.status(403).send(`Incorrect password`);
                        break;
                    case 3:
                        // Successful login. Redirect user to appropriate page (root router handles this)
                        res.status(200).send(`Redirecting...`);
                        //res.status(304).redirect('/');
                        // res.status(200).send(`Login success. User ${user.name} as ${user.group}`);
                        break;
                    default:
                        res.status(500).send(`Server error`);
                        break;
                }

            });
        }



    }

});

// U)pdate assignment - REQUIRES AUTH Grader
server.post('/api/v1/assignments/:name', function(req, res) {
    
    if(authorizedGraders.indexOf(req.session.id) >= 0) {
        
        let json = {
            name: req.params.name,
            totalPts: req.body.totalPts,
            rules: req.body.rules,
            selectedRules: req.body.selectedRules,
            comments: req.body.comments
        };
        
        /* SAVE TO MONGO */
        if(mongoEnabled) {
            
            const collection = assignments.collection('assignments');
            
            // Insert some documents
            collection.update(json, json, { upsert: true }, function(err, result) { // by using "update", you eliminate possibility of creating duplicate DB entries
            
                assert.equal(err, null);
                
                console.log(`Updated assignment: ${result}`);
                
            });
            
        }
        
        /* SAVE TO FILE */
        else {
            
            let filename = `${req.params.name}.json`;
        
            fs.writeFile(path.join(__dirname, 'client', 'assignments', filename), JSON.stringify(json), 'utf8', (err) => {
                
                if (err) {
                    res.status(500).send('Server could not save file.');
                    return;
                }
                res.status(200).send('Server saved file successfully.');
                
            });
            
        }
    
    }
    
    else {
        
        res.status(403).send('Not authorized');
        
    }


});


////////////
// DELETE //
////////////

// D)elete users - REQUIRES AUTH Grader
server.post('/empty', function(req, res) {
    
    if(authorizedGraders.indexOf(req.session.id) >= 0) {
        
        emptyDatabase(users, function() {
            
            res.status(200).send('Success!');
            
        });
        
    }
    else {
        
        res.status(403).send('Not authorized');
        
    }

});

server.get('/logout', function(req, res) {
    
    let authGraderIndex = authorizedGraders.indexOf(req.session.id);
    let authStudentIndex = authorizedStudents.indexOf(req.session.id);
    
    // If user is actually logged in, delete that 
    if(authGraderIndex >= 0) {
        
        authorizedGraders.splice(authGraderIndex, 1);
        
    }
    
    if(authStudentIndex >= 0) {
        
        authorizedStudents.splice(authStudentIndex, 1);
        
    }
    
    res.status(200).redirect('/'); // return to login screen
    
})







// R)ead static defaults
server.get('/', (req, res) => {
    
  // If logged in, send to appropriate dashboard
  if (authorizedGraders.indexOf(req.session.id) >= 0) {
      res.status(200).sendFile(path.join(webRoot, 'grader.html'));
  }
  else if (authorizedStudents.indexOf(req.session.id) >= 0) {
      res.status(200).sendFile(path.join(webRoot, 'student.html'));
  }
  // If not logged in, send to login page
  else {
      res.status(200).sendFile(path.join(webRoot, 'login.html'));
  }
  
});

server.get('*', (req, res) => {
    
    // Allowed servable static content directories
    let allowedStatic = ['/assignments','/css','/js','/img'];
    if(allowedStatic.indexOf(path.dirname(req.url)) > 0) {
        res.status(200).sendFile(path.join(webRoot, req.url));
        return;
    }
    
    res.status(404).sendFile(path.join(webRoot, '404.html'));
    
});


server.listen(PORT);

function gracefulShutdown() {
    console.log('\nStarting Shutdown');
    server.close(() => console.log('\nShutdown Complete'));
}
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
