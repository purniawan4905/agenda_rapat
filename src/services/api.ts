const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` })
    };
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  }

  async register(name: string, email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return response.json();
  }

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Meeting endpoints
  async getMeetings(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await fetch(`${API_BASE_URL}/meetings?${queryString}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async createMeeting(meetingData: any) {
    const response = await fetch(`${API_BASE_URL}/meetings`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(meetingData)
    });
    return response.json();
  }

  async updateMeeting(id: string, meetingData: any) {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(meetingData)
    });
    return response.json();
  }

  async deleteMeeting(id: string) {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getMeetingStats() {
    const response = await fetch(`${API_BASE_URL}/meetings/stats`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Attendance endpoints
  async getAttendance(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await fetch(`${API_BASE_URL}/attendance?${queryString}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async recordAttendance(attendanceData: any) {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(attendanceData)
    });
    return response.json();
  }

  async updateAttendance(id: string, attendanceData: any) {
    const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(attendanceData)
    });
    return response.json();
  }

  async getAttendanceStats(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await fetch(`${API_BASE_URL}/attendance/stats?${queryString}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Minutes endpoints
  async getMinutes(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await fetch(`${API_BASE_URL}/minutes?${queryString}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async createMinutes(minutesData: any) {
    const response = await fetch(`${API_BASE_URL}/minutes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(minutesData)
    });
    return response.json();
  }

  async updateMinutes(id: string, minutesData: any) {
    const response = await fetch(`${API_BASE_URL}/minutes/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(minutesData)
    });
    return response.json();
  }

  async approveMinutes(id: string) {
    const response = await fetch(`${API_BASE_URL}/minutes/${id}/approve`, {
      method: 'PUT',
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Notification endpoints
  async getNotifications(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await fetch(`${API_BASE_URL}/notifications?${queryString}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async markNotificationAsRead(id: string) {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: this.getHeaders()
    });
    return response.json();
  }

  async markAllNotificationsAsRead() {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: this.getHeaders()
    });
    return response.json();
  }

  async deleteNotification(id: string) {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response.json();
  }
}

export const apiService = new ApiService();