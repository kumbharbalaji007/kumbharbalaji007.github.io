let currentExamId = null;
let currentExamData = [];

// Navigation Functions
function showLanding() {
    document.getElementById('landing-view').style.display = 'block';
    document.getElementById('auth-view').style.display = 'none';
    document.getElementById('request-view').style.display = 'none';
    document.getElementById('register-view').style.display = 'none';
    document.getElementById('exam-view').style.display = 'none';
    document.getElementById('access-code').value = '';
    document.getElementById('auth-error').style.display = 'none';
    currentExamId = null;
    currentExamData = [];
}

function selectExam(examId) {
    currentExamId = examId;
    let title = "Mock Paper";
    if (examId === 'exam1') title = "Mock Paper 1";
    if (examId === 'exam2') title = "Mock Paper 2";
    if (examId === 'exam3') title = "Mock Paper 3";
    
    document.getElementById('auth-title').innerText = "Unlock " + title;
    document.getElementById('requested-exam-name').value = title;
    document.getElementById('request-next-url').value = window.location.href;
    
    document.getElementById('landing-view').style.display = 'none';
    document.getElementById('auth-view').style.display = 'block';
}

function showRequestView() {
    document.getElementById('auth-view').style.display = 'none';
    document.getElementById('request-view').style.display = 'block';
}

// Security & Decryption Functions
async function decryptData(encryptedBase64, password) {
    try {
        const enc = new TextEncoder();
        const exportBuffer = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
        
        // Extract salt, iv, and ciphertext
        const salt = exportBuffer.slice(0, 16);
        const iv = exportBuffer.slice(16, 16 + 12);
        const data = exportBuffer.slice(16 + 12);

        const keyMaterial = await window.crypto.subtle.importKey(
            "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]
        );

        const key = await window.crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
            keyMaterial, { name: "AES-GCM", length: 256 }, true, ["decrypt"]
        );

        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv }, key, data
        );

        const dec = new TextDecoder();
        return JSON.parse(dec.decode(decrypted));
    } catch (e) {
        throw new Error("Decryption failed. Incorrect code.");
    }
}

async function unlockExam() {
    const code = document.getElementById('access-code').value;
    const errorEl = document.getElementById('auth-error');
    
    if (!code) {
        errorEl.innerText = "Please enter an access code.";
        errorEl.style.display = 'block';
        return;
    }

    try {
        // EXAM_DATA is defined in exam_data.js
        if (!EXAM_DATA || !EXAM_DATA[currentExamId]) {
            throw new Error("Exam data not found. Please contact the administrator.");
        }

        const encryptedString = EXAM_DATA[currentExamId];
        currentExamData = await decryptData(encryptedString, code);
        
        // Success! Show registration form before exam
        showRegisterView();
        
    } catch (e) {
        errorEl.innerText = "Invalid access code. Please try again.";
        errorEl.style.display = 'block';
    }
}

let currentUser = { name: '', email: '', phone: '', tryNumber: 1 };

function showRegisterView() {
    document.getElementById('auth-view').style.display = 'none';
    document.getElementById('register-view').style.display = 'block';
}

function startExam(event) {
    event.preventDefault();
    currentUser.name = document.getElementById('reg-name').value;
    currentUser.email = document.getElementById('reg-email').value;
    currentUser.phone = document.getElementById('reg-phone').value;

    // Calculate Try Number using localStorage
    const storageKey = `exam_try_${currentUser.email}_${currentExamId}`;
    let prevTries = localStorage.getItem(storageKey);
    if (prevTries) {
        currentUser.tryNumber = parseInt(prevTries) + 1;
    } else {
        currentUser.tryNumber = 1;
    }
    localStorage.setItem(storageKey, currentUser.tryNumber);

    document.getElementById('register-view').style.display = 'none';
    renderExam();
}

