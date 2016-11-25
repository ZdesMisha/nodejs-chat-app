var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomSchema = new Schema({
    roomname: String,
    messages: [{
        name: String,
        message: String
    }]
});
var Room = mongoose.model('rooms', roomSchema);

module.exports = Room;
