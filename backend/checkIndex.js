const mongoose = require('mongoose');
require('dotenv').config();
const Task = require('./models/Task');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const result = await Task.find({ completed: false }).explain('executionStats');

  console.log('Execution time (ms):', result.executionStats.executionTimeMillis);
  console.log('Documents examined:', result.executionStats.totalDocsExamined);
  console.log('Documents returned:', result.executionStats.nReturned);
  console.log('Stage used:', result.executionStats.executionStages.stage);

  process.exit(0);
};

run();