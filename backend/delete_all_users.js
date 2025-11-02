const mongoose = require('mongoose');
const User = require('./usermodel');

mongoose.connect('mongodb://127.0.0.1:27017/twinskill', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("Connected to MongoDB");
  
  // Delete all users
  const result = await User.deleteMany({});
  console.log(`Deleted ${result.deletedCount} user accounts`);
  
  mongoose.connection.close();
  console.log("Database connection closed");
}).catch((err) => {
  console.error("Error:", err);
});