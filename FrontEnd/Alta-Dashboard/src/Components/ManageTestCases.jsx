import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5001/api";

const ManageTestCases = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    input: "",
    expectedOutput: "",
    visibility: "sample",
    order: 0,
    explanation: "",
  });

  const token = localStorage.getItem("token");

  const loadData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const questionResponse = await fetch(
        `${API_URL}/questions/${questionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const questionData = await questionResponse.json();

      if (!questionResponse.ok) {
        throw new Error(
          questionData.message || "Failed to load question"
        );
      }

      setQuestion(questionData.question || questionData);

      const testCaseResponse = await fetch(
        `${API_URL}/test-cases/question/${questionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const testCaseData = await testCaseResponse.json();

      if (!testCaseResponse.ok) {
        throw new Error(
          testCaseData.message || "Failed to load test cases"
        );
      }

      setTestCases(
        Array.isArray(testCaseData)
          ? testCaseData
          : testCaseData.testCases || []
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [questionId]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!form.input.trim() || !form.expectedOutput.trim()) {
      setMessage("Input and expected output are required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/test-cases/question/${questionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            input: form.input,
            expectedOutput: form.expectedOutput,
            visibility: form.visibility,
            order: Number(form.order),
            explanation: form.explanation,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create test case"
        );
      }

      setMessage("Test case created successfully.");

      setForm({
        input: "",
        expectedOutput: "",
        visibility: "sample",
        order: testCases.length + 1,
        explanation: "",
      });

      await loadData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (testCaseId) => {
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

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete test case"
        );
      }

      setMessage("Test case deleted successfully.");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <h1>Manage Test Cases</h1>
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

      <div style={styles.header}>
        <h1>Manage Test Cases</h1>

        {question && (
          <>
            <h2>{question.title}</h2>
            <p>{question.description}</p>
          </>
        )}
      </div>

      {message && <div style={styles.message}>{message}</div>}

      <section style={styles.card}>
        <h2>Add Test Case</h2>

        <form onSubmit={handleCreate}>
          <label style={styles.label}>Input</label>

          <textarea
            style={styles.textarea}
            name="input"
            value={form.input}
            onChange={handleChange}
            placeholder="Example: 2 7 11 15&#10;9"
            required
          />

          <label style={styles.label}>Expected Output</label>

          <textarea
            style={styles.textarea}
            name="expectedOutput"
            value={form.expectedOutput}
            onChange={handleChange}
            placeholder="Example: 0 1"
            required
          />

          <label style={styles.label}>Visibility</label>

          <select
            style={styles.input}
            name="visibility"
            value={form.visibility}
            onChange={handleChange}
          >
            <option value="sample">
              Sample - visible to students
            </option>

            <option value="hidden">
              Hidden - not visible to students
            </option>
          </select>

          <label style={styles.label}>Order</label>

          <input
            style={styles.input}
            type="number"
            min="0"
            name="order"
            value={form.order}
            onChange={handleChange}
          />

          <label style={styles.label}>Explanation (optional)</label>

          <textarea
            style={styles.textarea}
            name="explanation"
            value={form.explanation}
            onChange={handleChange}
            placeholder="Explain this test case..."
          />

          <button
            style={styles.createButton}
            type="submit"
            disabled={saving}
          >
            {saving ? "Creating..." : "Add Test Case"}
          </button>
        </form>
      </section>

      <section style={styles.card}>
        <h2>Existing Test Cases</h2>

        {testCases.length === 0 ? (
          <p>No test cases found for this question.</p>
        ) : (
          testCases.map((testCase, index) => (
            <div key={testCase._id} style={styles.testCase}>
              <div style={styles.testHeader}>
                <h3>Test Case {index + 1}</h3>

                <span
                  style={
                    testCase.visibility === "hidden"
                      ? styles.hiddenBadge
                      : styles.sampleBadge
                  }
                >
                  {testCase.visibility}
                </span>
              </div>

              <p>
                <strong>Input:</strong>
              </p>

              <pre style={styles.pre}>{testCase.input}</pre>

              <p>
                <strong>Expected Output:</strong>
              </p>

              <pre style={styles.pre}>
                {testCase.expectedOutput}
              </pre>

              {testCase.explanation && (
                <>
                  <p>
                    <strong>Explanation:</strong>
                  </p>

                  <p>{testCase.explanation}</p>
                </>
              )}

              <button
                style={styles.deleteButton}
                onClick={() => handleDelete(testCase._id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
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

  backButton: {
    padding: "10px 16px",
    marginBottom: "20px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer",
  },

  header: {
    marginBottom: "20px",
  },

  card: {
    background: "#fff",
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
    minHeight: "90px",
    padding: "12px",
    boxSizing: "border-box",
  },

  createButton: {
    marginTop: "20px",
    padding: "12px 20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  testCase: {
    padding: "20px",
    marginTop: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },

  testHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sampleBadge: {
    padding: "5px 10px",
    background: "#dcfce7",
    borderRadius: "5px",
  },

  hiddenBadge: {
    padding: "5px 10px",
    background: "#fee2e2",
    borderRadius: "5px",
  },

  pre: {
    background: "#f5f5f5",
    padding: "12px",
    borderRadius: "6px",
    whiteSpace: "pre-wrap",
  },

  deleteButton: {
    padding: "8px 14px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default ManageTestCases;
