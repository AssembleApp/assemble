import React, { useState, useEffect } from 'react';
import Scrumboard from './Scrumboard';
import Forms from './Forms';
import { dragContext } from '../../../context';
import { DragDropContext } from 'react-beautiful-dnd';

export default function MainContainer({ user, team }) {
	const [stories, setStories] = useState([]);
	const [tasks, setTasks] = useState([]);
	const [dragid, setDragId] = useState(0);

	useEffect(() => {
		getData();
	}, []);

	function newDragStatus(newStatus) {
		// console.log('new status', newStatus, dragid);
		// fetch('/api/task', {
		// 	method: 'PATCH',
		// 	body: JSON.stringify({
		// 		status: newStatus,
		// 		task_id: dragid,
		// 	}),
		// 	headers: {
		// 		'Content-type': 'application/json',
		// 	},
		// })
		// 	.then((data) => {
		// 		// console.log('this should be updated task status', data);
		// 		getData();
		// 	})
		// 	.catch((err) => {
		// 		console.log({ err: `Error updating task status: ${err}` });
		// 	});
		console.log(newStatus, tasks);
	}

	function handleOnDrag(e) {
		setDragId(e.target.id);
		// console.log('dragging this', e.target);
	}

	function handleDrop(e) {
		const id = !e.target.id ? e.currentTarget.id : e.target.id;
		if (id === 'stories') {
			return;
		}
		newDragStatus(id);
	}

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
				console.log(stories);
				const tasksList = {};
				tasks.sort((a, b) => a.order - b.order)
				console.log(tasks, 'tasks')
				tasksList.backlog = tasks.filter((task) => task.status === 'backlog');
				tasksList.todo = tasks.filter((task) => task.status === 'todo');
				tasksList.inProgress = tasks.filter(
					(task) => task.status === 'inProgress'
				);
				tasksList.toVerify = tasks.filter((task) => task.status === 'toVerify');
				tasksList.done = tasks.filter((task) => task.status === 'done');
				console.log(tasksList);
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
			console.log(newOrder);
			//PATCH to reorderTasks
			fetch('/api/tasks', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(newOrder),
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
		}
	}

	// RENDER MAINCONTAINER
	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<dragContext.Provider
				value={{
					handleOnDrag,
					handleDrop,
					getData,
				}}>
				<div className='mainContainer'>
					<Forms storyList={stories} />
					<Scrumboard stories={stories} tasks={tasks} />
				</div>
			</dragContext.Provider>
		</DragDropContext>
	);
}
