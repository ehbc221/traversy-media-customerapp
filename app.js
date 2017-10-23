// Modules
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs')
var db = mongojs('customerapp', ['users']);
var ObjectId = mongojs.ObjectId;

// Constants
 var port = 3000;
 var APP_NAME = 'My Express App';

// Declare the Express app
var app = express();

/*
// Middlewares(Note: the order is imprtant: before the route)
var logger = function(req, res, next){
    console.log('Logging...');
    next();
};
app.use(logger);
*/

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set Static Path(for assets: CSS, JQuery, ...)
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Global Vars
app.use(function(req, res, next){
    res.locals.errors = null;
    next();
});

// Express Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Variables
var users = [
    {
        'id': 1,
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'johndoe@gmail.com'
    },
    {
        'id': 2,
        'first_name': 'Bob',
        'last_name': 'Smith',
        'email': 'bobsmith@gmail.com'
    },
    {
        'id': 3,
        'first_name': 'Jill',
        'last_name': 'Jackson',
        'email': 'jjackson@gmail.com'
    },
];

/**********
 * Routes *
**********/
app.get('/', function(req, res){
    db.users.find(function (err, docs){
        res.render('index', {
            app_name: APP_NAME,
            title: 'Customers',
            users: docs
        });
    });
});

app.post('/users/add', function(req, res){
    // Validator Rules
    req.checkBody('first_name', 'First Name is required').notEmpty();
    req.checkBody('last_name', 'Last Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    // Catch Errors
    var errors = req.validationErrors();
    if (errors){
        res.render('index', {
            app_name: APP_NAME,
            title: 'Customers',
            users: users,
            errors: errors
        });
    } else {
        
        var newUser = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email
        }
        db.users.insert(newUser, function(err, result){
            if(err){
                console.log(err);
            }
            res.redirect('/');
        });
        console.log('SUCCESS');
    }
});

app.delete('/users/delete/:id', function(req, res){
    db.users.remove({_id: ObjectId(req.params.id)}, function(err, result){
        if(err){
            console.log(err);
        }
        res.redirect('/');
    });
    console.log(req.params.id);
});

// Run the Express app
app.listen(port, function(){
    console.log('Server Started on Port 3000...');
});