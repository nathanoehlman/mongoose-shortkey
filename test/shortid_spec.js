var mongoose = require('mongoose'),
    should = require('chai').should(),
    shortid = require('..');
    
describe('Mongoose ShortID', function(){
    
    var db;

    before(function(done) {
        db = mongoose.createConnection('127.0.0.1', 'shortid_test');
        shortid.init(db);
        return done();
    });

    it('should be able to save a short ID', function(done) {

        var schema = new mongoose.Schema({});
        schema.plugin(shortid.plugin, { category: 'TestDocument' });

        var TestDocument = db.model('TestDocuments', schema),
            newDoc = new TestDocument({});

        newDoc.save(function(err, saved) {
            if (err) return done(err);
            if (!saved.sid) return done('No short ID saved');
            return done();
        });        
        
    });

    it('should be able to save a custom short ID', function(done) {

        var schema = new mongoose.Schema({});
        schema.plugin(shortid.plugin, { category: 'CustomDocument', serializer: function(counter, doc) { return 'custom-' + counter; } });

        var CustomDocument = db.model('CustomDocuments', schema),
            newDoc = new CustomDocument({});

        newDoc.save(function(err, saved) {
            if (err) return done(err);
            if (!saved.sid) return done('No short ID saved');

            if (saved.sid.indexOf('custom-') == -1) return callback('Custom short ID failed');
            return done();
        });
    });
    
});