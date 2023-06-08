import React from 'react';
import Story from './Story';
import Column from './Column';
import statuses from '../../../utils/statuses';

export default function Scrumboard({ stories }) {
	const colorCode = {};

	const storiesList = stories.map((story) => {
		colorCode[story.id] = story.color;
		return <Story key={story.id} story={story} />;
	});

	const columns = Object.keys(statuses).map((status) => {
		return (
			<Column
				status={status}
				title={statuses[status]}
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
