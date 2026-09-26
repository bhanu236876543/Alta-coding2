import "./CodeRunner.css";
import { useState } from "react";
import Editor from "@monaco-editor/react";

const languages = [
  { label: "JavaScript", value: "javascript", monacoLanguage: "javascript" },
  { label: "Python", value: "python", monacoLanguage: "python" },
  { label: "Java", value: "java", monacoLanguage: "java" },
  { label: "C++", value: "cpp", monacoLanguage: "cpp" },
  { label: "C", value: "c", monacoLanguage: "c" },
];

const defaultCode = {
  javascript: `console.log("Hello, CodeForge!");`,
  python: `print("Hello, CodeForge!")`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodeForge!");
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, CodeForge!" << endl;
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, CodeForge!\\n");
    return 0;
}`,
};

function CodeRunner({ question }) {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(defaultCode.python);
  const [input, setInput] = useState(question?.sampleInput || "");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const currentLanguage = languages.find((item) => item.value === language);

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;

    setLanguage(selectedLanguage);
    setCode(defaultCode[selectedLanguage]);
    setOutput("");
    setError("");
    setStatus("");
  };

  const handleRun = async () => {
    setLoading(true);
    setOutput("");
    setError("");
    setStatus("Running...");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/execution/run`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            language,
            code,
            input,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to execute code");
      }

      const result = data.result;

      const statusMap = {
        3: "Accepted",
        4: "Wrong Answer",
        5: "Time Limit Exceeded",
        6: "Compilation Error",
        7: "Runtime Error",
        11: "Runtime Error (NZEC)",
      };

      setStatus(
        statusMap[result?.statusId] ||
          result?.statusDescription ||
          "Execution Finished",
      );

      setOutput(result?.stdout || "");
      setError(result?.stderr || "");
    } catch (err) {
      setStatus("Execution Failed");
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-runner">
      <div className="code-runner-header">
        <select
          value={language}
          onChange={handleLanguageChange}
          disabled={loading}
        >
          {languages.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <button onClick={handleRun} disabled={loading}>
          {loading ? "Running..." : "Run"}
        </button>
      </div>

      <div className="editor-container">
        <Editor
          height="500px"
          language={currentLanguage.monacoLanguage}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
          }}
        />
      </div>

      <div className="input-section">
        <h3>Custom Input</h3>

        <textarea
          placeholder="Enter input for your program..."
          rows="5"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </div>

      <div className="output-section">
        <h3>Output</h3>

        {status && (
          <p
            className={`execution-status ${
              status === "Accepted"
                ? "status-success"
                : status === "Running..."
                  ? "status-running"
                  : "status-error"
            }`}
          >
            {status}
          </p>
        )}

        <div className="output-box">
          {loading && <p>Running your code...</p>}

          {!loading && output && <pre>{output}</pre>}

          {!loading && error && <pre>{error}</pre>}

          {!loading && !output && !error && (
            <p>Run your code to see the output.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CodeRunner;
