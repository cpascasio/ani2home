const express = require("express");
const admin = require("firebase-admin");

const db = admin.firestore();
const router = express.Router();

// Function to get Firestore design with sample data
async function getFirestoreDesign() {
  const result = [];
  const collections = await db.listCollections();

  for (const col of collections) {
    const colInfo = { name: col.id, sampleDocs: [] };
    const snapshot = await col.limit(5).get(); // get 5 sample docs

    snapshot.forEach((doc) => {
      colInfo.sampleDocs.push({
        id: doc.id,
        data: doc.data(), // include the actual document data
      });
    });

    result.push(colInfo);
  }

  return result;
}

// Route for Firestore design
router.get("/", async (req, res) => {
  try {
    const design = await getFirestoreDesign();
    res.status(200).json(design);
  } catch (error) {
    console.error("Error extracting Firestore design:", error);
    res.status(500).send("Error extracting Firestore design");
  }
});

module.exports = router;
