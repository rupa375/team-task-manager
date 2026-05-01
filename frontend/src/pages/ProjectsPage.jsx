import Navbar from "../components/shared/Navbar";
import CreateProject from "../components/projects/CreateProject";
import ProjectList from "../components/projects/ProjectList";
import useProjects from "../hooks/useProjects";

const ProjectsPage = () => {
  const { projects, loading, error, refetch } = useProjects();

  const styles = {
    page: { minHeight: "100vh", background: "#f7fafc" },
    container: { maxWidth: "1000px", margin: "0 auto", padding: "2rem 1.5rem" },
    heading: { fontSize: "1.5rem", fontWeight: "700", color: "#1a202c", marginBottom: "0.25rem" },
    subheading: { color: "#718096", fontSize: "0.9rem", marginBottom: "2rem" },
    status: { color: "#718096", fontSize: "0.9rem", padding: "2rem 0", textAlign: "center" },
    errorBox: { color: "#c53030", background: "#fff5f5", border: "1px solid #feb2b2", borderRadius: "8px", padding: "12px", marginBottom: "1rem", fontSize: "0.875rem" },
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.heading}>Projects</h2>
        <p style={styles.subheading}>Manage your team's projects</p>

        <CreateProject onCreated={refetch} />

        {error && <div style={styles.errorBox}>{error}</div>}
        {loading
          ? <div style={styles.status}>Loading projects...</div>
          : <ProjectList projects={projects} onDeleted={refetch} />
        }
      </div>
    </div>
  );
};

export default ProjectsPage;