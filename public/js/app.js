// URL Shortener App JavaScript
class URLShortener {
    constructor() {
        this.baseUrl = window.location.origin;
        // Security: Validate localStorage data before parsing
        this.recentLinks = this.getSecureLocalStorageData();
        this.totalUrls = 0;
        this.totalClicks = 0;
        this.init();
    }

    // Security: Safely parse localStorage data
    getSecureLocalStorageData() {
        try {
            const data = localStorage.getItem('recentLinks');
            if (!data) return [];
            
            const parsed = JSON.parse(data);
            // Validate that it's an array
            if (!Array.isArray(parsed)) return [];
            
            // Validate each link object structure
            return parsed.filter(link => 
                link && 
                typeof link === 'object' &&
                typeof link.originalUrl === 'string' &&
                typeof link.shortCode === 'string' &&
                typeof link.clicks === 'number'
            );
        } catch (error) {
            console.warn('Invalid localStorage data, clearing...');
            localStorage.removeItem('recentLinks');
            return [];
        }
    }

    init() {
        this.bindEvents();
        this.getRecentLinks();
    }

    async getRecentLinks() {
        this.showLoading(true);
        
        try {
            const response = await fetch('/api/analytics', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }

            const data = await response.json();
            this.recentLinks = data.recentUrls;
            this.totalUrls = data.totalUrls;
            this.totalClicks = data.totalClicks;
            this.displayRecentLinks();
        } catch (err) {
            console.error('Error loading recent links:', err);
            this.showToast('Failed to load analytics data', 'error');
        } finally {
            this.showLoading(false);
        }
    }     

