
module.exports = function() {
 
  const url = process.env.DATABASE_URL 
  mongoose.set("useFindAndModify", false);
  mongoose.set("useCreateIndex", true);
  mongoose.set("useUnifiedTopology", true);

  mongoose
    .connect(url, {
      useNewUrlParser: true
    })
    .then(() => console.log(`Connected to Database...`));
};
