
const noteForm = document.getElementById('noteForm');
const noteTitle = document.getElementById('noteTitle');
const noteSubject = document.getElementById('noteSubject');
const notePriority = document.getElementById('notePriority');
const noteContent = document.getElementById('noteContent');
const notesContainer = document.getElementById('notesContainer');
const searchInput = document.getElementById('searchInput');
const filterSubject = document.getElementById('filterSubject');

const totalNotesStat = document.getElementById('totalNotesStat');
const highPriorityStat = document.getElementById('highPriorityStat');
const pinnedStat = document.getElementById('pinnedStat');

let selectedTheme = 'theme-pink';

let notes = JSON.parse(localStorage.getItem('study_space_notes')) || [];

function addEmojiPoint(emoji) {
    const start = noteContent.selectionStart;
    const end = noteContent.selectionEnd;
    const text = noteContent.value;
    
    const prefix = (start === 0 || text[start - 1] === '\n') ? '' : '\n';
    noteContent.value = text.substring(0, start) + prefix + emoji + text.substring(end);
    noteContent.focus();
}


function selectColor(el) {
    document.querySelectorAll('.color-dot').forEach(dot => dot.classList.remove('active'));
    el.classList.add('active');
    selectedTheme = el.getAttribute('data-theme');
}


noteForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const newNote = {
        id: Date.now(),
        title: noteTitle.value.trim(),
        subject: noteSubject.value.trim(),
        priority: notePriority.value,
        content: noteContent.value.trim(),
        theme: selectedTheme,
        isPinned: false,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    };

    notes.unshift(newNote);
    saveAndRender();
    noteForm.reset();
});

function togglePin(id) {
    notes = notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n);
    saveAndRender();
}


function copyNote(content) {
    navigator.clipboard.writeText(content);
    alert('📋 Note copied to clipboard!');
}


function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    saveAndRender();
}


function saveAndRender() {
    localStorage.setItem('study_space_notes', JSON.stringify(notes));
    updateSubjectDropdown();
    updateStats();
    renderNotes();
}

function updateStats() {
    totalNotesStat.textContent = `📝 Total Notes: ${notes.length}`;
    highPriorityStat.textContent = `🔥 High Priority: ${notes.filter(n => n.priority === 'High').length}`;
    pinnedStat.textContent = `📌 Pinned: ${notes.filter(n => n.isPinned).length}`;
}

function updateSubjectDropdown() {
    const subjects = [...new Set(notes.map(n => n.subject))];
    const currentSelected = filterSubject.value;

    filterSubject.innerHTML = '<option value="all">🎨 All Subjects</option>';
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        if (subject === currentSelected) option.selected = true;
        filterSubject.appendChild(option);
    });
}

function renderNotes() {
    const query = searchInput.value.toLowerCase();
    const selectedSubject = filterSubject.value;

    let filteredNotes = notes.filter(note => {
        const matchSearch = note.title.toLowerCase().includes(query) ||
                            note.subject.toLowerCase().includes(query) ||
                            note.content.toLowerCase().includes(query);
        const matchSubject = (selectedSubject === 'all') || (note.subject === selectedSubject);
        return matchSearch && matchSubject;
    });

    filteredNotes.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

    if (filteredNotes.length === 0) {
        notesContainer.innerHTML = `
            <div class="empty-state">
                ✨ No notes found. Add your first study note to get started!
            </div>
        `;
        return;
    }

    notesContainer.innerHTML = filteredNotes.map(note => {
        const badgeClass = note.priority === 'High' ? 'badge-high' : (note.priority === 'Medium' ? 'badge-med' : 'badge-low');
        const priorityIcon = note.priority === 'High' ? '🔴 High' : (note.priority === 'Medium' ? '🟡 Med' : '🟢 Low');

        return `
            <div class="note-card ${note.theme || 'theme-pink'}">
                <div>
                    <div class="card-top">
                        <h3>${escapeHtml(note.title)}</h3>
                        <button class="pin-btn ${note.isPinned ? 'pinned' : ''}" onclick="togglePin(${note.id})" title="Pin Note">📌</button>
                    </div>
                    <div class="note-meta">
                        <span class="badge badge-subject">🏷️ ${escapeHtml(note.subject)}</span>
                        <span class="badge ${badgeClass}">${priorityIcon}</span>
                    </div>
                    <p class="note-content">${escapeHtml(note.content)}</p>
                </div>
                <div class="note-footer">
                    <span class="date-text">🕒 ${note.date}</span>
                    <div class="actions">
                        <button class="btn-card-action" onclick="copyNote('${escapeHtml(note.content).replace(/'/g, "\\'")}')" title="Copy">📋</button>
                        <button class="btn-card-action" onclick="deleteNote(${note.id})" title="Delete" style="color: #ef4444;">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

searchInput.addEventListener('input', renderNotes);
filterSubject.addEventListener('change', renderNotes);

updateSubjectDropdown();
updateStats();
renderNotes();