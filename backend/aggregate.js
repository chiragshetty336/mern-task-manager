const mongoose = require('mongoose');
require('dotenv').config();
const Task = require('./models/Task');
const User = require('./models/User');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  // Find your user first
  const user = await User.findOne({ username: 'chirag' });

  // ─────────────────────────────────────────────
  // PIPELINE 1: Completed vs Pending count
  // ─────────────────────────────────────────────
  const completionStats = await Task.aggregate([
    { $match: { user: user._id } },           // Stage 1: only this user's tasks
    { $group: {                                // Stage 2: group by completed field
        _id: '$completed',                     // group key
        count: { $sum: 1 }                     // count documents in each group
    }},
    { $sort: { _id: 1 } }                      // Stage 3: sort (false first, then true)
  ]);

  console.log('── Pipeline 1: Completed vs Pending ──');
  completionStats.forEach(stat => {
    console.log(`${stat._id ? 'Completed' : 'Pending'}: ${stat.count} tasks`);
  });

  // ─────────────────────────────────────────────
  // PIPELINE 2: Tasks created per month
  // ─────────────────────────────────────────────
  const tasksByMonth = await Task.aggregate([
    { $match: { user: user._id } },
    { $group: {
        _id: {
          year:  { $year: '$createdAt' },       // extract year from date
          month: { $month: '$createdAt' }        // extract month from date
        },
        totalTasks: { $sum: 1 },
        completedTasks: { $sum: { $cond: ['$completed', 1, 0] } } // conditional sum
    }},
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  console.log('\n── Pipeline 2: Tasks Created Per Month ──');
  tasksByMonth.forEach(m => {
    console.log(`${m._id.year}-${String(m._id.month).padStart(2, '0')}: ${m.totalTasks} total, ${m.completedTasks} completed`);
  });

  // ─────────────────────────────────────────────
  // PIPELINE 3: Completion rate as a percentage
  // ─────────────────────────────────────────────
  const completionRate = await Task.aggregate([
    { $match: { user: user._id } },
    { $group: {
        _id: null,                              // null = group ALL into one
        totalTasks: { $sum: 1 },
        completedTasks: { $sum: { $cond: ['$completed', 1, 0] } }
    }},
    { $project: {                               // Stage: compute derived fields
        _id: 0,
        totalTasks: 1,
        completedTasks: 1,
        completionRate: {
          $multiply: [
            { $divide: ['$completedTasks', '$totalTasks'] },
            100
          ]
        }
    }}
  ]);

  console.log('\n── Pipeline 3: Overall Completion Rate ──');
  const rate = completionRate[0];
  console.log(`Total: ${rate.totalTasks} tasks`);
  console.log(`Completed: ${rate.completedTasks} tasks`);
  console.log(`Completion rate: ${rate.completionRate.toFixed(1)}%`);

  process.exit(0);
};

run();