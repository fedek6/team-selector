const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./teams.db");

const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

let tableName = "teams";
db.get(
  `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`,
  (err, row) => {
    if (err) {
      console.error(err.message);
      return false;
    }
    // row will be undefined if table does not exist
    if (row === undefined) {
      db.run(
        `CREATE TABLE ${tableName} (id INTEGER PRIMARY KEY, nickname TEXT, team TEXT)`,
        (err) => {
          if (err) {
            return console.error(err.message);
          }
          console.log(`Created table ${tableName}`);
        }
      );
    } else {
      console.log(`Table ${tableName} already exists`);
    }
  }
);

// Endpoint to add a member to a team
app.post("/team/:teamName/member", (req, res) => {
  const { teamName } = req.params;
  const { nickname } = req.body;

  db.get(
    `SELECT COUNT(*) as count FROM teams WHERE team = ?`,
    [teamName],
    (err, row) => {
      if (row.count >= 8) {
        return res.status(400).json({ message: "Team is full" });
      }

      db.get(
        `SELECT COUNT(*) as count FROM teams WHERE nickname = ?`,
        [nickname],
        (err, row) => {
          if (row.count > 0) {
            return res.status(400).json({ message: "Nickname already taken" });
          }

          // Add member to the team
          db.run(
            `INSERT INTO teams(nickname, team) VALUES(?, ?)`,
            [nickname, teamName],
            function (err) {
              if (err) {
                return res.status(500).json({ message: "Database error" });
              }
              res.json({
                message: "Member added",
                data: { nickname, team: teamName },
              });
            }
          );
        }
      );
    }
  );
});

// Endpoint to get members of a team
app.get("/members", (req, res) => {
  db.all(
    `SELECT nickname, team FROM teams ORDER by team DESC`,
    [],
    function (err, rows) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json(rows.map((row) => ({ nickname: row.nickname, team: row.team })));
    }
  );
});

app.listen(4000, () => console.log("Server started on port 4000"));
