// ---- FIREBASE OBJECT ----
import { initializeApp } from "firebase/app";
import {
  collection,
  getFirestore,
  onSnapshot,
  addDoc,
  deleteDoc,
  where,
  query,
  getDocs,
} from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyA15tcnq7jKG94y6dmlXvc3KdD-CbUnk7E",
  authDomain: "book-library-392501.firebaseapp.com",
  projectId: "book-library-392501",
  storageBucket: "book-library-392501.appspot.com",
  messagingSenderId: "91167548304",
  appId: "1:91167548304:web:2a9453be99e5136496c915",
};

// INIT FIREBASE APP

initializeApp(firebaseConfig);

// INIT SERVICES

const db = getFirestore();

//  QUERY

let q = query;

// COLLECTION REF

const colref = collection(db, "books");

// Function to display books on the page
function displayBooks(books) {
  // Sort the books based on the timestamp field in ascending order
  books.sort((a, b) => a.timestamp - b.timestamp);

  extendedContent.innerHTML = ""; // Clear the current content
  books.forEach((book) => {
    const { title, author, rating, randomColor, genre } = book;
    template(title, author, rating, randomColor, genre);
  });
}

// REAL TIME COLLECTION OF DATA

onSnapshot(colref, (snapshot) => {
  let books = [];
  snapshot.docs.forEach((doc) => {
    books.push({ ...doc.data(), id: doc.id });
  });
  console.log(books);
  displayBooks(books);
});

// Function to add new book to the page
function addBookToPage(book) {
  const { title, author, rating, randomColor, genre } = book;
  template(title, author, rating, randomColor, genre);
}

// ---- MAIN CODE ----

const rating = document.querySelector(".rating");
let btn = document.querySelector(".btn");
const submitBtn = document.querySelector(".complete-btn");
const extendedContent = document.querySelector(".extended-content");
let alert = document.querySelector(".alert");

// ---- TEMPLATE FOR INDIVIDUAL COMPONENT ----

const template = function (nameInp, authorInp, newVal, randomColor, select) {
  const html = `<div class="individual-component">
  <div class="book-cover" style="background-color: #${randomColor} ;"></div>
  <div class="book-content">
    <h1 class="name">${nameInp}</h1>
    <p class="author">by ${authorInp}</p>
    <p class="review">${newVal}/5</p>
    <button class="genre-btn">${select}</button>
    <button class="delete-btn">Delete</button>
  </div>
</div>`;
  extendedContent.innerHTML += html;
};

// ---- COMPLETED BUTTON EVENT ----

submitBtn.addEventListener("click", (e) => {
  let nameInp = document.querySelector(".name-input").value;
  let authorInp = document.querySelector(".author-input").value;
  let val = rating.style.cssText;
  let newVal = val.substring(9, val.length - 1);
  let randomColor = Math.floor(Math.random() * 16777215).toString(16);
  let select = document.querySelector(".select").value;

  // LOGIC FOR ALERT MODAL

  if (nameInp === "" || authorInp === "" || select === "None") {
    alert.classList.remove("hidden");
    setTimeout(() => {
      alert.classList.add("hidden");
    }, 3000);
  }

  // TEMPLATE EXECUTION
  else {
    // ADDING EACH COMPONENT TO FIREBASE

    addDoc(colref, {
      title: nameInp,
      author: authorInp,
      genre: select,
      rating: newVal,
      randomColor: randomColor,
      timestamp: Date.now(),
    });

    // Add the new book to the page

    addBookToPage({
      title: nameInp,
      author: authorInp,
      genre: select,
      rating: newVal,
      randomColor: randomColor,
      timestamp: Date.now(),
    });

    // FUNCTION FOR THE TEMPLATE AND RESET VALUES

    template(nameInp, authorInp, newVal, randomColor, select);
    rating.style = "--value : 2.5;";
    document.querySelector(".name-input").value = "";
    document.querySelector(".author-input").value = "";
    document.querySelector(".select").value = "None";
  }
});

// Function to get all books from Firebase Firestore
async function getAllBooks() {
  const querySnapshot = await getDocs(colref);
  const books = querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
  return books;
}

// Display books on page when the page loads
window.addEventListener("load", async () => {
  const books = await getAllBooks();
  displayBooks(books);
});

// ---- DELETING INDIVIDUAL COMPONENTS ----

extendedContent.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const bookName = e.target.parentElement.firstChild.nextSibling.textContent;
    q = query(colref, where("title", "==", bookName));
    // Get the document reference
    getDocs(q)
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          // Assuming there is only one document with the matching title
          const docRef = querySnapshot.docs[0].ref;

          // Delete the document from Firebase Firestore
          deleteDoc(docRef)
            .then(() => {
              console.log("Document successfully deleted!");
            })
            .catch((error) => {
              console.error("Error removing document: ", error);
            });
        }
      })
      .catch((error) => {
        console.error("Error getting documents: ", error);
      });

    e.target.parentElement.parentElement.remove();
  }
});

// EXTRA CODE FOR REVIEW FEATURE

// let review = document.querySelector(".review-inp").value;
// review.addEventListener("keyup", (e) => {
//   let val = 0;
//   let v = review.value;
//   let number = v.length;
//   val += number;
//   console.log(val);
// });
