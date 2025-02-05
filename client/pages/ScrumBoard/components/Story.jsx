import React from 'react';
import { useContext } from 'react';
import { TasksContext } from '../../../context';

export default function Story({ story }) {
	const { getData } = useContext(TasksContext);
	// MAKE DELTE REQUEST TO DELETE STORY
	function deleteStory(id) {
		// console.log('sending deleteStory from Story.jsx');
		fetch(`/api/story/${id}`, {
			method: 'DELETE',
		})
			.then(() => {
				getData();
			})
			.catch((err) => {
				console.log({ err: `Error deleting story: ${err}` });
			});
	}

	const classes = 'story';
	const styles = { backgroundColor: story.color };

	return (
		<div className={classes} style={styles}>
			<button
				type='button'
				onClick={() => deleteStory(story.id)}
				className='delete div-delete'>
				x
			</button>
			<p>{story.description}</p>
		</div>
	);
}
