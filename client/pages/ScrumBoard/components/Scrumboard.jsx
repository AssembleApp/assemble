import React from 'react';
import Story from './Story';
import Column from './Column';

export default function Scrumboard({ stories, tasks }) {
	const statusTitle = {
		backlog: 'Backlog',
		todo: 'To Do',
		inProgress: 'In Progress',
		toVerify: 'To Verify',
		done: 'Done',
	};

	const colorCode = {};

	const storiesList = stories.map((story) => {
		colorCode[story.id] = story.color;
		return <Story key={story.id} story={story} />;
	});

	const columns = Object.keys(statusTitle).map((status) => {
		return (
			<Column
				status={status}
				title={statusTitle[status]}
				tasks={tasks[status]}
				stories={stories}
				colorCode={colorCode}
			/>
		);
	});
	// RENDER SCRUMBOARD
	return (
		<div className='scrumboard'>
			{columns[0]}
			<div id='stories' className='column'>
				<h3>Stories</h3>
				<hr />
				{storiesList}
			</div>
			{columns.slice(1)}
		</div>
	);
}
