# mongoose-shortid

A simple plugin to allow shorter, indexed IDs for Mongoose documents. Useful for REST APIs, generating sequential numbers, etc...

## Usage ##

Initialise the plugin with the connection to your Mongo database

```
	var mongoose = require('mongoose'),
		shortid = require('mongoose-shortid'),
		db = mongoose.createConnection(...);

	shortid.init(db);

```

Then add to a model

```

	var schema = new mongoose.Schema({});
    schema.plugin(shortid.plugin, { category: 'MyModel' });

```

This will create a field called `sid` on each newly created document that contains it's sequential ID.


## More ##

You can alter the field name, and the way the count is serialized through passing in additional options via the plugin call.

More details soon