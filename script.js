/* style.css */

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  background-color: #f9f9f9;
  margin: 20px;
  color: #333;
}

h1, h2 {
  text-align: center;
  color: #2a7a2a;
}

#setup, #scorecard, #results {
  max-width: 600px;
  margin: 20px auto;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
}

label {
  display: block;
  margin: 10px 0 5px;
  font-weight: 600;
}

input[type="text"],
input[type="number"] {
  width: 100%;
  padding: 8px 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

button {
  background-color: #2a7a2a;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #1f541f;
}

.player-score {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.player-score div:first-child {
  font-weight: 700;
  margin-bottom: 8px;
  color: #2a7a2a;
}

.player-score button {
  width: 30px;
  height: 30px;
  font-weight: bold;
  margin: 0 5px;
  padding: 0;
  line-height: 30px;
  text-align: center;
}

.player-score span {
  font-size: 18px;
  min-width: 25px;
  display: inline-block;
  text-align: center;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

input[type="checkbox"] {
  margin-left: 10px;
  transform: scale(1.2);
  vertical-align: middle;
}

@media (max-width: 480px) {
  body {
    margin: 10px;
  }

  button {
    font-size: 14px;
    padding: 8px 12px;
  }

  input[type="text"], input[type="number"] {
    font-size: 14px;
    padding: 6px 8px;
  }
}
