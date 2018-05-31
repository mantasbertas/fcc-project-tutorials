var ObjectID = require('mongodb').ObjectID
var Request = require("request");
var htmlparser = require("htmlparser");
var wasBreached = false;
var breachCount = 0;
var last_breach_date = null;
var was_password_breached = false;
var date = new Date("1900-01-01");


const hibp = require ('haveibeenpwned') ();





module.exports = function(app, db) {



	app.get('/user/:id', (req, res) => {
		const id = req.params.id;
		const details = {'_id': new ObjectID(id) };
		db.collection('users').findOne(details, (err, item) => {
			if (err) {
				res.send({ 'error': 'An error has occured' });
			} else {
				res.send(item);
			}
		});
	});

/*
	hibp.breachedAccount ('snukumas@gmail.com', (err, data) => {
  if (err) {
    return console.log (err);
  }

  //console.log (data[0]);
	if (Object.keys(data).length > 0 ){
		wasBreached = true;
	}
	var date = new Date("1900-01-01");
	for (let i=0; i<Object.keys(data).length; i++){
	//	console.log(data[i].BreachDate);
		for (let j=0; j<Object.keys(data[i].DataClasses).length; j++){
			if(data[i].DataClasses[j] === "Passwords"){
				was_password_breached = true;
			}
		}
		if (new Date(data[i].BreachDate)>date){
			date = new Date(data[i].BreachDate);

		}

	}
	console.log(wasBreached);
	console.log(date.toString());
	console.log(was_password_breached);
}); */


	/*Request.get("https://haveibeenpwned.com/api/breachedaccount/snukumas@gmail.com", (error, response, body) => {
    if(error) {
        return res.send(error);
    }
		var jsonContent = body;
		console.log(body);
    //res.send(JSON.parse(body));

		//res.send(current_usd);
});*/

	app.delete('/user/:id', (req, res) => {
		const id = req.params.id;
		const details = {'_id': new ObjectID(id) };
		db.collection('users').remove(details, (err, item) => {
			if (err) {
				res.send({ 'error': 'An error has occured' });
			} else {
				res.send('User ' + id + ' deleted!');
			}
		});
	});

	app.put('/user/:id', (req, res) => {
		const id = req.params.id;
		const details = {'_id': new ObjectID(id) };
		const note = { email: req.body.email };
		db.collection('users').update(details, note, (err, item) => {
			if (err) {
				res.send({ 'error': 'An error has occured' });
			} else {
				res.send('Email has been changed to '+ req.body.email);
			}
		});
	});




	app.post('/user', (req, res) => {

		hibp.breachedAccount (req.body.email, (err, data) => {
	  if (err) {
	    return console.log (err);
	  }

	  //console.log (data[0]);


		if (Object.keys(data).length > 0 ){
			wasBreached = true;
		}

		for (let i=0; i<Object.keys(data).length; i++){
		//	console.log(data[i].BreachDate);
			for (let j=0; j<Object.keys(data[i].DataClasses).length; j++){
				if(data[i].DataClasses[j] === "Passwords"){
					was_password_breached = true;
				}
			}
			if (new Date(data[i].BreachDate)>date){
				date = new Date(data[i].BreachDate);

			}

		}

		//for (let i=0; i<Object.keys(data).length; i++){
		//}

		console.log(wasBreached);
		breachCount = Object.keys(data).length;
		console.log(breachCount);
		console.log(was_password_breached);
	});

		console.log(breachCount);
		last_breach_date = date;
		const note = { email: req.body.email, was_Breached: wasBreached, breach_Count:breachCount, was_password_breached:was_password_breached, last_breach_date:date };
		db.collection('users').insert(note, (err, result) => {
			if (err) {
				res.send({ 'error': 'An error has occured' });
			} else {
				res.send(result.ops[0]);
				breachCount = 0;
				wasBreached = false;
				was_password_breached = false;
			}
		});
	});
};
