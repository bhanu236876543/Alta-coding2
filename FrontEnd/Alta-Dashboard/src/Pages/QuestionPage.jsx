import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CodeRunner from "../Components/CodeRunner";
import "./QuestionPage.css";

function QuestionPage() {
  const { id } = useParams();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/questions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch question");
        }

        setQuestion(data.question);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  if (loading) {
    return <p>Loading question...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="question-page">
      <div className="question-content">
        <h1>{question.title}</h1>

        <span className="question-difficulty">{question.difficulty}</span>

        <p>{question.description}</p>

        {question.constraints && (
          <section>
            <h2>Constraints</h2>
            <p>{question.constraints}</p>
          </section>
        )}

        {question.inputFormat && (
          <section>
            <h2>Input Format</h2>
            <p>{question.inputFormat}</p>
          </section>
        )}

        {question.outputFormat && (
          <section>
            <h2>Output Format</h2>
            <p>{question.outputFormat}</p>
          </section>
        )}

        {question.sampleInput && (
          <section>
            <h2>Sample Input</h2>
            <pre>{question.sampleInput}</pre>
          </section>
        )}

        {question.sampleOutput && (
          <section>
            <h2>Sample Output</h2>
            <pre>{question.sampleOutput}</pre>
          </section>
        )}

        {question.explanation && (
          <section>
            <h2>Explanation</h2>
            <p>{question.explanation}</p>
          </section>
        )}
      </div>

      <div className="question-code">
        <CodeRunner question={question} />
      </div>
    </div>
  );
}

export default QuestionPage;
