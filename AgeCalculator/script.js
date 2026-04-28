document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('age-form');
    const dayInput = document.getElementById('day');
    const monthInput = document.getElementById('month');
    const yearInput = document.getElementById('year');
    
    const resYears = document.getElementById('res-years');
    const resMonths = document.getElementById('res-months');
    const resDays = document.getElementById('res-days');
    
    const resNextBday = document.getElementById('res-next-bday');
    const resDaysUntil = document.getElementById('res-days-until');
    const resTotalDays = document.getElementById('res-total-days');
    const resHeartbeats = document.getElementById('res-heartbeats');
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentDay = currentDate.getDate();
    
    // Set max year for the input
    yearInput.max = currentYear;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateInputs()) {
            calculateAge();
        }
    });

    // Clear errors on input
    [dayInput, monthInput, yearInput].forEach(input => {
        input.addEventListener('input', function() {
            clearError(this);
        });
    });

    function validateInputs() {
        let isValid = true;
        const d = parseInt(dayInput.value);
        const m = parseInt(monthInput.value);
        const y = parseInt(yearInput.value);

        // Reset errors
        clearError(dayInput);
        clearError(monthInput);
        clearError(yearInput);

        // Validate Day
        if (!dayInput.value) {
            showError(dayInput, 'This field is required');
            isValid = false;
        } else if (d < 1 || d > 31) {
            showError(dayInput, 'Must be a valid day');
            isValid = false;
        }

        // Validate Month
        if (!monthInput.value) {
            showError(monthInput, 'This field is required');
            isValid = false;
        } else if (m < 1 || m > 12) {
            showError(monthInput, 'Must be a valid month');
            isValid = false;
        }

        // Validate Year
        if (!yearInput.value) {
            showError(yearInput, 'This field is required');
            isValid = false;
        } else if (y > currentYear) {
            showError(yearInput, 'Must be in the past');
            isValid = false;
        } else if (y < 1900) {
            showError(yearInput, 'Must be a valid year');
            isValid = false;
        }

        // Check for valid date combination (e.g., Feb 30th, April 31st)
        if (isValid) {
            // Month is 0-indexed in Date constructor
            const dateObj = new Date(y, m - 1, d);
            
            // If the date object's month or date doesn't match the input, it rolled over (invalid date)
            if (dateObj.getFullYear() !== y || dateObj.getMonth() !== m - 1 || dateObj.getDate() !== d) {
                showError(dayInput, 'Must be a valid date');
                isValid = false;
            } else if (dateObj > currentDate) {
                // Check if the specific date is in the future
                showError(yearInput, 'Must be in the past');
                isValid = false;
            }
        }

        return isValid;
    }

    function showError(input, message) {
        const group = input.parentElement;
        group.classList.add('error');
        const errorMsg = group.querySelector('.error-msg');
        errorMsg.textContent = message;
    }

    function clearError(input) {
        const group = input.parentElement;
        group.classList.remove('error');
        const errorMsg = group.querySelector('.error-msg');
        errorMsg.textContent = '';
    }

    function calculateAge() {
        const birthDay = parseInt(dayInput.value);
        const birthMonth = parseInt(monthInput.value);
        const birthYear = parseInt(yearInput.value);

        let ageYears = currentYear - birthYear;
        let ageMonths = currentMonth - birthMonth;
        let ageDays = currentDay - birthDay;

        // If birth day is greater than current day, borrow a month
        if (ageDays < 0) {
            ageMonths--;
            
            // Calculate days in the previous month
            const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            const prevMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
            const daysInPrevMonth = new Date(prevMonthYear, prevMonth, 0).getDate();
            
            ageDays += daysInPrevMonth;
        }

        // If birth month is greater than current month (or if we borrowed and it went < 0), borrow a year
        if (ageMonths < 0) {
            ageYears--;
            ageMonths += 12;
        }

        // Animate the results
        animateValue(resYears, ageYears, 1000);
        animateValue(resMonths, ageMonths, 1000);
        animateValue(resDays, ageDays, 1000);

        // Calculate Extra Stats
        const birthDateObj = new Date(birthYear, birthMonth - 1, birthDay);
        const timeDiff = currentDate.getTime() - birthDateObj.getTime();
        const totalDaysLived = Math.floor(timeDiff / (1000 * 3600 * 24));

        const approxHeartbeats = totalDaysLived * 115200; // ~80 beats/min * 60 * 24

        let nextBdayYear = currentYear;
        let nextBday = new Date(nextBdayYear, birthMonth - 1, birthDay);

        const todayZero = new Date(currentYear, currentMonth - 1, currentDay);
        if (nextBday < todayZero) {
            nextBdayYear++;
            nextBday = new Date(nextBdayYear, birthMonth - 1, birthDay);
        }

        const daysUntilBday = Math.ceil((nextBday.getTime() - todayZero.getTime()) / (1000 * 3600 * 24));

        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        const nextBdayString = nextBday.toLocaleDateString('en-US', options);

        // Update Extra Stats UI
        resNextBday.textContent = nextBdayString;
        resNextBday.classList.remove('animate-value');
        void resNextBday.offsetWidth;
        resNextBday.classList.add('animate-value');

        animateValue(resDaysUntil, daysUntilBday, 1000, val => `${val} days`);
        animateValue(resTotalDays, totalDaysLived, 1000, val => val.toLocaleString());
        animateValue(resHeartbeats, approxHeartbeats, 1000, val => `~${val.toLocaleString()}`);
    }

    function animateValue(element, endValue, duration, formatFn = val => val) {
        // Reset animation state
        element.classList.remove('animate-value');
        element.textContent = '--';
        
        // Force reflow
        void element.offsetWidth;
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // easeOutQuart easing
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            
            const currentVal = Math.floor(easeProgress * endValue);
            element.textContent = formatFn(currentVal);
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = formatFn(endValue);
                element.classList.add('animate-value');
            }
        };
        
        window.requestAnimationFrame(step);
    }
});
