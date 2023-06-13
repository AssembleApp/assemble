export default function reorder(tasks) {
	return tasks.map((obj, i) => {
		return {
			id: obj.task_id,
			order: i,
		};
	});
}
