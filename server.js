var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

//GET /todos
app.get('/todos', function (req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		//filteredTodos = _.where(filteredTodos, {completed: true});
		filteredTodos = _.filter(filteredTodos, function (element) {
			return element.completed == true;
		});
	}
	else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, { completed: false });
	}

	res.json(filteredTodos);//convert to json
});

//GET /todos/:id
app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	
	db.todo.findById(todoId).then(function(todo){
		if(todo){
			res.json(todo.toJSON());
		}
		else{
			res.status(404).send();
		}
	}, function(e){
		res.status(500).send();
	});
	/*var matchedTodo = _.findWhere(todos, { id: todoId });

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}*/

});

// POST /todos
app.post('/todos', function (req, res) {
	var body = _.pick(req.body, "description", "completed"); //which parameters will be posted
	
	db.todo.create(body).then(function(todo){
		res.json(todo.toJSON());
	}, function(e){
		res.status(400).json();
	});
});

//DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, { id: todoId });

	if (matchedTodo) {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}
	else {
		return res.status(404).json({ 'error': 'no todo found with that id' });
	}

});

//PUT /todos/:id
app.put('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, { id: todoId });
	var body = _.pick(req.body, "description", "completed"); //which parameters will be posted
	var validAttributes = {};

	if (!matchedTodo) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	_.extend(matchedTodo, validAttributes);//copy object into object
	
	res.json(matchedTodo);
});

db.sequelize.sync().then(function () {
	app.listen(PORT, function () {
		console.log('Express listening on port ' + PORT + '!');
	});
});

