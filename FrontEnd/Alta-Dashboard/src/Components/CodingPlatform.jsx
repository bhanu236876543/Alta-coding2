import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CodingPlatform.css";

const API_URL = "http://localhost:5001/api";

const defaultCode = {
  python: `# Write your Python solution here
`,
  javascript: `// Write your JavaScript solution here
`,
  java: `// Write your Java solution here
`,
  cpp: `// Write your C++ solution here
`,
};

const CodingPlatform = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedQuestion = location.state?.question;
  const selectedQuestionId =
    location.state?.questionId || selectedQuestion?._id;

  const [question, setQuestion] = useState(selectedQuestion || null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(defaultCode.python);
  const [submissions, setSubmissions] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(!selectedQuestion);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchQuestion = async () => {
    if (!selectedQuestionId) {
      setError("No question selected. Please open a question from Question Bank.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/questions/${selectedQuestionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load question");
      }

      setQuestion(data.question || data);
    } catch (err) {
      setError(err.message || "Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!selectedQuestionId) return;

    try {
      const response = await fetch(
        `${API_URL}/submissions/question/${selectedQuestionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSubmissions(
          Array.isArray(data) ? data : data.submissions || []
        );
      }
    } catch (err) {
      console.error("Failed to load submissions:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchQuestion();
      await fetchSubmissions();
    };

    loadData();
  }, [selectedQuestionId]);

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;

    setLanguage(selectedLanguage);
    setCode(
      question?.starterCode?.[selectedLanguage] ||
        defaultCode[selectedLanguage] ||
        ""
    );
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!selectedQuestionId) {
      setError("No question selected.");
      return;
    }

    if (!code.trim()) {
      setError("Please enter your code before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `${API_URL}/submissions/question/${selectedQuestionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            language,
            code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Submission failed");
      }

      setResult(data.submission || data);
      await fetchSubmissions();
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return value.join("\n");
    }

    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value, null, 2);
    }

    return value || "Not provided";
  };

  if (loading) {
    return (
      <div className="coding-loading">
        Loading coding problem...
      </div>
    );
  }

  if (!question) {
    return (
      <div className="coding-page">
        <div className="coding-error">
          {error || "Question could not be loaded."}
        </div>

        <button
          className="submit-code-button"
          onClick={() => navigate("/student/questions")}
        >
          Back to Question Bank
        </button>
      </div>
    );
  }

  return (
    <div className="coding-page">
      <div className="coding-header">
        <div>
          <p className="coding-label">CODING PLATFORM</p>

          <h1>{question.title || "Untitled Question"}</h1>

          <p>
            Practice coding, submit solutions, and view your results.
          </p>
        </div>

        <div className="question-badge">
          Question ID: {String(selectedQuestionId).slice(-6)}
        </div>
      </div>

      {error && <div className="coding-error">{error}</div>}

      <div className="coding-layout">
        <section className="problem-card">
          <h2>Problem Statement</h2>

          <p>
            {question.description || "No problem description available."}
          </p>

          {question.inputFormat && (
            <>
              <h3>Input Format</h3>
              <p>{renderValue(question.inputFormat)}</p>
            </>
          )}

          {question.outputFormat && (
            <>
              <h3>Output Format</h3>
              <p>{renderValue(question.outputFormat)}</p>
            </>
          )}

          {question.samples && (
            <>
              <h3>Examples</h3>
              <pre>{renderValue(question.samples)}</pre>
            </>
          )}

          {question.constraints && (
            <>
              <h3>Constraints</h3>

              {Array.isArray(question.constraints) ? (
                <ul>
                  {question.constraints.map((constraint, index) => (
                    <li key={index}>{constraint}</li>
                  ))}
                </ul>
              ) : (
                <pre>{renderValue(question.constraints)}</pre>
              )}
            </>
          )}

          {question.explanation && (
            <>
              <h3>Explanation</h3>
              <p>{question.explanation}</p>
            </>
          )}
        </section>

        <section className="editor-card">
          <div className="editor-toolbar">
            <h2>Code Editor</h2>

            <select
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <textarea
            className="code-editor"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Write your code here..."
            spellCheck="false"
          />

          <button
            className="submit-code-button"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Code"}
          </button>

          {result && (
            <div className={`submission-result ${result.status || ""}`}>
              <h3>Submission Result</h3>

              <p>
                <strong>Status:</strong>{" "}
                {result.result || result.status || "Unknown"}
              </p>

              <p>
                <strong>Passed Test Cases:</strong>{" "}
                {result.passedTestCases ?? 0} /{" "}
                {result.totalTestCases ?? 0}
              </p>

              {result.executionTime !== undefined && (
                <p>
                  <strong>Execution Time:</strong>{" "}
                  {result.executionTime} ms
                </p>
              )}

              {result.memoryUsed !== undefined && (
                <p>
                  <strong>Memory Used:</strong>{" "}
                  {result.memoryUsed}
                </p>
              )}

              {result.errorMessage && (
                <p>
                  <strong>Error:</strong>{" "}
                  {result.errorMessage}
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      <section className="history-card">
        <h2>Submission History</h2>

        {submissions.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <div className="history-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Result</th>
                  <th>Passed</th>
                  <th>Submitted At</th>
                </tr>
              </thead>

              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission._id}>
                    <td>{submission.language}</td>
                    <td>{submission.status}</td>
                    <td>{submission.result || "-"}</td>
                    <td>
                      {submission.passedTestCases ?? 0} /{" "}
                      {submission.totalTestCases ?? 0}
                    </td>
                    <td>
                      {submission.createdAt
                        ? new Date(
                            submission.createdAt
                          ).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default CodingPlatform;
