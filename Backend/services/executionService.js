const JUDGE0_API_URL = process.env.JUDGE0_API_URL;
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST;

// language name -> Judge0 language_id
const languageMap = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
};

const isLanguageSupported = (language) =>
  Object.prototype.hasOwnProperty.call(languageMap, language);

const decode = (value) =>
  value ? Buffer.from(value, "base64").toString("utf-8") : "";

const executeCode = async ({ language, code, input = "" }) => {
  const languageId = languageMap[language];

  const payload = {
    language_id: languageId,
    source_code: Buffer.from(code).toString("base64"),
    stdin: Buffer.from(input).toString("base64"),
  };

  const url = `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true&fields=*`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": JUDGE0_API_KEY,
      "X-RapidAPI-Host": JUDGE0_API_HOST,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(
      `Judge0 request failed: ${response.status} ${body}`,
    );
    error.code = "JUDGE0_REQUEST_FAILED";
    throw error;
  }

  const result = await response.json();

  return {
    statusId: result.status?.id,
    statusDescription: result.status?.description,
    stdout: decode(result.stdout),
    stderr: decode(result.stderr),
    compileOutput: decode(result.compile_output),
    time: result.time,
    memory: result.memory,
  };
};

module.exports = { executeCode, isLanguageSupported, languageMap };
