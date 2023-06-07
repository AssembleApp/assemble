import React from 'react';
import { useContext } from 'react';
import { TasksContext } from '../../../context';
import { Draggable } from 'react-beautiful-dnd';

export default function Task({ task, id, index, color }) {
	// MAKE PATCH REQUEST TO UPDATE TASK STATUS
	const { getData, setTasks } = useContext(TasksContext);

	// MAKE DELTE REQUEST TO DELETE TASK
	function deleteTask() {
		//optimistic render
		setTasks((prev) => {
			return {
				...prev,
				[task.status]: prev[task.status].filter((task) => task.task_id !== id),
			};
		});
		fetch(`/api/task/${id}`, {
			method: 'DELETE',
		})
			.then(() => {
				getData();
			})
			.catch((err) => {
				window.alert(
					'There was an error deleting this task. Please try again later.'
				);
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
