const bookshelf = [];
const RENDER_EVENT = 'render-bookshelf';
const SAVED_EVENT = 'saved-bookshelf';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function checkStorage() {
    if (typeof (Storage) === undefined) {
        alert('Browser anda tidak mendukung local storage')
        return false;
    }
    return true;
};

function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;
    const checkbox = document.getElementById('inputBookIsComplete');

    const generatedId = generateId();
    const bookObject = generateBookObject(generatedId, bookTitle, bookAuthor, bookYear, checkbox.checked);

    bookshelf.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    };
}

function addToCompletedShelf(bookId) {
    const targetedBook = findBookById(bookId);

    if (targetedBook == null) return;

    targetedBook.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoFromCompleted(bookId) {
    const targetedBook = findBookById(bookId);

    if (targetedBook == null) return;

    targetedBook.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeFromShelf(bookId) {
    const targetedBook = findBookIndex(bookId);

    if (targetedBook === -1) return;

    bookshelf.splice(targetedBook, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookById(bookId) {
    for (const book of bookshelf) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in bookshelf) {
        if (bookshelf[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function saveData() {
    if (checkStorage()) {
        const parsed = JSON.stringify(bookshelf);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if (data !== null) {
        for (const book of data) {
            bookshelf.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeShelf(bookObject) {
    const textTitle = document.createElement('h2');
    textTitle.innerHTML = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerHTML = 'Penulis:' + bookObject.author;

    const textYear = document.createElement('p');
    textYear.innerHTML = 'Tahun terbit:' + bookObject.year;

    const container = document.createElement('article');
    container.classList.add('book_item');
    container.append(textTitle, textAuthor, textYear);
    container.setAttribute('id', `bookshelf-${bookObject.id}`)

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('action');

    if (bookObject.isComplete) {
        const undoButton = document.createElement('button');
        undoButton.innerHTML = 'Belum selesai';
        undoButton.classList.add('green');

        undoButton.addEventListener('click', function () {
            undoFromCompleted(bookObject.id);
        });

        buttonGroup.append(undoButton);
    } else {
        const completeButton = document.createElement('button');
        completeButton.innerHTML = 'Sudah selesai';
        completeButton.classList.add('green');

        completeButton.addEventListener('click', function () {
            addToCompletedShelf(bookObject.id);
        });

        buttonGroup.append(completeButton);
    }

    const removeButton = document.createElement('button');
    removeButton.innerHTML = 'Hapus dari rak buku';
    removeButton.classList.add('red');

    removeButton.addEventListener('click', function () {
        removeFromShelf(bookObject.id);
        alert('Buku berhasil dihapus');
    });

    buttonGroup.append(removeButton);

    container.append(buttonGroup);

    return container;
}

function changeText() {
    const checkboxInput = document.getElementById('inputBookIsComplete');
    const buttonText = document.getElementById('bookSubmit');

    if (checkboxInput.checked) {
        buttonText.innerHTML = 'Masukkan Buku ke rak <span>Selesai dibaca</span>'
    } else {
        buttonText.innerHTML = 'Masukkan Buku ke rak <span>Belum selesai dibaca</span>'
    }
}

function clearText() {
    document.getElementById('inputBookTitle').value = '';
    document.getElementById('inputBookAuthor').value = '';
    document.getElementById('inputBookYear').value = ''; 
}

function searchBookByTitle() {
    const bookTitleQuery = document.getElementById('searchBookTitle').value;
    bookTitleQuery.toLowerCase();
    for (const book of bookshelf) {
        if (book.title.toLowerCase() === bookTitleQuery) {
            return book.id;
        }
    }
}

function refreshHiddenList() {
    for(const book of bookshelf) {
        document.getElementById(`bookshelf-${book.id}`).removeAttribute('hidden');
    }
}

function renderByQuery() {
    const targetedBookId = searchBookByTitle();
    for (const book of bookshelf) {
        if (book.id !== targetedBookId) {
            document.getElementById(`bookshelf-${book.id}`).setAttribute('hidden', true);
        }
    }
    document.getElementById('searchBookTitle').value = '';
    document.getElementById('refreshButton').removeAttribute('hidden');
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
        clearText();
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        renderByQuery();
    });

    const refreshButton = document.getElementById('refreshButton');
    refreshButton.addEventListener('click', function() {
        refreshHiddenList();
        refreshButton.setAttribute('hidden', true);
    });

    if (checkStorage()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function() {
    const uncompletedShelf = document.getElementById('incompleteBookshelfList');
    uncompletedShelf.innerHTML = '';

    const completedShelf = document.getElementById('completeBookshelfList');
    completedShelf.innerHTML = '';

    for (const book of bookshelf) {
        const bookElem = makeShelf(book);
        if (!book.isComplete) {
            uncompletedShelf.append(bookElem);
        } else {
            completedShelf.append(bookElem);
        }
    };
});