var db, ShortID, mongoose;

/**
  Initialize the plugin, create the short id collection and model
 **/
exports.init = function(database, opts) {
	
	// Set module variables
	db = database;
	opts = opts || {};
	mongoose = opts.mongoose || require('mongoose');

	var collectionName = opts.collection || 'shortids',
		schema = new mongoose.Schema({
			category: {
				type:    String,
				require: true
			},
			key: {
				type:    String,
				require: true
			},
			counter: {
				type:      Number,
				'default': 0
			}
		});

	schema.index({ key: 1, category: 1 }, { unique: true, required: true, index: -1 });
	ShortID = db.model(collectionName, schema);
}

/**
  Plugin the short ID
 **/
exports.plugin = function(schema, options) {

	if (!options.category) throw new Error('ShortID category required');

	options.category = options.category.toLowerCase();
	options.key = options.key || 'sid';
	options.start = (!isNaN(options.start)) ? options.start : 0;

	var fields = {},
		ready  = false,
		query = { category: options.category, key: options.key },
		serializer = options.serializer || 'simple';

	if (typeof serializer === 'string') {
		try {
			serializer = require('./serializers/' + serializer);
		} catch (e) {
			throw new Error('Invalid serializer');
		}
	} else if (typeof serializer !== 'function') {
		throw new Error('Serializer must be either a function or a valid prebuilt serializer type');
	}

	// Adding new field into schema
	fields[options.key] = {
		type:    String,
		unique:  true,
		require: true,
		index: true
	};
	schema.add(fields);

	// Initializing of plugin
	ShortID.findOne(query, function (err, res) {
		if (!res)
			(new ShortID({
				category: options.category,
				key: options.key,
				counter:     options.start
			})).save(function () {
				ready = true;
			});
		else
			ready = true;
	});

	schema.pre('save', function (next) {

		var doc = this;

		// Check if the key is already set
		if (doc[options.key]) {
			return next();
		}

		// Delay before plugin will be sucessfully initialized
		function save () {

			if (ready)
				ShortID.collection.findAndModify(query, [], {
					$inc: {
						counter: 1
					}
				}, {
					'new':  true,
					upsert: true
				}, function (err, res) {

					if (!err) {
						doc[options.key] = serializer(res.value.counter - 1, doc);
					}
					next(err);
				});
			else
				setTimeout(save, 5);
		}
		save();
	});
};
