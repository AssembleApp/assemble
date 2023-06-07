import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Task from './Task';
import { TasksContext } from '../../../context';

function Column({ status, title, colorCode }) {
	const { tasks } = React.useContext(TasksContext);

	const taskList = tasks[status]?.map((task, index) => {
		return (
			<Task
				key={task.id}
				task={task}
				id={task.task_id}
				index={index}
				color={colorCode[task.story_id]}
			/>
		);
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
