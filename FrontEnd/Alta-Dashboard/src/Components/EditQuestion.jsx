import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const EditQuestion = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    topics: "",
    constraints: "",
    inputFormat: "",
    outputFormat: "",
    sampleInput: "",
    sampleOutput: "",
    explanation: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`${API_URL}/questions/${questionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          const q = data.question;
          setForm({
            title: q.title || "",
            description: q.description || "",
            difficulty: q.difficulty || "easy",
            topics: Array.isArray(q.topics) ? q.topics.join(", ") : "",
            constraints: q.constraints || "",
            inputFormat: q.inputFormat || "",
            outputFormat: q.outputFormat || "",
            sampleInput: q.sampleInput || "",
            sampleOutput: q.sampleOutput || "",
            explanation: q.explanation || "",
          });
        } else {
          setMessage(data.message || "Failed to load question");
        }
      } catch (error) {
        setMessage("Backend connection failed");
      } finally {
        setFetching(false);
      }
    };

    fetchQuestion();
  }, [questionId, token]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleUpdateQuestion = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/questions/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          topics: form.topics
            .split(",")
            .map((topic) => topic.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Question updated successfully!");
        setTimeout(() => navigate("/faculty/questions"), 1000);
      } else {
        setMessage(data.message || "Failed to update question");
      }
    } catch (error) {
      setMessage("Something went wrong while updating the question");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={styles.page}>
        <h1>Edit Question</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <button
        style={styles.backButton}
        onClick={() => navigate("/faculty/questions")}
      >
        ← Back to Questions
      </button>

      <h1>Edit Question</h1>
      <p>Modify the details of your coding question.</p>

      {message && <div style={styles.message}>{message}</div>}

      <section style={styles.card}>
        <form onSubmit={handleUpdateQuestion}>
          <label style={styles.label}>Title</label>
          <input
            style={styles.input}
            name="title"
            placeholder="Question title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Description</label>
          <textarea
            style={styles.textarea}
            name="description"
            placeholder="Question description"
            value={form.description}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Difficulty</label>
          <select
            style={styles.input}
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <label style={styles.label}>Topics</label>
          <input
            style={styles.input}
            name="topics"
            placeholder="Topics separated by commas"
            value={form.topics}
            onChange={handleChange}
          />

          <label style={styles.label}>Constraints</label>
          <textarea
            style={styles.textarea}
            name="constraints"
            placeholder="Constraints"
            value={form.constraints}
            onChange={handleChange}
          />

          <label style={styles.label}>Input Format</label>
          <textarea
            style={styles.textarea}
            name="inputFormat"
            placeholder="Input format"
            value={form.inputFormat}
            onChange={handleChange}
          />

          <label style={styles.label}>Output Format</label>
          <textarea
            style={styles.textarea}
            name="outputFormat"
            placeholder="Output format"
            value={form.outputFormat}
            onChange={handleChange}
          />

          <label style={styles.label}>Sample Input</label>
          <textarea
            style={styles.textarea}
            name="sampleInput"
            placeholder="Sample input"
            value={form.sampleInput}
            onChange={handleChange}
          />

          <label style={styles.label}>Sample Output</label>
          <textarea
            style={styles.textarea}
            name="sampleOutput"
            placeholder="Sample output"
            value={form.sampleOutput}
            onChange={handleChange}
          />

          <label style={styles.label}>Explanation</label>
          <textarea
            style={styles.textarea}
            name="explanation"
            placeholder="Explanation"
            value={form.explanation}
            onChange={handleChange}
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </section>
    </div>
  );
};

const styles = {
  page: {
    padding: "30px",
    maxWidth: "1000px",
    margin: "0 auto",
  },

  card: {
    background: "#ffffff",
    padding: "25px",
    marginTop: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },

  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "6px",
    marginTop: "15px",
  },

  input: {
    display: "block",
    width: "100%",
    padding: "12px",
    boxSizing: "border-box",
  },

  textarea: {
    display: "block",
    width: "100%",
    minHeight: "80px",
    padding: "12px",
    boxSizing: "border-box",
  },

  button: {
    marginTop: "20px",
    padding: "12px 20px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  backButton: {
    padding: "10px 16px",
    marginBottom: "20px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer",
  },

  message: {
    padding: "12px",
    marginTop: "15px",
    background: "#e0f2fe",
    borderRadius: "6px",
  },
};

export default EditQuestion;
