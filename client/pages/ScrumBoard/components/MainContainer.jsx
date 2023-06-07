import React, { useState, useEffect } from 'react';
import Scrumboard from './Scrumboard';
import Forms from './Forms';
import { dragContext } from '../../../context';
import { DragDropContext } from 'react-beautiful-dnd';
import statuses from '../../../utils/task-statuses';

export default function MainContainer({ user, team }) {
	const [stories, setStories] = useState([]);
	const [tasks, setTasks] = useState([]);

	useEffect(() => {
		getData();
	}, []);

	function getData() {
		fetch('/api/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ team_id: team }),
		})
			.then((data) => {
				return data.json();
			})
			.then(({ stories, tasks }) => {
				setStories(stories);
				const tasksList = {};

				statuses.forEach((status) => {
					tasksList[status] = tasks
						.filter((task) => task.status === status)
						.sort((a, b) => a.order - b.order);
					console.log(tasksList[status]);
				});
				setTasks(tasksList);
			})
			.catch((err) => {
				console.log({ err: `Error fetching task and story data: ${err}` });
			});
	}

	function handleDragEnd(result) {
		const { destination, source, draggableId } = result;

		//no change in category or order
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		)
			return;

		//create copy of source and destination tasks
		const sourceTasks = [...tasks[source.droppableId]];
		const destinationTasks = [...tasks[destination.droppableId]];
		const currentTask = sourceTasks.find((obj) => obj.task_id === draggableId);
		//remove current task from source task list
		sourceTasks.splice(source.index, 1);

		//change in order but not category
		if (source.droppableId === destination.droppableId) {
			//reorder tasks in list
			sourceTasks.splice(destination.index, 0, currentTask);
			setTasks((prev) => {
				return {
					...prev,
					[source.droppableId]: sourceTasks,
				};
			});

			//need all tasks from current story => sourceTasks
			console.log(sourceTasks);
			const newOrder = sourceTasks.map((obj, i) => {
				return {
					id: obj.task_id,
					order: i,
				};
			});

			//PATCH to reorderTasks
			fetch('/api/tasks', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ tasks: newOrder }),
			})
				.then((res) => {
					getData();
				})
				.catch((err) => {
					window.alert(
						'There was an error reordering tasks. Please try again later.'
					);
				});
		} else {
			//change status of task
			currentTask.status = source.droppableId;
			//add task to new task list
			destinationTasks.splice(destination.index, 0, currentTask);
			setTasks((prev) => {
				return {
					...prev,
					[source.droppableId]: sourceTasks,
					[destination.droppableId]: destinationTasks,
				};
			});
			//PATCH to updateTasks
			const newOrder = destinationTasks.map((obj, i) => {
				return {
					id: obj.task_id,
					order: i,
				};
			});
			fetch('/api/task', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					tasks: newOrder,
					task_id: draggableId,
					status: destination.droppableId,
				}),
			})
				.then((res) => {
					getData();
				})
				.catch((err) => {
					window.alert(
						'There was an error reordering tasks. Please try again later.'
					);
				});
		}
	}

	// RENDER MAINCONTAINER
	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<dragContext.Provider
				value={{
					getData,
				}}>
				<div className='mainContainer'>
					<Forms storyList={stories} backlogTasks={tasks.backlog} />
					<Scrumboard stories={stories} tasks={tasks} />
				</div>
			</dragContext.Provider>
		</DragDropContext>
	);
}
