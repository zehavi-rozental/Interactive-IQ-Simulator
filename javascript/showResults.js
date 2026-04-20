function showResults(score, testType) {
    // סגור פופ-אפים אחרים אם פתוחים
    ['loginPopup', 'welcomePopup'].forEach(id => {
        const modalEl = document.getElementById(id);
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }
    });

    // הצג פופ-אפ תוצאות רק אם לא פתוח כבר
    const resultsPopupEl = document.getElementById('resultsPopup');
    if (!resultsPopupEl) return;
    let resultsPopup = bootstrap.Modal.getInstance(resultsPopupEl);
    if (!resultsPopup) resultsPopup = new bootstrap.Modal(resultsPopupEl);

    // עדכון הציון
    const scoreElement = document.getElementById('finalScore');
    const feedbackElement = document.querySelector('.feedback-message');
    if (scoreElement) scoreElement.textContent = `${score}`;
    if (feedbackElement) {
        let feedback = '';
        if (score >= 90) feedback = 'וואו! אתה ממש גאון! 🌟';
        else if (score >= 70) feedback = 'כל הכבוד! תוצאה מצוינת! 🎉';
        else if (score >= 50) feedback = 'יפה מאוד! המשך להתאמן! 💪';
        else feedback = 'אל דאגה, תמיד אפשר לנסות שוב! 🌈';
        feedbackElement.textContent = feedback;
    }

    resultsPopup.show();
}
