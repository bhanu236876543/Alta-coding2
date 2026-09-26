import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CodeRunner from "./CodeRunner";
import "./CodingPlatform.css";

const API_URL = import.meta.env.VITE_API_URL;

const CodingPlatform = () => {
  const { questionId } = useParams(); // Gets the question ID from /student/coding/:questionId

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/api/questions/${questionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch question");
        }

        setQuestion(data.question);
      } catch (err) {
        setError(err.message || "Unable to load question");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);

  if (loading) {
    return (
      <div className="coding-page">
        <h2>Loading question...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="coding-page">
        <div className="coding-error">{error}</div>
      </div>
    );
  }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch question");
      }

      setQuestion(data.question || data);
    } catch (err) {
      setError(err.message || "Unable to connect to the backend");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/submissions/question/${questionId}`,
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

  const handleCodeSubmit = async ({ code, language }) => {
    if (!code.trim()) {
      setError("Please write some code before submitting.");
      return;
    }

    setSubmitting(true);
    setResult({ status: "Queued", result: "Waiting for execution..." });
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/submissions/question/${questionId}`,
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
          const pollRes = await fetch(`${API_URL}/api/submissions/${data.submission._id}`, {
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

  if (!question) {
    return (
      <div className="coding-page">
        <div className="coding-error">Question not found.</div>
      </div>
    );
  }

  return (
    <div className="coding-page">
      <div className="coding-header">
        <p className="page-label">CODING PLATFORM</p>

        <h1>{question.title}</h1>

        <p className="page-description">
          Solve the problem using the code editor and run your code.
        </p>
      </div>

      <div className="coding-layout">
        {/* Question */}
        <section className="problem-card">
          <h2>Problem Statement</h2>

          <p>{question.description}</p>

          {question.constraints && (
            <>
              <h3>Constraints</h3>
              <p>{question.constraints}</p>
            </>
          )}

          {question.inputFormat && (
            <>
              <h3>Input Format</h3>
              <p>{question.inputFormat}</p>
            </>
          )}

          {question.outputFormat && (
            <>
              <h3>Output Format</h3>
              <p>{question.outputFormat}</p>
            </>
          )}

          {question.sampleInput && (
            <>
              <h3>Sample Input</h3>
              <pre>{question.sampleInput}</pre>
            </>
          )}

          {question.sampleOutput && (
            <>
              <h3>Sample Output</h3>
              <pre>{question.sampleOutput}</pre>
            </>
          )}

          {question.explanation && (
            <>
              <h3>Explanation</h3>
              <p>{question.explanation}</p>
            </>
          )}
        </section>

        {/* Monaco + Judge0 */}
        <section className="editor-card">
          <CodeRunner question={question} onSubmit={handleCodeSubmit} />
        </section>
      </div>
    </div>
  );
};

export default CodingPlatform;
