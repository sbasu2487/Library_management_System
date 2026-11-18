// Sample Initial Data Storage (using LocalStorage for persistence)
let books = JSON.parse(localStorage.getItem('lib_books')) || [
    { id: 'B001', title: 'The Alchemist', author: 'Paulo Coelho', category: 'Fiction', quantity: 5, available: 4 },
    { id: 'B002', title: 'Clean Code', author: 'Robert C. Martin', category: 'Technology', quantity: 3, available: 3 }
];

let issuedRecords = JSON.parse(localStorage.getItem('lib_issued')) || [
    { issueId: 1, bookId: 'B001', title: 'The Alchemist', student: 'John Doe', date: '2026-06-01' }
];

// Set default issue date to today
document.getElementById('issueDate').valueAsDate = new Date();

function saveData() {
    localStorage.setItem('lib_books', JSON.stringify(books));
    localStorage.setItem('lib_issued', JSON.stringify(issuedRecords));
    updateDashboard();
}

// Switch Tabs
function switchTab(tabId, element) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');

    if (tabId === 'view-books') renderBooksTable();
    if (tabId === 'search-books') searchBooks();
    if (tabId === 'issue-book') populateIssueDropdown();
    if (tabId === 'return-book') renderIssuedTable();
    updateDashboard();
}

// 1. Update Dashboard
function updateDashboard() {
    let totalBooks = books.reduce((sum, b) => sum + parseInt(b.quantity), 0);
    let availableBooks = books.reduce((sum, b) => sum + parseInt(b.available), 0);
    let issuedCount = issuedRecords.length;

    document.getElementById('stat-total').innerText = totalBooks;
    document.getElementById('stat-available').innerText = availableBooks;
    document.getElementById('stat-issued').innerText = issuedCount;
}

// 2. Add New Book
function addBook(e) {
    e.preventDefault();
    const id = document.getElementById('bookId').value.trim();
    
    if(books.some(b => b.id === id)) {
        alert('A book with this ID already exists!');
        return;
    }

    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const category = document.getElementById('bookCategory').value.trim();
    const quantity = parseInt(document.getElementById('bookQuantity').value);

    books.push({ id, title, author, category, quantity, available: quantity });
    saveData();
    alert('Book added successfully!');
    document.getElementById('addBookForm').reset();
    switchTab('view-books', document.querySelectorAll('.nav-links li')[2]);
}

// 3. View All Books
function renderBooksTable() {
    const tbody = document.getElementById('booksTableBody');
    tbody.innerHTML = '';
    
    if (books.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No books available in the inventory.</td></tr>`;
        return;
    }

    books.forEach(book => {
        tbody.innerHTML += `
            <tr>
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.category}</td>
                <td>${book.quantity}</td>
                <td>${book.available}</td>
                <td><button class="btn-danger" onclick="deleteBook('${book.id}')">Delete</button></td>
            </tr>
        `;
    });
}

function deleteBook(id) {
    if(confirm('Are you sure you want to delete this book record?')) {
        books = books.filter(b => b.id !== id);
        saveData();
        renderBooksTable();
    }
}

// 4. Search Books
function searchBooks() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const type = document.getElementById('searchType').value;
    const tbody = document.getElementById('searchTableBody');
    tbody.innerHTML = '';

    let filtered = books.filter(book => {
        if(type === 'title') return book.title.toLowerCase().includes(query);
        if(type === 'author') return book.author.toLowerCase().includes(query);
        if(type === 'id') return book.id.toLowerCase().includes(query);
    });

    if(filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No matching books found.</td></tr>`;
        return;
    }

    filtered.forEach(book => {
        tbody.innerHTML += `
            <tr>
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.category}</td>
                <td>${book.available}</td>
            </tr>
        `;
    });
}

// 5. Issue Books
function populateIssueDropdown() {
    const select = document.getElementById('issueBookSelect');
    select.innerHTML = '<option value="">-- Select Available Book --</option>';
    
    books.filter(b => b.available > 0).forEach(book => {
        select.innerHTML += `<option value="${book.id}">${book.title} (Available: ${book.available})</option>`;
    });
}

function issueBook(e) {
    e.preventDefault();
    const bookId = document.getElementById('issueBookSelect').value;
    const student = document.getElementById('studentName').value.trim();
    const date = document.getElementById('issueDate').value;

    let book = books.find(b => b.id === bookId);
    if(book && book.available > 0) {
        book.available -= 1;
        issuedRecords.push({
            issueId: Date.now(),
            bookId: book.id,
            title: book.title,
            student: student,
            date: date
        });
        saveData();
        alert('Book issued successfully!');
        document.getElementById('issueBookForm').reset();
        document.getElementById('issueDate').valueAsDate = new Date();
        populateIssueDropdown();
    } else {
        alert('Selected book is not available.');
    }
}

// 6. Return Books
function renderIssuedTable() {
    const tbody = document.getElementById('issuedBooksTableBody');
    tbody.innerHTML = '';

    if(issuedRecords.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No books currently issued.</td></tr>`;
        return;
    }

    issuedRecords.forEach(record => {
        tbody.innerHTML += `
            <tr>
                <td>${record.issueId}</td>
                <td>${record.title}</td>
                <td>${record.student}</td>
                <td>${record.date}</td>
                <td><button class="btn-success" onclick="returnBook(${record.issueId}, '${record.bookId}')">Return</button></td>
            </tr>
        `;
    });
}

function returnBook(issueId, bookId) {
    if(confirm('Confirm return of this book?')) {
        let book = books.find(b => b.id === bookId);
        if(book) {
            book.available += 1;
        }

        issuedRecords = issuedRecords.filter(r => r.issueId !== issueId);
        saveData();
        renderIssuedTable();
        alert('Book returned successfully!');
    }
}

// Initial setup on load
updateDashboard();