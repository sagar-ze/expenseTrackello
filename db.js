
const mongoose = require('mongoose');

module.exports = function () {
  const db = `mongodb+srv://trello:trello@cluster0.wxdym.mongodb.net/trello?retryWrites=true&w=majority`
  mongoose.set('useFindAndModify', false);
  mongoose.set('useCreateIndex', true);
  mongoose.set('useUnifiedTopology', true );
  mongoose.connect(db, {
      useNewUrlParser: true
    })
    .then(() => console.log(`Connected to Database...`));
}