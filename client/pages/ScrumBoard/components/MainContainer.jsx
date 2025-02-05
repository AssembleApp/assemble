import React, { useState, useEffect } from 'react';
import Scrumboard from './Scrumboard';
import Forms from './Forms';
import { TasksContext } from '../../../context';
import { DragDropContext } from 'react-beautiful-dnd';
import statuses from '../../../utils/statuses';
import reorder from '../../../utils/reorder';

export default function MainContainer({ team }) {
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
				//separating tasks by status and sorting based on order
				Object.keys(statuses).forEach((status) => {
					tasksList[status] = tasks
						.filter((task) => task.status === status)
						.sort((a, b) => a.order - b.order);
				});
				// console.log(tasksList);
				setTasks(tasksList);
			})
			.catch((err) => {
				console.log({ err: `Error fetching task and story data: ${err}` });
			});
	}

	//react beautiful dnd dragend handler
	function handleDragEnd(result) {
		const { destination, source, draggableId } = result;

		//task is dropped into undroppable area or same position in column
		if (
			!destination ||
			(destination.droppableId === source.droppableId &&
				destination.index === source.index)
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
			//optimistic rendering
			setTasks((prev) => {
				return {
					...prev,
					[source.droppableId]: sourceTasks,
				};
			});

			//PATCH to reorderTasks
			fetch('/api/tasks', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ tasks: reorder(sourceTasks) }),
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
			//optimistic rendering
			setTasks((prev) => {
				return {
					...prev,
					[source.droppableId]: sourceTasks,
					[destination.droppableId]: destinationTasks,
				};
			});
			//PATCH to updateTasks
			fetch('/api/task', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					tasks: reorder(destinationTasks),
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
			{/* {context to refresh page and optimistic render} */}
			<TasksContext.Provider
				value={{
					getData,
					tasks,
					setTasks,
				}}>
				<div className='mainContainer'>
					<Forms stories={stories} setStories={setStories} />
					<Scrumboard stories={stories} />
				</div>
			</TasksContext.Provider>
		</DragDropContext>
	);
}
