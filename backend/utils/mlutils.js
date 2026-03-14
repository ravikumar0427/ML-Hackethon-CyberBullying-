const { PythonShell } = require('python-shell');
const path = require('path');

class MLUtils {
  static async predictMessage(message) {
    return new Promise((resolve, reject) => {
      // Get the correct path to predict.py
      const scriptPath = path.join(__dirname, '..', 'ml-model');
      
      const options = {
        mode: 'text',
        pythonPath: 'python', // Use 'python3' on Linux/Mac
        scriptPath: scriptPath,
        args: [JSON.stringify({ text: message })]
      };

      PythonShell.run('predict.py', options, (err, results) => {
        if (err) {
          console.error('Python shell error:', err);
          reject(err);
        } else {
          try {
            // The last result should be our JSON output
            const lastResult = results[results.length - 1];
            const prediction = JSON.parse(lastResult);
            resolve(prediction);
          } catch (parseError) {
            console.error('Parse error:', parseError);
            console.error('Raw results:', results);
            reject(parseError);
          }
        }
      });
    });
  }
}

module.exports = MLUtils;