import React from 'react';
import { useContext } from 'react';
import { dragContext } from '../../../context';
import { Draggable } from 'react-beautiful-dnd';

export default function Task({ task, id, index, color }) {
	// MAKE PATCH REQUEST TO UPDATE TASK STATUS
	console.log(index);
	const { handleOnDrag, getData } = useContext(dragContext);

	// MAKE DELTE REQUEST TO DELETE TASK
	function deleteTask() {
		fetch(`/api/task/${id}`, {
			method: 'DELETE',
		})
			.then(() => {
				getData();
			})
			.catch((err) => {
				console.log({ err: `Error deleting task: ${err}` });
			});
	}

	// const classes = `task ${task.color}`;
	const classes = `task ${'c' + color.slice(1)}`;
	// RENDER TASK COMPONENT
	//
	return (
		<Draggable draggableId={id} index={index} key={id}>
			{(provided) => (
				<div
					id={id}
					className={classes}
					ref={provided.innerRef}
					{...provided.dragHandleProps}
					{...provided.draggableProps}>
					<button className='delete' onClick={() => deleteTask()}>
						x
					</button>
					<p>
						<span className='task-label'>Task:</span>
						{task.description}
					</p>
					<p>
						<span className='task-label'>Name:</span>
						{task.name}
					</p>
					<p>
						<span className='task-label'>Difficulty:</span>
						{task.difficulty}
					</p>
					<div
						style={{
							display: 'flex',
							width: 100 + '%',
							justifyContent: 'center',
						}}></div>
				</div>
			)}
		</Draggable>
	);
}
