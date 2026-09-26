const {
  executeCode,
  isLanguageSupported,
  languageMap,
} = require("../services/executionService");

const runCode = async (req, res) => {
  try {
    const { language, code, input } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        success: false,
        message: "Language and code are required",
      });
    }

    if (!isLanguageSupported(language)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language: ${language}`,
        supportedLanguages: Object.keys(languageMap),
      });
    }

    const result = await executeCode({ language, code, input });

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Run code error:", error.message);
    res.status(500).json({
      success: false,
      message: "Code execution failed",
    });
  }
};

module.exports = { runCode };
