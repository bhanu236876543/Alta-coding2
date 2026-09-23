import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001/api";

const FacultyQuestions = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_URL}/questions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load questions");
      }

      setQuestions(
        Array.isArray(data)
          ? data
          : Array.isArray(data.questions)
          ? data.questions
          : []
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handlePublish = async (questionId) => {
    try {
      const response = await fetch(
        `${API_URL}/questions/${questionId}/publish`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to publish question");
      }

      setMessage("Question published successfully.");
      fetchQuestions();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleUnpublish = async (questionId) => {
    try {
      const response = await fetch(
        `${API_URL}/questions/${questionId}/unpublish`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to unpublish question");
      }

      setMessage("Question moved back to draft.");
      fetchQuestions();
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <h1>Manage Questions</h1>
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1>Manage Questions</h1>

      <p>Create, publish and manage your coding questions.</p>

      {message && <div style={styles.message}>{message}</div>}

      {questions.length === 0 ? (
        <div style={styles.card}>
          <h2>No Questions Found</h2>
          <p>Create a question from the Faculty Dashboard first.</p>
        </div>
      ) : (
        questions.map((question) => (
          <div key={question._id} style={styles.card}>
            <h2>{question.title}</h2>

            <p>{question.description}</p>

            <p>
              <strong>Difficulty:</strong> {question.difficulty}
            </p>

            <p>
              <strong>Status:</strong> {question.status}
            </p>

            <p>
              <strong>Topics:</strong>{" "}
              {Array.isArray(question.topics)
                ? question.topics.join(", ")
                : "General"}
            </p>

            <div style={styles.actions}>
              {question.status === "draft" ? (
                <button
                  style={styles.publishButton}
                  onClick={() => handlePublish(question._id)}
                >
                  Publish
                </button>
              ) : (
                <button
                  style={styles.unpublishButton}
                  onClick={() => handleUnpublish(question._id)}
                >
                  Unpublish
                </button>
              )}

              <button
                style={styles.editButton}
                onClick={() =>
                  navigate(`/faculty/questions/${question._id}/edit`)
                }
              >
                Edit
              </button>

              <button
                style={styles.testButton}
                onClick={() =>
                  navigate(
                    `/faculty/questions/${question._id}/test-cases`
                  )
                }
              >
                Manage Test Cases
              </button>
            </div>
          </div>
        ))
      )}
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
    marginTop: "20px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },

  message: {
    padding: "12px",
    marginTop: "15px",
    background: "#e0f2fe",
    borderRadius: "6px",
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },

  publishButton: {
    padding: "10px 16px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  unpublishButton: {
    padding: "10px 16px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  testButton: {
    padding: "10px 16px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  editButton: {
    padding: "10px 16px",
    background: "#f59e0b",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default FacultyQuestions;