    bindEvents() {
        const form = document.getElementById('urlForm');
        const copyBtn = document.getElementById('copyBtn');
        const testBtn = document.getElementById('testBtn');
        const newUrlBtn = document.getElementById('newUrlBtn');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        copyBtn.addEventListener('click', () => this.copyToClipboard());
        testBtn.addEventListener('click', () => this.testRedirect());
        newUrlBtn.addEventListener('click', () => this.resetForm());
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Security: Rate limiting - prevent rapid submissions
        if (this.isSubmitting) {
            this.showToast('Please wait before submitting another URL', 'error');
            return;
        }
        
        const originalUrl = document.getElementById('originalUrl').value.trim();
        
        // Security: Input length validation
        if (originalUrl.length > 2048) {
            this.showToast('URL is too long. Maximum 2048 characters allowed.', 'error');
            return;
        }
        
        if (!this.isValidUrl(originalUrl)) {
            this.showToast('Please enter a valid URL (http/https only)', 'error');
            return;
        }

        this.isSubmitting = true;
        this.showLoading(true);
        
        try {
            const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ originalUrl })
            });

            const data = await response.json();
            if (response.ok) {
                this.displayResult(data);
                this.addToRecentLinks(data);
                this.getRecentLinks();
                this.showToast('URL shortened successfully!', 'success');
            } else {
                throw new Error(data.error || 'Failed to shorten URL');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showToast(error.message || 'Something went wrong. Please try again.', 'error');
        } finally {
            this.isSubmitting = false;
            this.showLoading(false);
        }
    }

    displayResult(data) {
        const resultContainer = document.getElementById('resultContainer');
        const shortUrlElement = document.getElementById('shortUrl');
        
        shortUrlElement.textContent = data.shortUrl;
        resultContainer.style.display = 'block';
        
        // Scroll to result
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    async copyToClipboard(url = null) {
        const shortUrl = url || document.getElementById('shortUrl').textContent;
        
        try {
            await navigator.clipboard.writeText(shortUrl);
            this.showToast('URL copied to clipboard!', 'success');
            
            // Update button text temporarily (only for main copy button)
            if (!url) {
                const copyBtn = document.getElementById('copyBtn');
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                }, 2000);
            }
        } catch (error) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(shortUrl);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('URL copied to clipboard!', 'success');
        } catch (error) {
            this.showToast('Failed to copy URL', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    testRedirect() {
        const shortUrl = document.getElementById('shortUrl').textContent;
        
        if (!shortUrl) {
            this.showToast('No short URL to test', 'error');
            return;
        }

        // Open the short URL in a new tab to test the redirect
        window.open(shortUrl, '_blank');
        this.showToast('Opening redirect in new tab...', 'success');
        
        // Show loading while waiting for redirect and updating analytics
        this.showLoading(true);
        
        // Wait a moment for the redirect to happen, then refresh analytics
        setTimeout(() => {
            this.getRecentLinks();
        }, 1000);
    }

    resetForm() {
        document.getElementById('urlForm').reset();
        document.getElementById('resultContainer').style.display = 'none';
        document.getElementById('originalUrl').focus();
    }

    addToRecentLinks(data) {
        const linkData = {
            id: Date.now(),
            originalUrl: data.originalUrl,
            shortUrl: data.shortUrl,
            shortCode: data.shortCode,
            createdAt: new Date().toISOString(),
            clicks: 0
        };

        this.recentLinks.unshift(linkData);
        
        // Keep only last 10 links
        if (this.recentLinks.length > 10) {
            this.recentLinks = this.recentLinks.slice(0, 10);
        }
        
        localStorage.setItem('recentLinks', JSON.stringify(this.recentLinks));
        this.displayRecentLinks();
    }

    displayRecentLinks() {
        try {
            const linksList = document.getElementById('recentLinksList');

            if (this.recentLinks.length === 0) {
                linksList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-link"></i>
                        <p>No links created yet. Create your first short link above!</p>
                    </div>
                `;
                return;
            }

            // Security: Use safe DOM manipulation instead of innerHTML
            linksList.innerHTML = '';
            this.recentLinks.forEach(link => {
                const linkItem = document.createElement('div');
                linkItem.className = 'link-item';
                
                const linkInfo = document.createElement('div');
                linkInfo.className = 'link-info';
                
                const originalDiv = document.createElement('div');
                originalDiv.className = 'link-original';
                originalDiv.textContent = this.truncateUrl(link.originalUrl, 50);
                
                const shortDiv = document.createElement('div');
                shortDiv.className = 'link-short';
                shortDiv.textContent = `${window.location.origin}/${link.shortCode}`;
                
                linkInfo.appendChild(originalDiv);
                linkInfo.appendChild(shortDiv);
                
                const linkStats = document.createElement('div');
                linkStats.className = 'link-stats';
                
                const clicksSpan = document.createElement('span');
                clicksSpan.innerHTML = `<i class="fas fa-mouse-pointer"></i> ${link.clicks} clicks`;
                
                const dateSpan = document.createElement('span');
                dateSpan.innerHTML = `<i class="fas fa-calendar"></i> ${this.formatDate(link.createdAt)}`;
                
                const copyBtn = document.createElement('button');
                copyBtn.className = 'btn btn-copy btn-sm';
                copyBtn.title = 'Copy URL';
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                copyBtn.addEventListener('click', () => this.copyLinkToClipboard(`${window.location.origin}/${link.shortCode}`));
                
                const testBtn = document.createElement('button');
                testBtn.className = 'btn btn-test btn-sm';
                testBtn.title = 'Redirect';
                testBtn.innerHTML = '<i class="fas fa-external-link-alt"></i>';
                testBtn.addEventListener('click', () => this.testLinkRedirect(`${window.location.origin}/${link.shortCode}`));
                
                linkStats.appendChild(clicksSpan);
                linkStats.appendChild(dateSpan);
                linkStats.appendChild(copyBtn);
                linkStats.appendChild(testBtn);
                
                linkItem.appendChild(linkInfo);
                linkItem.appendChild(linkStats);
                linksList.appendChild(linkItem);
            });
            
            // Update analytics stats after displaying links
            this.updateAnalytics();
        } catch (err) {
            console.error('Error loading recent links:', err);
        }
    }

    updateAnalytics() {
        // Use API data for total counts
        const totalClicks = this.totalClicks || 0;
        const totalLinks = this.totalUrls || 0;
        
        // Calculate active links from recent links (links with clicks > 0)
        const activeLinks = this.recentLinks.filter(link => link.clicks > 0).length;

        document.getElementById('totalClicks').textContent = totalClicks;
        document.getElementById('totalLinks').textContent = totalLinks;
        document.getElementById('activeLinks').textContent = activeLinks;
    }


    copyLinkToClipboard(url) {
        this.copyToClipboard(url);
    }

    testLinkRedirect(url) {
        if (!url) {
            this.showToast('No URL to test', 'error');
            return;
        }

        // Open the short URL in a new tab to test the redirect
        window.open(url, '_blank');
        this.showToast('Testing redirect in new tab...', 'success');
        
        // Show loading while waiting for redirect and updating analytics
        this.showLoading(true);
        
        // Wait a moment for the redirect to happen, then refresh analytics
        setTimeout(() => {
            this.getRecentLinks();
        }, 1000);
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = show ? 'flex' : 'none';
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        // Security: Use safe DOM manipulation instead of innerHTML
        const iconElement = document.createElement('i');
        iconElement.className = `fas ${icon}`;
        
        const messageElement = document.createElement('span');
        messageElement.textContent = message; // This automatically escapes HTML
        
        toast.appendChild(iconElement);
        toast.appendChild(messageElement);
        container.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    isValidUrl(string) {
        try {
            const url = new URL(string);
            // Security: Only allow http and https protocols
            if (!['http:', 'https:'].includes(url.protocol)) {
                return false;
            }
            // Security: Block localhost and private IPs in production
            if (url.hostname === 'localhost' || 
                url.hostname === '127.0.0.1' || 
                url.hostname.startsWith('192.168.') ||
                url.hostname.startsWith('10.') ||
                url.hostname.startsWith('172.')) {
                return false;
            }
            return true;
        } catch (_) {
            return false;
        }
    }

    // Security: Sanitize HTML to prevent XSS
    sanitizeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Security: Escape HTML entities
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    truncateUrl(url, maxLength) {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        
        return date.toLocaleDateString();
    }
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    window.app = new URLShortener();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add some interactive animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards and other elements
    document.querySelectorAll('.feature-card, .stat-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add some utility functions for enhanced UX
const utils = {
    // Debounce function for input validation
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

};

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const form = document.getElementById('urlForm');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape to close result
    if (e.key === 'Escape') {
        const resultContainer = document.getElementById('resultContainer');
        if (resultContainer.style.display !== 'none') {
            window.app.resetForm();
        }
    }
});

// Add input validation with visual feedback
document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('originalUrl');
    
    if (urlInput) {
        const validateInput = utils.debounce((e) => {
            const url = e.target.value.trim();
            const isValid = url === '' || window.app.isValidUrl(url);
            
            if (url !== '') {
                urlInput.style.borderColor = isValid ? '#10b981' : '#ef4444';
            } else {
                urlInput.style.borderColor = '#e5e7eb';
            }
        }, 300);
        
        urlInput.addEventListener('input', validateInput);
    }
});