// Exam Rendering
function renderExam() {
    document.getElementById('auth-view').style.display = 'none';
    document.getElementById('exam-view').style.display = 'block';
    
    let title = "Mock Paper";
    if (currentExamId === 'exam1') title = "Mock Paper 1";
    if (currentExamId === 'exam2') title = "Mock Paper 2";
    if (currentExamId === 'exam3') title = "Mock Paper 3";
    document.getElementById('exam-title').innerText = title;

    const container = document.getElementById('quiz-container');
    container.innerHTML = '';
    
    // Hide results if previously shown
    document.getElementById('result-container').style.display = 'none';
    document.getElementById('submit-btn').style.display = 'block';

    currentExamData.forEach((q, index) => {
        const isMultiple = q.ans.length > 1;
        const inputType = isMultiple ? "checkbox" : "radio";
        const helperText = isMultiple ? `<span class="help-text">(Select ${q.ans.length} options)</span>` : `<span class="help-text">(Select 1 option)</span>`;
        
        let html = `<div class="question-card" id="q${index}">
            <div class="question-text">${index + 1}. ${q.q.replace(/\n/g, '<br>')} ${helperText}</div>
            <div class="options">`;
        
        for (const [key, val] of Object.entries(q.options)) {
            html += `
                <div class="option" id="opt-${index}-${key}" onclick="document.getElementById('input-${index}-${key}').click()">
                    <input type="${inputType}" name="q${index}" id="input-${index}-${key}" value="${key}" onclick="event.stopPropagation()">
                    <label for="input-${index}-${key}"><strong>${key}.</strong> ${val}</label>
                </div>
            `;
        }
        
        html += `</div>
            <div class="feedback" id="feedback-${index}"></div>
        </div>`;
        
        container.innerHTML += html;
    });
}

// Exam Scoring
document.getElementById('submit-btn').addEventListener('click', () => {
    let score = 0;
    
    currentExamData.forEach((q, index) => {
        const inputs = document.querySelectorAll(`input[name="q${index}"]:checked`);
        const userAns = Array.from(inputs).map(i => i.value).sort();
        const correctAns = [...q.ans].sort();
        
        const isCorrect = JSON.stringify(userAns) === JSON.stringify(correctAns);
        if (isCorrect) {
            score++;
        }

        const feedbackEl = document.getElementById(`feedback-${index}`);
        if (isCorrect) {
            feedbackEl.innerHTML = `<span class="text-success">✔ Correct!</span>`;
        } else {
            if (userAns.length === 0) {
                feedbackEl.innerHTML = `<span class="text-danger">✘ Unanswered. The correct answer is: ${correctAns.join(', ')}</span>`;
            } else {
                feedbackEl.innerHTML = `<span class="text-danger">✘ Incorrect. The correct answer is: ${correctAns.join(', ')}</span>`;
            }
        }

        for (const [key, val] of Object.entries(q.options)) {
            const optDiv = document.getElementById(`opt-${index}-${key}`);
            optDiv.classList.remove('correct-opt', 'incorrect-opt');
            
            if (correctAns.includes(key)) {
                optDiv.classList.add('correct-opt');
            } else if (userAns.includes(key)) {
                optDiv.classList.add('incorrect-opt');
            }
            
            // Disable inputs after submission
            document.getElementById(`input-${index}-${key}`).disabled = true;
        }
    });

    // Show final result
    const resultEl = document.getElementById('result-container');
    resultEl.style.display = 'block';
    const percentage = Math.round((score / currentExamData.length) * 100);
    
    if (percentage >= 70) {
        resultEl.style.backgroundColor = 'var(--success-bg)';
        resultEl.style.borderColor = 'var(--success-border)';
        resultEl.style.color = '#155724';
    } else {
        resultEl.style.backgroundColor = 'var(--danger-bg)';
        resultEl.style.borderColor = 'var(--danger-border)';
        resultEl.style.color = '#721c24';
    }
    
    resultEl.innerHTML = `
        <div class="score">Your Score: ${score} / ${currentExamData.length} (${percentage}%)</div>
        <div>${percentage >= 70 ? 'Congratulations, you passed! 🎉' : 'Keep studying, you can do this! 📖'}</div>
    `;
    
    document.getElementById('submit-btn').style.display = 'none'; // hide submit button
    
    // Send score to FormSubmit silently using AJAX
    let title = "Mock Paper";
    if (currentExamId === 'exam1') title = "Mock Paper 1";
    if (currentExamId === 'exam2') title = "Mock Paper 2";
    if (currentExamId === 'exam3') title = "Mock Paper 3";

    const formData = new FormData();
    formData.append('_subject', `Exam Score: ${currentUser.name} - ${title}`);
    formData.append('Name', currentUser.name);
    formData.append('Email', currentUser.email);
    formData.append('Phone', currentUser.phone);
    formData.append('Exam', title);
    formData.append('Score', `${score} / ${currentExamData.length} (${percentage}%)`);
    formData.append('Attempt_Number', currentUser.tryNumber);
    formData.append('_captcha', 'false');
    // Using the ajax endpoint so it doesn't redirect
    fetch('https://formsubmit.co/ajax/kumbharbalaji007@gmail.com', {
        method: 'POST',
        body: formData
    }).then(response => console.log('Score submitted successfully.'))
      .catch(error => console.error('Error submitting score:', error));

    // Scroll to the top to see the score
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Handle Enter key for auth
document.getElementById('access-code').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        unlockExam();
    }
});
