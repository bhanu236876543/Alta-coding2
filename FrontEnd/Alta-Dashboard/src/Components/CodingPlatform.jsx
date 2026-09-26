import { useEffect, useState } from "react";
import "./CodingPlatform.css";

const API_URL = "http://localhost:5001/api";

const CodingPlatform = () => {
  const questionId = "6aa6422c15ef666b30e23bee";

  const [question, setQuestion] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(
`nums = list(map(int, input().split()))
target = int(input())

for i in range(len(nums)):
    for j in range(i + 1, len(nums)):
        if nums[i] + nums[j] == target:
            print(i, j)
            break`
  );

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchQuestion();
    fetchSubmissions();
  }, []);

  const fetchQuestion = async () => {
    try {
      const response = await fetch(
        `${API_URL}/questions/${questionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load question");
        return;
      }

      setQuestion(data.question || data);
    } catch (err) {
      setError("Unable to connect to the backend");
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(
        `${API_URL}/submissions/question/${questionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSubmissions(data);
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Please write some code before submitting.");
      return;
    }

    setSubmitting(true);
    setResult({ status: "Queued", result: "Waiting for execution..." });
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/submissions/question/${questionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-idempotency-key": window.crypto.randomUUID()
          },
          body: JSON.stringify({
            language,
            code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Submission failed");
        setSubmitting(false);
        return;
      }

      setResult(data.submission);
      
      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(`${API_URL}/submissions/${data.submission._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const pollData = await pollRes.json();
          if (pollRes.ok) {
            setResult(pollData);
            if (pollData.status !== "pending" && pollData.status !== "running") {
              clearInterval(pollInterval);
              setSubmitting(false);
              fetchSubmissions();
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2000);

    } catch (err) {
      setError("Unable to submit code. Check whether the backend is running.");
      setSubmitting(false);
    }
  };

  return (
    <div className="coding-page">
      <div className="coding-header">
        <div>
          <p className="page-label">CODING PLATFORM</p>
          <h1>{question?.title || "Two Sum"}</h1>
          <p className="page-description">
            Solve the problem, submit your code, and view your results.
          </p>
        </div>
      </div>

      {error && <div className="coding-error">{error}</div>}

      <div className="coding-layout">
        <section className="problem-card">
          <h2>Problem Statement</h2>

          <p>
            Given an array of integers and a target integer, return the
            indices of two numbers such that they add up to the target.
          </p>

          <h3>Input Format</h3>
          <p>
            The first line contains the array elements separated by spaces.
            The second line contains the target value.
          </p>

          <h3>Output Format</h3>
          <p>
            Print the indices of the two numbers whose sum equals the target.
          </p>

          <h3>Example</h3>

          <pre>
{`Input:
2 7 11 15
9

Output:
0 1`}
          </pre>

          <h3>Test Cases</h3>
          <p>
            The code will be checked against sample and hidden test cases.
          </p>
        </section>

        <section className="editor-card">
          <div className="editor-toolbar">
            <label htmlFor="language">Language:</label>

            <select
              id="language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
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
            spellCheck="false"
          />

          <button
            className="submit-code-button"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Running..." : "Submit Code"}
          </button>

          {result && (
            <div className={`result-card ${result.status}`}>
              <h2>{result.result}</h2>

              <div className="result-grid">
                <div>
                  <span>Status</span>
                  <strong>{result.status}</strong>
                </div>

                <div>
                  <span>Passed Tests</span>
                  <strong>
                    {result.passedTestCases}/{result.totalTestCases}
                  </strong>
                </div>

                <div>
                  <span>Execution Time</span>
                  <strong>{result.executionTime} ms</strong>
                </div>

                <div>
                  <span>Memory Used</span>
                  <strong>{result.memoryUsed} KB</strong>
                </div>
              </div>

              {result.errorMessage && (
                <pre className="error-output">
                  {result.errorMessage}
                </pre>
              )}
            </div>
          )}
        </section>
      </div>

      <section className="history-card">
        <h2>Submission History</h2>

        {submissions.length === 0 ? (
          <p>No submissions found.</p>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Result</th>
                  <th>Status</th>
                  <th>Passed</th>
                  <th>Language</th>
                  <th>Execution Time</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission._id}>
                    <td>{submission.result || "Pending"}</td>
                    <td>{submission.status}</td>
                    <td>
                      {submission.passedTestCases}/
                      {submission.totalTestCases}
                    </td>
                    <td>{submission.language}</td>
                    <td>{submission.executionTime} ms</td>
                    <td>
                      {new Date(
                        submission.createdAt
                      ).toLocaleString()}
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