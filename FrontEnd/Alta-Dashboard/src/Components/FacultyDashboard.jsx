import { useEffect, useState } from "react";

const API_URL = "http://localhost:5001/api";

const FacultyDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [testCaseLoading, setTestCaseLoading] = useState(false);

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

  const [testCaseForm, setTestCaseForm] = useState({
    input: "",
    expectedOutput: "",
    visibility: "sample",
    order: 0,
    explanation: "",
  });

  const token = localStorage.getItem("token");

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_URL}/questions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setQuestions(data.questions || data);
      } else {
        setMessage(data.message || "Failed to load questions");
      }
    } catch (error) {
      setMessage("Backend connection failed");
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateQuestion = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/questions`, {
        method: "POST",
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
        setMessage("Question created successfully!");

        setForm({
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

        fetchQuestions();
      } else {
        setMessage(data.message || "Failed to create question");
      }
    } catch (error) {
      setMessage("Something went wrong while creating the question");
    } finally {
      setLoading(false);
    }
  };

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

      if (response.ok) {
        setMessage("Question published successfully!");
        fetchQuestions();
      } else {
        setMessage(data.message || "Failed to publish question");
      }
    } catch (error) {
      setMessage("Something went wrong while publishing");
    }
  };

  const loadTestCases = async (question) => {
    setSelectedQuestion(question);
    setTestCases([]);
    setMessage("");
    setTestCaseLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/test-cases/question/${question._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTestCases(Array.isArray(data) ? data : data.testCases || []);
      } else {
        setMessage(data.message || "Failed to load test cases");
      }
    } catch (error) {
      setMessage("Failed to load test cases");
    } finally {
      setTestCaseLoading(false);
    }
  };

  const handleTestCaseChange = (event) => {
    setTestCaseForm({
      ...testCaseForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateTestCase = async (event) => {
    event.preventDefault();

    if (!selectedQuestion) {
      return;
    }

    setTestCaseLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/test-cases/question/${selectedQuestion._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            input: testCaseForm.input,
            expectedOutput: testCaseForm.expectedOutput,
            visibility: testCaseForm.visibility,
            order: Number(testCaseForm.order),
            explanation: testCaseForm.explanation,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Test case created successfully!");

        setTestCaseForm({
          input: "",
          expectedOutput: "",
          visibility: "sample",
          order: 0,
          explanation: "",
        });

        loadTestCases(selectedQuestion);
      } else {
        setMessage(data.message || "Failed to create test case");
      }
    } catch (error) {
      setMessage("Something went wrong while creating the test case");
    } finally {
      setTestCaseLoading(false);
    }
  };

  const handleDeleteTestCase = async (testCaseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this test case?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/test-cases/${testCaseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Test case deleted successfully!");
        loadTestCases(selectedQuestion);
      } else {
        setMessage(data.message || "Failed to delete test case");
      }
    } catch (error) {
      setMessage("Failed to delete test case");
    }
  };

  return (
    <div style={styles.page}>
      <h1>Faculty Dashboard</h1>
      <p>Create and manage coding questions.</p>

      {message && <div style={styles.message}>{message}</div>}

      <section style={styles.card}>
        <h2>Create New Question</h2>

        <form onSubmit={handleCreateQuestion}>
          <input
            style={styles.input}
            name="title"
            placeholder="Question title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <textarea
            style={styles.textarea}
            name="description"
            placeholder="Question description"
            value={form.description}
            onChange={handleChange}
            required
          />

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

          <input
            style={styles.input}
            name="topics"
            placeholder="Topics separated by commas"
            value={form.topics}
            onChange={handleChange}
          />

          <textarea
            style={styles.textarea}
            name="constraints"
            placeholder="Constraints"
            value={form.constraints}
            onChange={handleChange}
          />

          <textarea
            style={styles.textarea}
            name="inputFormat"
            placeholder="Input format"
            value={form.inputFormat}
            onChange={handleChange}
          />

          <textarea
            style={styles.textarea}
            name="outputFormat"
            placeholder="Output format"
            value={form.outputFormat}
            onChange={handleChange}
          />

          <textarea
            style={styles.textarea}
            name="sampleInput"
            placeholder="Sample input"
            value={form.sampleInput}
            onChange={handleChange}
          />

          <textarea
            style={styles.textarea}
            name="sampleOutput"
            placeholder="Sample output"
            value={form.sampleOutput}
            onChange={handleChange}
          />

          <textarea
            style={styles.textarea}
            name="explanation"
            placeholder="Explanation"
            value={form.explanation}
            onChange={handleChange}
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Question"}
          </button>
        </form>
      </section>

      <section style={styles.card}>
        <h2>My Questions</h2>

        {questions.length === 0 ? (
          <p>No questions found.</p>
        ) : (
          questions.map((question) => (
            <div key={question._id} style={styles.question}>
              <h3>{question.title}</h3>

              <p>
                <strong>Difficulty:</strong> {question.difficulty}
              </p>

              <p>
                <strong>Status:</strong> {question.status}
              </p>

              <div>
                {question.status === "draft" && (
                  <button
                    style={styles.publishButton}
                    onClick={() => handlePublish(question._id)}
                  >
                    Publish
                  </button>
                )}

                <button
                  style={styles.testCaseButton}
                  onClick={() => loadTestCases(question)}
                >
                  Manage Test Cases
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {selectedQuestion && (
        <section style={styles.card}>
          <h2>
            Test Cases: {selectedQuestion.title}
          </h2>

          <form onSubmit={handleCreateTestCase}>
            <textarea
              style={styles.textarea}
              name="input"
              placeholder="Test case input"
              value={testCaseForm.input}
              onChange={handleTestCaseChange}
              required
            />

            <textarea
              style={styles.textarea}
              name="expectedOutput"
              placeholder="Expected output"
              value={testCaseForm.expectedOutput}
              onChange={handleTestCaseChange}
              required
            />

            <select
              style={styles.input}
              name="visibility"
              value={testCaseForm.visibility}
              onChange={handleTestCaseChange}
            >
              <option value="sample">
                Sample - visible to students
              </option>

              <option value="hidden">
                Hidden - not visible to students
              </option>
            </select>

            <input
              style={styles.input}
              type="number"
              name="order"
              min="0"
              placeholder="Order"
              value={testCaseForm.order}
              onChange={handleTestCaseChange}
            />

            <textarea
              style={styles.textarea}
              name="explanation"
              placeholder="Explanation (optional)"
              value={testCaseForm.explanation}
              onChange={handleTestCaseChange}
            />

            <button
              style={styles.button}
              type="submit"
              disabled={testCaseLoading}
            >
              {testCaseLoading
                ? "Saving..."
                : "Add Test Case"}
            </button>
          </form>

          <h3 style={{ marginTop: "30px" }}>
            Existing Test Cases
          </h3>

          {testCases.length === 0 ? (
            <p>No test cases yet.</p>
          ) : (
            testCases.map((testCase) => (
              <div
                key={testCase._id}
                style={styles.testCase}
              >
                <p>
                  <strong>Type:</strong>{" "}
                  {testCase.visibility}
                </p>

                <p>
                  <strong>Order:</strong>{" "}
                  {testCase.order}
                </p>

                <p>
                  <strong>Input:</strong>
                </p>

                <pre style={styles.pre}>
                  {testCase.input}
                </pre>

                <p>
                  <strong>Expected Output:</strong>
                </p>

                <pre style={styles.pre}>
                  {testCase.expectedOutput}
                </pre>

                <button
                  style={styles.deleteButton}
                  onClick={() =>
                    handleDeleteTestCase(testCase._id)
                  }
                >
                  Delete
                </button>
              </div>
            ))
          )}

          <button
            style={styles.closeButton}
            onClick={() => {
              setSelectedQuestion(null);
              setTestCases([]);
            }}
          >
            Close Test Cases
          </button>
        </section>
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
    marginTop: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },

  input: {
    display: "block",
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    boxSizing: "border-box",
  },

  textarea: {
    display: "block",
    width: "100%",
    minHeight: "80px",
    padding: "12px",
    marginBottom: "15px",
    boxSizing: "border-box",
  },

  button: {
    padding: "12px 20px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  publishButton: {
    padding: "8px 15px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "10px",
  },

  testCaseButton: {
    padding: "8px 15px",
    background: "#7c3aed",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  deleteButton: {
    padding: "8px 15px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  closeButton: {
    marginTop: "20px",
    padding: "10px 18px",
    background: "#374151",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  message: {
    padding: "12px",
    marginTop: "15px",
    background: "#e0f2fe",
    borderRadius: "6px",
  },

  question: {
    border: "1px solid #ddd",
    padding: "15px",
    marginTop: "15px",
    borderRadius: "8px",
  },

  testCase: {
    border: "1px solid #ddd",
    padding: "15px",
    marginTop: "15px",
    borderRadius: "8px",
  },

  pre: {
    background: "#f3f4f6",
    padding: "12px",
    borderRadius: "6px",
    whiteSpace: "pre-wrap",
  },
};

export default FacultyDashboard
