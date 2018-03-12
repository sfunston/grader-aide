console.log('\nLoading Server');

// load modules
let express = require('express');
let logger = require('morgan');
let compression = require('compression');
let favicon = require('serve-favicon');
let bodyParser = require('body-parser');
let path = require('path');
let fs = require('fs');

//TODO security

let app = express();

// express middleware
app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'client', 'favicon.ico')));

//GET IT WORKING
//3. how to get uvu's real favicon.ico?
//4. use it
//5. clean up/remove the file(s)

//GET IT RIGHT
//6. ask nodeJs for the OS path separator and use it
//7. can we do better?

//GET IT FAST
//8. why don't we need to worry about faster in this specific case?

//9. 

app.use(compression());
//for mime type application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
//for mime type application/json
app.use(bodyParser.json());

//TODO handle REST stuff

app.use(express.static(path.join(__dirname, 'client')));

// Load list of assignments
app.get('/api/v1/assignments', function(req, res) {
    fs.readdir(path.join(__dirname, 'client', 'assignments'), (err, files) => {
        if (err) {
            res.status(500).send('Server could not read assignments directory.');
        }
        
        let fileList = {assignments: []};
        files.forEach(file => {
            if (file.indexOf('.json') > -1) {
                fileList.assignments.push(path.basename(file,'.json'));
            }
        });

        res.status(200).send(JSON.stringify(fileList));
        
    });
    
});

app.get('/api/v1/assignments/:name', function(req, res) {
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

    } else {
        res.status(404).send('Requested assignment does not exist!');
    }

})

// Save single file
app.post('/api/v1/assignments/:name', function(req, res) {
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

app.get('*', function(req, res) {
    res.status(404).send(`You asked for a file that doesn't exist. You are a hoser.`);
});


app.listen(8080);
