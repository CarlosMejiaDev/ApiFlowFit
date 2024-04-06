// routine.js
const axios = require('axios');
const mysql = require('mysql2/promise');
const config = require('../dbconfig');

async function saveExercisesToDatabase() {
  const options = {
    method: 'GET',
    url: 'https://exercisedb.p.rapidapi.com/exercises',
    headers: {
      'X-RapidAPI-Key': '7fc2afadc8msha5dc7a69ae98b33p132eaajsne6c3773814cf',
      'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    const exercises = response.data;

    const connection = await mysql.createConnection(config);

    for (let exercise of exercises) {
      await connection.execute(
        'INSERT INTO exercises (id, name, bodyPart, equipment, gifUrl, target, secondaryMuscles, instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
        [
          exercise.id, 
          exercise.name, 
          exercise.bodyPart, 
          exercise.equipment, 
          exercise.gifUrl, 
          exercise.target, 
          JSON.stringify(exercise.secondaryMuscles), 
          JSON.stringify(exercise.instructions)
        ]
      );
    }

    console.log('Data saved to database');
  } catch (error) {
    console.error(error);
  }
}

module.exports = saveExercisesToDatabase;