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
app.use(favicon(path.join(__dirname,'client','favicon.ico')));

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
app.use(bodyParser.urlencoded({extended: false}));
//for mime type application/json
app.use(bodyParser.json());

//TODO handle REST stuff

app.use(express.static(`${__dirname}/client`)); 

app.get('*', function(req, res) {
  res.status(404).send(`You asked for a file that doesn't exist. You are a hoser.`)
})

app.post('/lab1', function(req, res) {
    let callback;
    let json = {
        name: req.body.name,
        totalPts: req.body.totalPts,
        rules: req.body.rules,
        comments: req.body.comments
    }
    fs.writeFile('lab1-test.json', JSON.stringify(json), 'utf8', callback);
    res.status(200).send(`Successfully written file.`);
})


app.listen(8080);