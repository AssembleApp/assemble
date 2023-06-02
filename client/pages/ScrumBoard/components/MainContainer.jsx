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

		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		)
			return;

		console.log(draggableId, source, destination);
		
		//just for reordering in same category
		const newTasks = [...tasks[destination.droppableId]];

		const currentTask = newTasks.find((obj) => obj.task_id === draggableId);
		newTasks.splice(source.index, 1);
		newTasks.splice(destination.index, 0, currentTask);
		setTasks((prev) => {
			return {
				...prev,
				[destination.droppableId]: newTasks,
			};
		});
		console.log(newTasks, 'new tasks');
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
