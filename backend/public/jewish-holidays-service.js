// Jewish Holidays Service
// Uses the Hebcal API to fetch and display Jewish holidays

class JewishHolidaysService {
  constructor() {
    this.cache = new Map();
    this.apiBase = 'https://www.hebcal.com/hebcal';
  }

  /**
   * Get holidays for a specific year
   * @param {number} year - The year to fetch holidays for
   * @returns {Promise<Object>} Object with date keys and holiday arrays as values
   */
  async getHolidaysForYear(year) {
    if (this.cache.has(year)) {
      return this.cache.get(year);
    }

    try {
      const response = await fetch(`${this.apiBase}?v=1&cfg=json&maj=on&min=on&mod=on&year=${year}`);
      const data = await response.json();
      
      // Process holidays into a more usable format
      const holidays = {};
      data.items.forEach(item => {
        if (item.category === 'holiday' || item.category === 'modern') {
          const date = item.date;
          if (!holidays[date]) {
            holidays[date] = [];
          }
          holidays[date].push({
            title: item.title,
            titleHeb: item.hebrew || item.title,
            category: item.category,
            date: date,
            isHoliday: true
          });
        }
      });

      this.cache.set(year, holidays);
      return holidays;
    } catch (error) {
      console.error('Error fetching Jewish holidays:', error);
      return {};
    }
  }

  /**
   * Get holidays for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} Array of holidays for that date
   */
  async getHolidaysForDate(date) {
    const year = new Date(date).getFullYear();
    const holidays = await this.getHolidaysForYear(year);
    return holidays[date] || [];
  }

  /**
   * Get holidays for a specific month
   * @param {number} year - The year
   * @param {number} month - The month (1-12)
   * @returns {Promise<Object>} Object with date keys and holiday arrays as values
   */
  async getHolidaysForMonth(year, month) {
    const holidays = await this.getHolidaysForYear(year);
    const monthStr = month.toString().padStart(2, '0');
    const monthHolidays = {};
    
    Object.keys(holidays).forEach(date => {
      if (date.startsWith(`${year}-${monthStr}`)) {
        monthHolidays[date] = holidays[date];
      }
    });
    
    return monthHolidays;
  }

  /**
   * Get the color for a holiday category
   * @param {string} category - The holiday category
   * @returns {string} Hex color code
   */
  getHolidayColor(category) {
    switch (category) {
      case 'holiday': return '#d97706'; // Major holidays - orange
      case 'modern': return '#7c3aed'; // Modern holidays - purple
      default: return '#6b7280'; // Default - gray
    }
  }

  /**
   * Get the icon for a holiday category
   * @param {string} category - The holiday category
   * @returns {string} Emoji icon
   */
  getHolidayIcon(category) {
    switch (category) {
      case 'holiday': return '🕯️'; // Major holidays - candles
      case 'modern': return '🇮🇱'; // Modern holidays - flag
      default: return '📅'; // Default - calendar
    }
  }

  /**
   * Generate holiday indicator HTML
   * @param {Array} holidays - Array of holiday objects
   * @returns {string} HTML string for holiday indicators
   */
  generateHolidayIndicators(holidays) {
    if (!holidays || holidays.length === 0) return '';
    
    return holidays.map(holiday => {
      const icon = this.getHolidayIcon(holiday.category);
      const color = this.getHolidayColor(holiday.category);
      const title = holiday.title;
      
      return `<span class="holiday-indicator" style="background-color: ${color}; color: white;" title="${title}">${icon}</span>`;
    }).join('');
  }

  /**
   * Check if a date has holidays
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {Object} holidaysMap - Pre-fetched holidays map
   * @returns {boolean} True if the date has holidays
   */
  hasHolidayOnDate(date, holidaysMap) {
    return holidaysMap && holidaysMap[date] && holidaysMap[date].length > 0;
  }

  /**
   * Get CSS class for holiday styling
   * @param {Array} holidays - Array of holiday objects
   * @returns {string} CSS class name
   */
  getHolidayCssClass(holidays) {
    if (!holidays || holidays.length === 0) return '';
    return 'has-holiday';
  }
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.JewishHolidaysService = JewishHolidaysService;
}
