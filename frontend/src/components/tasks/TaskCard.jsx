import { updateTaskStatus, deleteTask } from "../../api/taskAPI";

const TaskCard = ({ task }) => {
  const handleStatusChange = async (e) => {
    await updateTaskStatus(task._id, e.target.value);
    window.location.reload();
  };

  const handleDelete = async () => {
    await deleteTask(task._id);
    window.location.reload();
  };

  return (
    <div style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
      <h4>{task.title}</h4>
      <p>{task.description}</p>

      <select value={task.status} onChange={handleStatusChange}>
        <option>To Do</option>
        <option>In Progress</option>
        <option>Done</option>
      </select>

      <br /><br />
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default TaskCard;