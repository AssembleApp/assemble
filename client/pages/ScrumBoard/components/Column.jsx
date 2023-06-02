import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Task from './Task';

function Column({ status, title, tasks }) {
	const taskList = tasks?.map((task, index) => {
		return <Task key={task.id} task={task} id={task.task_id} index={index} />;
	});

	return (
		<div className='column'>
			<h3>{title}</h3>
			<hr />
			<Droppable droppableId={status}>
				{(provided) => (
					<div
						className='droppable-column'
						ref={provided.innerRef}
						{...provided.droppableProps}>
						{taskList}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</div>
	);
}

export default Column;
