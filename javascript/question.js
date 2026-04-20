const questions = document.getElementById("questions");
const userName = sessionStorage.getItem('userName');
const userNameDisplay = document.getElementById("userNameDisplay");

if (userNameDisplay) {
    userNameDisplay.textContent = `שלום ${userName}! 😊`; 
}

let questionsArray = [];
let index = 0;
let CountingPoints = 0;
let lenQuestionsArray = 0;

function loadQuestions(level) {

    
    $.ajax({
        url: `../json/question_level_${level}.json`,
        dataType: 'json', // חשוב לציין שהנתונים הם JSON
        success: (data) => {
    
            if (data && data.questions && Array.isArray(data.questions)) {
                questionsArray = shuffleArray(data.questions);
            } else if (Array.isArray(data)) { // אם ה-JSON הוא ישירות מערך
                questionsArray = shuffleArray(data);
            } else {
                console.error("מבנה קובץ ה-JSON עבור השאלות אינו תקין.");
                questions.innerHTML = `<div style="text-align: center; color: red;">
                                            <h2>שגיאה בטעינת השאלות</h2>
                                            <p>מבנה קובץ ה-JSON אינו תקין. אנא בדוק/י אותו.</p>
                                        </div>`;
                return;
            }
            
            lenQuestionsArray = questionsArray.length;
            if (lenQuestionsArray > 0) {
                showQuestion(index);
            } else {
                console.warn("קובץ ה-JSON נטען אך אינו מכיל שאלות.");
                questions.innerHTML = `<div style="text-align: center;">
                                            <h2>אין שאלות זמינות</h2>
                                            <p>אנא ודא/י שקובץ ה-JSON מכיל שאלות.</p>
                                        </div>`;
            }
        },
        error: (xhr, status, error) => {
            console.error(`AJAX Error loading question_level_${level}.json: ${status} - ${error}`, xhr);
            alert('אירעה שגיאה במהלך שליפת הנתונים של השאלות.');
        }
    });
}

// Call initially with level low
loadQuestions('low');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showResultsPopup() {
    showResults(CountingPoints, 'question');
}

function showQuestion(idx) {
    if (idx >= lenQuestionsArray) {
        displayResults();
        return;
    }
    
    let currQuestion = questionsArray[idx];
    questions.innerHTML = '';

    // יצירת מיכל עליון לכפתור הרמה
    let topContainer = document.createElement('div');
    topContainer.className = 'top-controls';
    topContainer.style.cssText = 'text-align: left; margin-bottom: 20px;';
    
    // כפתור מעבר לרמה גבוהה
    let nextLevelButton = document.createElement('button');
    nextLevelButton.textContent = '⬆️ עבור לרמה גבוהה יותר';
    nextLevelButton.className = 'next-level-button';
    nextLevelButton.style.cssText = 'padding: 8px 15px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;';
    nextLevelButton.addEventListener('click', () => {
        if (confirm('האם אתה בטוח שברצונך לעבור לרמה גבוהה יותר? התוצאות שלך יתאפסו.')) {
            index = 0;
            CountingPoints = 0;
            loadQuestions('high');
        }
        nextLevelButton.style.display = 'none';
        nextLevelButton.disabled = true; // Disable the button after clicking
    });
    
    topContainer.appendChild(nextLevelButton);
    questions.appendChild(topContainer);

    let qDiv = document.createElement('div');
    qDiv.className = 'question';
    qDiv.textContent = currQuestion.question;
    questions.appendChild(qDiv);

    if (currQuestion.answers && Array.isArray(currQuestion.answers)) {
        currQuestion.answers.forEach((ans, ansIdx) => {
            let aDiv = document.createElement('div');
            aDiv.className = 'answer';
            aDiv.textContent = ans.option;
            aDiv.addEventListener('click', () => {
                if (ans.correct) {
                    CountingPoints += Math.ceil(100 / lenQuestionsArray);
                }
                index++;
                showQuestion(index);
            });
            questions.appendChild(aDiv);
        });
    } else {
        console.error("מבנה תשובות לא תקין עבור שאלה באינדקס:", idx, currQuestion);
        questions.innerHTML = `<div style="text-align: center; color: red;">
                                    <h2>שגיאה במבנה השאלה</h2>
                                    <p>אחת השאלות אינה בפורמט תקין. אנא בדוק/י את קובץ ה-JSON.</p>
                                </div>`;
        return;
    }
}

// פונקציה להצגת תוצאות סופיות בפופ-אפ
function displayResults() {
    // סגור פופ-אפים אחרים אם פתוחים
    ['loginPopup', 'welcomePopup', 'resultsPopup'].forEach(id => {
        const modalEl = document.getElementById(id);
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }
    });

    // עדכון הציון בפופ-אפ
    const score = Math.min(CountingPoints, 100).toFixed(0);
    document.getElementById('finalScoreDisplay').textContent = score;

    // הודעה חמודה
    let msg = '';
    if (score >= 90) msg = 'וואו! אתה ממש גאון! 🌟';
    else if (score >= 70) msg = 'כל הכבוד! תוצאה מצוינת! 🎉';
    else if (score >= 50) msg = 'יפה מאוד! המשך להתאמן! 💪';
    else msg = 'אל דאגה, תמיד אפשר לנסות שוב! 🌈';
    document.getElementById('cuteMessage').textContent = msg;

    // הצגת הפופ-אפ
    const quizEndModal = new bootstrap.Modal(document.getElementById('quizEndModal'));
    quizEndModal.show();
}

// פונקציות לטיפול בכפתור חזרה למסך הראשי (חייבות להיות קיימות כי הן נקראות מה-HTML)
function confirmExit() {
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const exitModal = new bootstrap.Modal(document.getElementById('exitConfirmModal'));
        exitModal.show();
    } else {
        if (confirm('האם אתה בטוח שברצונך לצאת? כל ההתקדמות תאבד!')) {
            goToMain();
        }
    }
}

function goToMain() {
    window.location.href = '../index.html'; 
}
