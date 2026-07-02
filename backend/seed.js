const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const Task = require('./models/Task');
const User = require('./models/User');

const seedTasks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find your existing user (replace with your actual username if different)
    const user = await User.findOne({ username: 'chirag' });

    if (!user) {
      console.log('User not found. Update the username in seed.js to match an existing user.');
      process.exit(1);
    }

    const tasksToCreate = [];
    for (let i = 0; i < 200; i++) {
      tasksToCreate.push({
        title: faker.hacker.phrase(), // generates realistic-sounding task titles
        completed: faker.datatype.boolean(),
        user: user._id,
        createdAt: faker.date.recent({ days: 90 }),
      });
    }

    await Task.insertMany(tasksToCreate);
    console.log(`Inserted ${tasksToCreate.length} fake tasks for user "${user.username}"`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedTasks();