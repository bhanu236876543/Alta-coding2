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
          <CodeRunner question={question} />
        </section>
      </div>
    </div>
  );
};

export default CodingPlatform;
