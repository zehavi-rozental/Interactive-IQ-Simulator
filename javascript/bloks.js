const userNameDisplay = document.getElementById("userNameDisplay");
const userName = sessionStorage.getItem('userName') || ''; // שינוי מ-'name' ל-'userName'

if (userNameDisplay) {
    userNameDisplay.textContent = `שלום ${userName}! 😊`; 
}

const questionsContainer = document.getElementById("questions");
let questionsData = [];
let currentQuestion = 0;
let CountingPoints = 0;
let lenQuestionsData = 0;

$.ajax({
    url: '../json/bloks.json', // ודא שזה הנתיב הנכון לקובץ ה-JSON של מבחן הבלוקים
    dataType: 'json', // חשוב לציין שהנתונים הם JSON
    success: (data) => {
        console.log("נתונים שהתקבלו מקובץ ה-JSON (bloks.json):", data); 
        // ודא את מבנה ה-JSON שלך כאן. אם הוא ישירות מערך של שאלות:
        if (data && Array.isArray(data) && data.length > 0) {
            questionsData = shuffleArray(data);
            lenQuestionsData = questionsData.length;
            showQuestion(currentQuestion);
        } else {
            console.error("קובץ ה-JSON של הבלוקים ריק או לא מכיל נתונים תקינים של שאלות.");
            questionsContainer.innerHTML = `<div style="text-align: center; color: red;">
                                                <h2>שגיאה בטעינת השאלות</h2>
                                                <p>לא ניתן היה לטעון את השאלות. אנא ודא/י שקובץ ה-JSON תקין ומכיל שאלות.</p>
                                            </div>`;
        }
    },
    error: (xhr, status, error) => {
        console.error(`AJAX Error loading bloks.json: ${status} - ${error}`, xhr);
        alert('אירעה שגיאה במהלך שליפת הנתונים של הבלוקים.');
    }
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // החלפת מקומות
    }
    return array;
}

// פונקציה להצגת שאלה בודדת
function showResultsPopup() {
    showResults(CountingPoints, 'bloks');
}

function showQuestion(idx) {
    if (idx >= lenQuestionsData) {
        showResultsPopup();
        return;
    }

    questionsContainer.innerHTML = ''; // מנקה את התוכן הקודם
    const currentQ = questionsData[idx]; 

    // בדיקת תקינות מבנה השאלה: ודא שיש מערך answers ובתוכו אובייקט יחיד עם התשובות
    if (!currentQ || !currentQ.answers || !Array.isArray(currentQ.answers) || currentQ.answers.length === 0 || !currentQ.answers[0].answer1 || !currentQ.answers[0].answer2 || !currentQ.answers[0].correct) {
        console.error("מבנה שאלה לא תקין באינדקס:", idx, currentQ);
        questionsContainer.innerHTML = `<div style="text-align: center; color: red;">
                                            <h2>שגיאה במבנה השאלה</h2>
                                            <p>אחת השאלות אינה בפורמט תקין. אנא בדוק/י את קובץ ה-JSON (חסרים מאפייני תשובות או המבנה שגוי).</p>
                                        </div>`;
        return;
    }

    // יצירת אלמנט התשובות (כאן נציג את 3 התמונות לבחירה)
    const answerDiv = document.createElement('div');
    answerDiv.className = 'answers-area fade-in'; // נשתמש באותו קלאס לעיצוב הרשת

    // בניית מערך התשובות לערבוב, בהתאם למבנה ה-JSON שלך (answer1, answer2, correct)
    const answersFromJSON = currentQ.answers[0]; // גישה לאובייקט התשובות היחיד במערך
    const allAnswers = [
        { src: answersFromJSON.answer1, isCorrect: false },
        { src: answersFromJSON.answer2, isCorrect: false },
        { src: answersFromJSON.correct, isCorrect: true } // התשובה הנכונה
    ];
    
    const shuffledAnswers = shuffleArray(allAnswers); // ערבוב סדר התמונות

    let answersHtml = '';
    shuffledAnswers.forEach(ans => {
        // *** שינוי קריטי כאן: הוספת תיקיית המשנה 'bloks/' לנתיב התמונה ***
        answersHtml += `<img class="answer-img ${ans.isCorrect ? 'correct-answer' : ''}" src="../img/bloks/${ans.src}" alt="תשובה">`;
    });
    answerDiv.innerHTML = answersHtml;
    questionsContainer.appendChild(answerDiv); // הוסף את דיב התשובות לקונטיינר השאלות

    // מאזין לכל תמונת תשובה
    answerDiv.querySelectorAll('.answer-img').forEach(img => {
        img.addEventListener('click', () => {
            // בדוק אם התשובה נכונה באמצעות הקלאס 'correct-answer'
            if (img.classList.contains('correct-answer')) {
                CountingPoints += Math.ceil(100 / lenQuestionsData);
            }

            if (currentQuestion < questionsData.length - 1) {
                currentQuestion++;
                showQuestion(currentQuestion);
            } else {
                displayResults(); // הצג תוצאות סופיות
            }
        });
    });

    // כפתור "רמה גבוהה יותר" - הוסר מכיוון שזהו מבחן "יוצא דופן" עם מבנה שונה
    // אם תרצי להוסיף פונקציונליות של רמות, נצטרך לדון איך זה ישתלב עם מבחן היוצא דופן
}

// פונקציה להצגת תוצאות סופיות בפופ-אפ
function displayResults() {
    // מחיקת תוכן המבחן מהדף
    questionsContainer.innerHTML = ''; 

    const finalScore = Math.min(CountingPoints, 100).toFixed(0);
    let message = "";

    // בחירת הודעה חמודה בהתאם לציון
    if (finalScore >= 90) {
        message = "וואו! אתה גאון אמיתי! כל הכבוד על ציון מדהים! 🌟";
    } else if (finalScore >= 70) {
        message = "יפה מאוד! עבודה נהדרת, אתה ממש חכם! ✨";
    } else if (finalScore >= 50) {
        message = "כל הכבוד! אתה בדרך הנכונה, תמשיך ללמוד ולהשתפר! 👍";
    } else {
        message = "אל דאגה! כל ניסיון הוא הזדמנות ללמוד. נסה שוב ותראה שיפור! 😊";
    }

    // מילוי הנתונים בפופ-אפ
    document.getElementById('finalScoreDisplay').textContent = finalScore;
    document.getElementById('cuteMessage').textContent = message;

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
