const db = require('../scrumBoardModel');

const scrumController = {};

// GET STORIES ------------------------------------------------------------------------------------------
scrumController.getStories = (req, res, next) => {
  const { team_id } = req.body;
  const values = [team_id];
  const queryStr = 'SELECT * FROM "public"."story" WHERE team_id = $1;';

  db.query(queryStr, values)
    .then((data) => {
      res.locals.stories = data.rows;
      return next();
    })
    .catch((err) => {
      const errorObj = {
        log: `scrumController.getStories middleware error: ${err.message}`,
        status: 501,
        message: 'Unable to fetch stories',
      };
      return next(errorObj);
    });
};

// GET TASKS ------------------------------------------------------------------------------------------
scrumController.getTasks = (req, res, next) => {
  const { team_id } = req.body;
  const values = [team_id];
  const queryStr = `SELECT t.description, t.name, t.difficulty, t.status, t.story_id, t.task_id, t.order FROM "public"."task" AS t INNER JOIN "public"."story" s 
	ON t.story_id = s.id
	WHERE s.team_id = $1
	`;
  //inner join
  db.query(queryStr, values)
    .then((data) => {
      res.locals.tasks = data.rows;
      // console.log('DATTTAAA ROWSSSSSSSSSS', data.rows);
      return next();
    })
    .catch((err) => {
      // console.log(err, 'err');
      const errorObj = {
        log: 'scrumcontroller.getTasks middleware error',
        status: 501,
        message: 'Unable to fetch tasks',
      };
      return next(errorObj);
    });
};

// ADD TASK -------------------------------------------------------------------------------------------
scrumController.postTask = (req, res, next) => {
  //change these values to match database
  const { description, difficulty, name, story_id, task_id, order } = req.body;
  // console.log('request body', req.body);
  const values = [
    description,
    difficulty,
    name,
    story_id,
    'backlog',
    task_id,
    order,
  ];
  // console.log(values);
  const queryString = `
  INSERT INTO task (description, difficulty, name, story_id, status, task_id, "order") 
  VALUES ($1, $2, $3, $4, $5, $6, $7 )
	RETURNING id`;

  db.query(queryString, values)
    .then((data) => {
      console.log(data.rows);
      return next();
    })
    .catch((err) => {
      console.log(err);
      const errorObj = {
        log: 'scrumController.postTask middleware error',
        status: 501,
        message: 'Add task failed',
      };
      return next(errorObj);
    });
};

// ADD STORY -----------------------------------------------------------------------------------------
scrumController.postStory = (req, res, next) => {
  const { description, color, team_id } = req.body;
  const values = [description, color, team_id];
  const storyString = 'INSERT INTO story (description, color, team_id) VALUES ($1, $2, $3)';

  db.query(storyString, values)
    .then((data) => {
      return next();
    })
    .catch((err) => {
      const errorObj = {
        log: 'scrumController.postStory middleware error',
        status: 501,
        message: 'Add story failed',
      };
      return next(errorObj);
    });
};

// UPDATE TASK STATUS --------------------------------------------------------------------------------
scrumController.updateTask = (req, res, next) => {
  const { status, task_id } = req.body;
  // console.log(task_id);
  const values = [status, task_id];
  const queryString = 'UPDATE task SET status = $1 WHERE task_id = $2 RETURNING *;';
  // console.log('status', status);
  db.query(queryString, values)
    .then((data) => {
      // console.log(data.rows);
      return next();
    })
    .catch((err) => {
      // console.log('error', err);
      const errorObj = {
        log: 'scrumController.updateTask middleware error',
        status: 501,
        message: 'Update task failed',
      };
      return next(errorObj);
    });
};

// REORDER TASKS ---------------------------------------------------------------------------------------

scrumController.reorderTasks = (req, res, next) => {
  const values = [];
  const { tasks } = req.body;

  //building values for query
  for (const task of tasks) {
    values.push(task.id);
    values.push(task.order);
  }

  let cases = '';
  let count = 1;
  let params = '';

  //building cases for query string
  tasks.forEach((task) => {
    cases += `
		WHEN task_id = $${count} THEN CAST($${count + 1} AS INTEGER)
		`;
    count += 2;
    params += `${count}`;
  });

  //inserting cases into query string
  const queryBase = () => {
    return `
	UPDATE task SET "order" = CASE
		${cases}
		ELSE ("order")
		END
	`;
  };

  //creating full query string
  const queryString = queryBase();

  db.query(queryString, values)
    .then((data) => {
      return next();
    })
    .catch((err) => {
      console.log(err);
      const errorObj = {
        log: 'scrumController.reorderTasks middleware error',
        status: 501,
        message: 'Delete task failed',
      };
      return next(errorObj);
    });
};

// DELETE TASK -----------------------------------------------------------------------------------------
scrumController.deleteTask = (req, res, next) => {
  const id = req.params.id;
  const values = [id];
  const queryString = 'DELETE FROM task WHERE task_id = $1;';

  db.query(queryString, values)
    .then((data) => {
      return next();
    })
    .catch((err) => {
      const errorObj = {
        log: 'scrumController.deleteTask middleware error',
        status: 501,
        message: 'Delete task failed',
      };
      return next(errorObj);
    });
};

// DELETE STORY ----------------------------------------------------------------------------------------
scrumController.deleteStory = (req, res, next) => {
  const id = req.params.id;
  const values = [id];
  const queryString = 'DELETE FROM story WHERE id = $1;';

  db.query(queryString, values)
    .then((data) => {
      return next();
    })
    .catch((err) => {
      const errorObj = {
        log: 'scrumController.deleteStory middleware error',
        status: 501,
        message: 'Delete story failed',
      };
      return next(errorObj);
    });
};

module.exports = scrumController;
