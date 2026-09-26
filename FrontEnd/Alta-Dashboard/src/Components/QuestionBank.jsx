import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const QuestionBank = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/questions/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch questions");
        }

        const questionList = Array.isArray(data.questions)
          ? data.questions
          : Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.results)
              ? data.results
              : Array.isArray(data)
                ? data
                : [];

        setQuestions(questionList);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <h1>Question Bank</h1>
        <p>Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h1>Question Bank</h1>
        <p style={styles.error}>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Question Bank</h1>
          <p style={styles.subtitle}>
            Practice coding questions and improve your problem-solving skills.
          </p>
        </div>

        <button style={styles.backButton} onClick={() => navigate("/student")}>
          Back to Dashboard
        </button>
      </div>

      {questions.length === 0 ? (
        <div style={styles.emptyBox}>
          <h2>No questions available</h2>
          <p>Questions will appear here once they are published.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {questions.map((question) => (
            <div key={question._id || question.id} style={styles.card}>
              <div style={styles.cardTop}>
                <span style={styles.questionNumber}>Question</span>

                <span
                  style={{
                    ...styles.difficulty,
                    ...(question.difficulty === "easy"
                      ? styles.easy
                      : question.difficulty === "hard"
                        ? styles.hard
                        : styles.medium),
                  }}
                >
                  {question.difficulty || "Medium"}
                </span>
              </div>

              <h2 style={styles.cardTitle}>
                {question.title || "Untitled Question"}
              </h2>

              <p style={styles.description}>
                {question.description || "No description available."}
              </p>

              {Array.isArray(question.topics) && question.topics.length > 0 && (
                <div style={styles.topics}>
                  {question.topics.map((topic, index) => (
                    <span key={index} style={styles.topic}>
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              <button
                style={styles.solveButton}
                onClick={() =>
                  navigate(`/student/coding/${question._id || question.id}`)
                }
              >
                Solve Question
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

//style of cards and quesion stored in the same file using function

const styles = {
  container: {
    padding: "35px",
    minHeight: "100%",
    background: "#f7f8fc",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "30px",
  },

  title: {
    margin: 0,
    fontSize: "36px",
    color: "#111827",
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
    fontSize: "16px",
  },

  backButton: {
    padding: "10px 18px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "white",
    cursor: "pointer",
    fontSize: "14px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "22px",
  },

  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.04)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  questionNumber: {
    color: "#6b7280",
    fontSize: "13px",
    textTransform: "uppercase",
    fontWeight: "600",
  },

  difficulty: {
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
  },

  easy: {
    background: "#dcfce7",
    color: "#166534",
  },

  medium: {
    background: "#fef3c7",
    color: "#92400e",
  },

  hard: {
    background: "#fee2e2",
    color: "#991b1b",
  },

  cardTitle: {
    margin: "0 0 12px",
    fontSize: "21px",
    color: "#111827",
  },

  description: {
    color: "#6b7280",
    lineHeight: "1.6",
    minHeight: "70px",
    fontSize: "14px",
  },

  topics: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    margin: "18px 0",
  },

  topic: {
    background: "#eef2ff",
    color: "#4338ca",
    padding: "5px 9px",
    borderRadius: "5px",
    fontSize: "12px",
  },

  solveButton: {
    width: "100%",
    marginTop: "12px",
    padding: "11px",
    border: "none",
    borderRadius: "7px",
    background: "#111827",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  emptyBox: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
  },

  error: {
    color: "#dc2626",
    marginBottom: "20px",
  },
};

export default QuestionBank;
