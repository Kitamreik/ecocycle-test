export class CalendarManager {
    constructor() {
        this.sessions = [];
        this.sessionsByDate = {};
        this.calendarData = {};
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.isNavigating = false;

        this.monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // DOM elements - will be initialized when attachEventListeners is called
        this.elements = {
            daysContainer: null,
            monthDisplay: null,
            sessionsList: null,
            selectedDateHeading: null,
            prevMonthBtn: null,
            nextMonthBtn: null
        };
    }

    async init(initialData = {}) {
        if (initialData.sessions) {
            this.sessions = initialData.sessions;
            this.sessionsByDate = this.groupSessionsByDate(initialData.sessions);
        }
        if (initialData.calendarData) {
            this.calendarData = initialData.calendarData;
            this.currentMonth = initialData.calendarData.currentMonth;
            this.currentYear = initialData.calendarData.currentYear;
        }

        await this.renderCalendar();
    }

    attachEventListeners() {
        // Remove any existing event listeners
        if (this.elements.prevMonthBtn) {
            this.elements.prevMonthBtn.removeEventListener('click', this._handlePrevMonth);
            this.elements.nextMonthBtn.removeEventListener('click', this._handleNextMonth);
        }

        // Initialize DOM elements
        this.elements = {
            daysContainer: document.getElementById('calendar-days'),
            monthDisplay: document.getElementById('currentMonth'),
            sessionsList: document.getElementById('sessionsList'),
            selectedDateHeading: document.getElementById('selectedDateHeading'),
            prevMonthBtn: document.getElementById('prevMonth'),
            nextMonthBtn: document.getElementById('nextMonth')
        };

        // Create bound event handlers
        this._handlePrevMonth = () => this.navigateMonth(-1);
        this._handleNextMonth = () => this.navigateMonth(1);

        // Attach event listeners
        if (this.elements.prevMonthBtn) {
            this.elements.prevMonthBtn.addEventListener('click', this._handlePrevMonth);
        }
        if (this.elements.nextMonthBtn) {
            this.elements.nextMonthBtn.addEventListener('click', this._handleNextMonth);
        }

        // Initial render
        this.renderCalendar();
    }

    async navigateMonth(direction) {
        // Prevent duplicate calls
        if (this.isNavigating) return;
        this.isNavigating = true;

        try {
            this.currentMonth += direction;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            } else if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            await this.fetchMonthData();
            this.renderCalendar();
        } finally {
            this.isNavigating = false;
        }
    }

    async fetchMonthData() {
        try {
            const response = await fetch(`/admin/api/calendar/events?month=${this.currentMonth + 1}&year=${this.currentYear}`);
            if (!response.ok) throw new Error('Failed to fetch data');

            const data = await response.json();
            if (data.success) {
                this.sessions = data.sessions;
                this.sessionsByDate = this.groupSessionsByDate(data.sessions);
                this.renderCalendar();
            }
        } catch (error) {
            console.error('Error fetching month data:', error);
        }
    }

    groupSessionsByDate(sessions) {
        return sessions.reduce((acc, session) => {
            if (!acc[session.tsdate]) {
                acc[session.tsdate] = [];
            }
            acc[session.tsdate].push(session);
            return acc;
        }, {});
    }

    renderCalendar() {
        if (!this.elements.daysContainer || !this.elements.monthDisplay) return;

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startingDay = firstDay.getDay();
        const monthDays = lastDay.getDate();

        // Update month/year display
        this.elements.monthDisplay.textContent = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;

        // Clear previous days
        this.elements.daysContainer.innerHTML = '';

        // Previous month's days
        const prevMonthDays = new Date(this.currentYear, this.currentMonth, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            this.createDayElement(prevMonthDays - i, true);
        }

        // Current month's days
        for (let day = 1; day <= monthDays; day++) {
            const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasSessions = this.sessionsByDate[dateStr]?.length > 0;
            const isToday = day === this.currentDate.getDate() &&
                this.currentMonth === this.currentDate.getMonth() &&
                this.currentYear === this.currentDate.getFullYear();

            this.createDayElement(day, false, dateStr, hasSessions, isToday);
        }

        // Next month's days
        const totalDays = this.elements.daysContainer.children.length;
        const remainingDays = 42 - totalDays;
        for (let i = 1; i <= remainingDays; i++) {
            this.createDayElement(i, true);
        }
    }

    createDayElement(day, isOtherMonth, dateStr = null, hasSessions = false, isToday = false) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day' +
            (isOtherMonth ? ' other-month' : '') +
            (hasSessions ? ' has-sessions' : '') +
            (isToday ? ' today' : '');

        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);

        if (hasSessions) {
            const indicator = document.createElement('div');
            indicator.className = 'session-indicator';
            dayElement.appendChild(indicator);
        }

        if (dateStr && !isOtherMonth) {
            dayElement.addEventListener('click', () => this.showSessions(dateStr));
        }

        this.elements.daysContainer.appendChild(dayElement);
    }

    showSessions(dateStr) {
        if (!this.elements.sessionsList || !this.elements.selectedDateHeading) return;

        const daySessions = this.sessionsByDate[dateStr] || [];
        const formattedDate = new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        this.elements.selectedDateHeading.textContent = `Sessions for ${formattedDate}`;
        this.elements.sessionsList.innerHTML = '';

        if (daySessions.length === 0) {
            this.elements.sessionsList.innerHTML = '<p class="no-sessions">No sessions scheduled for this date</p>';
            return;
        }

        // Sort sessions by start time
        daySessions
            .sort((a, b) => (a.tsstarttime || '').localeCompare(b.tsstarttime || ''))
            .forEach(session => {
                const sessionCard = this.createSessionCard(session);
                this.elements.sessionsList.appendChild(sessionCard);
            });
    }

    createSessionCard(session) {
        const sessionCard = document.createElement('div');
        sessionCard.className = 'session-card';

        sessionCard.innerHTML = `
            <div class="session-time">
                ${session.tsstarttime ? session.tsstarttime.substring(0, 5) : 'TBD'}
                ${session.tsendtime ? ' - ' + session.tsendtime.substring(0, 5) : ''}
            </div>
            <div class="session-info">
                <strong>${session.schools?.sname || 'Unknown School'}</strong>
                <div class="session-details">
                    <span><i class="fa-solid fa-user"></i> ${session.users?.username || 'Unassigned'}</span>
                    <span><i class="fa-solid fa-graduation-cap"></i> ${session.tsgrades || 'N/A'}</span>
                    <span><i class="fa-solid fa-users"></i> ${session.tsstudents || 0} students</span>
                </div>
                <div>
                    <span class="status-badge ${(session.sessionstatuses?.sessionstatusname || '').toLowerCase().replace(/\s+/g, '-')}">
                        ${session.sessionstatuses?.sessionstatusname || 'Unknown'}
                    </span>
                </div>
            </div>
            <div class="session-actions">
                <a href="/admin/training-sessions/edit/${session.tsid}" class="button link">
                    <i class="fa-solid fa-edit"></i>
                </a>
            </div>
        `;

        return sessionCard;
    }
}