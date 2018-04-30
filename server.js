console.log('\nLoading Server');

const PORT = 8080;

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

const mongoUrl = 'mongodb://cloud9:2MJp3b3DpMmN7W48@mongo.parkerhill.me:27017/test';

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

    console.log('Connected successfully to server');
});

const insertDocuments = function(db, callback) {
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

var listUsers = function(db, callback) {

    const collection = db.collection('users');
    collection.find({}).toArray(function(err, result) {
        assert.equal(err, null);
        callback(result);

    });

}

// TODO 15 horsefeathers

// create express server
const server = express();

const webRoot = path.join(__dirname, 'client');

// have express server use middleware
server.use(favicon(path.join(webRoot, 'favicon.ico')));
server.use(logger('dev'));
server.use(compression());
server.use(bodyParser.urlencoded({ extended: false })); //serverlication/x-www-form-urlencoded
server.use(bodyParser.json()); //serverlication/json
server.use(helmet());

server.use(express.static(webRoot));

//TODO handle REST stuff
/*

//TODO 7 add course CRUD
//TODO 9 spike solution for MongoDB CRUD, 
//       admin console
//       mongoose, crest

//C)reate 
//TODO 13 mongo
app.post('/api/v1/:courseId', function(req, res) {
  const courseId = req.params.courseId;
  res.status(404).sendFile(path.join(webRoot, '404.html'));
});

//R)ead 
//TODO 10 mongo
app.get('/api/v1/:courseId/:assignmentId', function(req, res) {
  const courseId = req.params.courseId;
  const assignmentId = req.params.assignmentId;
  console.log(courseId, assignmentId);
  res.status(404).sendFile(path.join(webRoot, '404.html'));
});

//U)pdate 
//TODO 12 mongo
app.put('/api/v1/:courseId/:assignmentId', function(req, res) {
  const courseId = req.params.courseId;
  const assignmentId = req.params.assignmentId;
  res.status(404).sendFile(path.join(webRoot, '404.html'));
});

//D)elete 
//TODO 11 mongo
app.delete('/api/v1/:courseId/:assignmentId', function(req, res) {
  const courseId = req.params.courseId;
  const assignmentId = req.params.assignmentId;
  res.status(404).sendFile(path.join(webRoot, '404.html'));
});

app.use(express.static(webRoot));
app.get('*', (req, res) =>{
  res.status(404).sendFile(path.join(webRoot, '404.html'));
});

*/

// Load list of assignments
server.get('/api/v1/assignments', function(req, res) {
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

});

server.get('/api/v1/assignments/default', function(req, res) {
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
});

server.get('/api/v1/assignments/:name', function(req, res) {
    if (req.params.name != 'null') {
        fs.readFile(path.join(__dirname, 'client', 'assignments', `${req.params.name}.json`), function(err, content) {
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

    }
    else {
        res.status(404).send('Requested assignment does not exist!');
    }

})

// List users
server.get('/users', function(req, res) {

    listUsers(users, function(userlist) {

        res.status(200).send(JSON.stringify(userlist));

    });

});

// Register user
server.post('/login', function(req, res) {

    if (req.body.username && req.body.group && req.body.password) {

        var user = new Object();
        user.name = req.body.username;
        user.group = req.body.group;
        user.pass = req.body.password;
        
        console.log("Register: " + req.body.register);
        
        // REGISTRATION (if checked)
        if (req.body.register != undefined && req.body.register.length > 1) { // if checkbox checked, register user instead
            registerUser(user, users, function() {
                res.status(200).send(`Registration success. User ${user.name} registered.`);
            });
        }
        
        // AUTHENTICATION & AUTHORIZATION (for existing users)
        // TODO - Salt and hash passwords
        else {
            listUsers(users, function(userlist) {
                let status = 0;
                userlist.forEach(function(dbuser) {
                    if (dbuser.name == user.name) {
                        
                        status = 1; // user found
                        
                        if (dbuser.group == user.group) {
                            status = 2; // group valid
                            
                            if(dbuser.pass == user.pass) {
                                status = 3; // password correct
                            }
                        }

                    }
                });
                
                switch(status) {
                    case 0:
                        res.status(403).send(`Login fail. User ${user.name} does not exist!`);
                        break;
                    case 1:
                        res.status(403).send(`Login fail. User does not have ${user.group} permissions`);
                        break;
                    case 2:
                        res.status(403).send(`Login fail. Incorrect password for ${user.name}`);
                        break;
                    case 3:
                        res.status(200).send(`Login success. User ${user.name} as ${user.group}`);
                        break;
                    default:
                        res.status(500).send(`Server error`);
                        break;
                }

            });
        }



    }

});

// Empty users database
server.get('/empty', function(req, res) {
    emptyDatabase(users, function() {
        res.status(200).send("Success!");
    })
});

/*
// Process login
server.post('/login', function(req, res) {
    
    //DEBUGGING -- return res.status(200).send(`username ${req.body.username} group ${req.body.group} password ${req.body.password}`);

    if(req.body.username && req.body.group && req.body.password) {
        
        // AUTHENTICATE AND AUTHORIZE
        
    }
    
});
*/

// Save single file
server.post('/api/v1/assignments/:name', function(req, res) {
    let filename = `${req.params.name}.json`;
    let json = {
        name: req.params.name,
        totalPts: req.body.totalPts,
        rules: req.body.rules,
        selectedRules: req.body.selectedRules,
        comments: req.body.comments
    };

    fs.writeFile(path.join(__dirname, 'client', 'assignments', filename), JSON.stringify(json), 'utf8', (err) => {
        if (err) {
            res.status(500).send("Server could not save file.");
            return;
        }
        res.status(200).send("Server saved file successfully.");
    });
});

server.get('*', function(req, res) {
    res.status(404).send(`You asked for a file that doesn't exist. You are a hoser.`);
});

// Default route
server.get('*', (req, res) => {
    res.status(404).sendFile(path.join(webRoot, '404.html'));
});


server.listen(PORT);

function gracefulShutdown() {
    console.log('\nStarting Shutdown');
    server.close(() => console.log('\nShutdown Complete'));
}

process.on('SIGINT', gracefulShutdown);

process.on('SIGTERM', gracefulShutdown);
