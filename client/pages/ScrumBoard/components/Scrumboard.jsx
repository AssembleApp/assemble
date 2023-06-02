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

	const columns = Object.keys(statusTitle).map((status) => {
		return (
			<Column
				status={status}
				title={statusTitle[status]}
				tasks={tasks[status]}
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
				{stories.map((story) => {
					return <Story key={story.id} story={story} />;
				})}
			</div>
			{columns.slice(1)}
		</div>
	);
}
