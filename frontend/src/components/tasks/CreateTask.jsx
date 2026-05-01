import { useState } from "react";
import { createTask } from "../../api/taskAPI";

const CreateTask = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createTask(form);
    alert("Task created");
    window.location.reload();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Title" onChange={handleChange} />
      <br /><br />
      <input name="description" placeholder="Description" onChange={handleChange} />
      <br /><br />
      <button type="submit">Create Task</button>
    </form>
  );
};

export default CreateTask;