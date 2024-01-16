const express = require("express");
const uuid = require("uuid");
const sqlite3 = require("sqlite3");
const axios = require("axios");

const app = express();
app.use(express.json());

const db = new sqlite3.Database("releases.db");

// GET ALL RELEASES
app.get("/releases", (request, response) => {
  let { limit } = request.query;
  limit = Math.min(limit || 50); // Limitando a 50 itens por padrão

  db.all("SELECT * FROM releases LIMIT ?", [limit], (err, rows) => {
    if (err) {
      return response.status(500).json({ error: err.message });
    }

    response.json(rows);
  });
});

// GET ONE RELEASE BY ID
app.get("/releases/:id", (request, response) => {
  const { id } = request.params;

  db.get("SELECT * FROM releases WHERE id = ?", [id], (err, row) => {
    if (err) {
      return response.status(500).json({ error: err.message });
    }

    if (!row) {
      return response.status(404).json({ error: "Release not found" });
    }

    response.json(row);
  });
});

// CREATE A NEW RELEASE
app.post("/releases", (request, response) => {
  const newRelease = { id: uuid.v4(), ...request.body };

  db.run(
    "INSERT INTO releases (id, title, description, releaseDate, platforms, status) VALUES (?, ?, ?, ?, ?, ?)",
    [
      newRelease.id,
      newRelease.title,
      newRelease.description,
      newRelease.releaseDate,
      newRelease.platforms,
      newRelease.status,
    ],
    (err) => {
      if (err) {
        return response.status(500).json({ error: err.message });
      }

      response.status(201).json({
        message: "Release added successfully",
        newRelease,
      });
    }
  );
});

// UPDATE A RELEASE BY ID
app.put("/releases/:id", (request, response) => {
  const { id } = request.params;
  const updatedRelease = request.body;

  db.run(
    "UPDATE releases SET title = ?, description = ?, releaseDate = ?, platforms = ?, status = ? WHERE id = ?",
    [
      updatedRelease.title,
      updatedRelease.description,
      updatedRelease.releaseDate,
      updatedRelease.platforms,
      updatedRelease.status,
      id,
    ],
    (err) => {
      if (err) {
        return response.status(500).json({ error: err.message });
      }

      response.json({
        message: "Release updated successfully",
        updatedRelease,
      });
    }
  );
});

// DELETE A RELEASE BY ID
app.delete("/releases/:id", (request, response) => {
  const { id } = request.params;

  db.run("DELETE FROM releases WHERE id = ?", [id], (err) => {
    if (err) {
      return response.status(500).json({ error: err.message });
    }

    response.json({ message: "Release deleted successfully" });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

async function fetchReleases() {
  try {
    const response = await axios.get("http://localhost:3000/releases");
    console.log(response.data);
  } catch (error) {
    console.error("Error fetching releases:", error.message);
  }
}

fetchReleases();

