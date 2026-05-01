document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('.star');
    const ratingText = document.querySelector('.rating-text');
    const ratingMessages = ['Mala — requiere atención', 'Regular — con problemas', 'Aceptable — normal', 'Buena — algunas observaciones', 'Excelente — sin problemas'];

    if (stars.length > 0) {
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                stars.forEach(s => {
                    s.classList.remove('active');
                    s.classList.remove('selected-bg');
                });

                for (let i = 0; i <= index; i++) {
                    stars[i].classList.add('active');
                }
                stars[index].classList.add('selected-bg');

                if (ratingText && ratingMessages[index]) {
                    ratingText.textContent = ratingMessages[index];
                }
            });
        });
    }

    const problemItems = document.querySelectorAll('.problem-item');
    if (problemItems.length > 0) {
        problemItems.forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('selected');
            });
        });
    }

    const showToast = (message) => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>✅</span> ${message}`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    };


    const defaultAlerts = [
        { id: '1', room: '412', title: 'Baño sucio', description: 'Reportado por huésped · con foto', time: 'hace 1 min', type: 'red' },
        { id: '2', room: '307', title: 'Mal olor', description: 'Calificación: 2/5 estrellas', time: 'hace 8 min', type: 'brown' },
        { id: '3', room: '215', title: 'Mantenimiento', description: 'Grifo con fuga reportado', time: 'hace 22 min', type: 'yellow' }
    ];

    const getStoredAlerts = () => {
        const alerts = localStorage.getItem('hotel_alerts');
        if (!alerts) {
            localStorage.setItem('hotel_alerts', JSON.stringify(defaultAlerts));
            return defaultAlerts;
        }
        return JSON.parse(alerts);
    };

    const saveAlert = (alert) => {
        const alerts = getStoredAlerts();
        alerts.unshift(alert);
        localStorage.setItem('hotel_alerts', JSON.stringify(alerts));
    };

    const removeAlert = (id) => {
        let alerts = getStoredAlerts();
        alerts = alerts.filter(a => a.id !== id);
        localStorage.setItem('hotel_alerts', JSON.stringify(alerts));
    };


    const btnSendReport = document.getElementById('btn-send-report');
    const descriptionBox = document.querySelector('.problem-description');

    if (btnSendReport) {
        btnSendReport.addEventListener('click', () => {
            btnSendReport.style.animation = 'pulse 0.4s';
            btnSendReport.innerHTML = 'Enviando...';


            let selectedProblems = [];
            let problemColor = 'red';

            document.querySelectorAll('.problem-item.selected').forEach((item, index) => {
                selectedProblems.push(item.querySelector('span:not(.icon)').textContent);
                if (index === 0) {
                    problemColor = item.getAttribute('data-color') || 'red';
                }
            });

            if (selectedProblems.length === 4) {
                problemColor = 'purple';
            }

            let problemTitle = selectedProblems.length > 0 ? selectedProblems.join(', ') : 'Observación general';
            let description = descriptionBox ? descriptionBox.value : '';

            const roomSelect = document.getElementById('room-select');
            const roomNumber = roomSelect ? roomSelect.value : '412';


            const newAlert = {
                id: Date.now().toString(),
                room: roomNumber,
                title: problemTitle,
                description: description || 'Reportado por huésped',
                time: 'hace un momento',
                type: problemColor
            };


            saveAlert(newAlert);

            setTimeout(() => {
                btnSendReport.style.animation = '';
                btnSendReport.innerHTML = '¡Reporte enviado!';
                btnSendReport.style.backgroundColor = '#4CAF50';

                showToast('Reporte enviado con éxito al hotel.');

                setTimeout(() => {
                    btnSendReport.innerHTML = 'Enviar reporte al hotel';
                    btnSendReport.style.backgroundColor = '';

                    problemItems.forEach(item => item.classList.remove('selected'));
                    if (descriptionBox) descriptionBox.value = '';
                }, 2000);
            }, 800);
        });
    }


    const alertListContainer = document.querySelector('.alert-list');
    const alertFilter = document.getElementById('alert-filter');

    const renderAlerts = (sortBy = 'recent') => {
        if (!alertListContainer) return;

        alertListContainer.innerHTML = '';
        let storedAlerts = getStoredAlerts();

        if (sortBy === 'priority') {
            storedAlerts.sort((a, b) => {
                const countA = a.title.split(',').length;
                const countB = b.title.split(',').length;
                return countB - countA;
            });
        } else if (sortBy === 'room') {
            storedAlerts.sort((a, b) => a.room.localeCompare(b.room));
        }


        storedAlerts.forEach(alert => {
            const alertHTML = `
                <div class="alert-item ${alert.type}" data-id="${alert.id}">
                    <div class="alert-dot"></div>
                    <div class="alert-content">
                        <h4>Hab. ${alert.room} — ${alert.title}</h4>
                        <p>${alert.description}</p>
                    </div>
                    <div class="alert-meta">
                        <span class="time">${alert.time}</span>
                        <button class="btn-resolve">Resolver</button>
                    </div>
                </div>
            `;
            alertListContainer.insertAdjacentHTML('beforeend', alertHTML);
        });
    };

    if (alertListContainer) {
        renderAlerts('recent');

        if (alertFilter) {
            alertFilter.addEventListener('change', (e) => {
                renderAlerts(e.target.value);
            });
        }
    }


    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('btn-resolve')) {
            const btnEl = e.target;
            btnEl.innerHTML = 'Resolviendo...';

            const alertItem = btnEl.closest('.alert-item');
            const alertId = alertItem.getAttribute('data-id');

            setTimeout(() => {
                btnEl.classList.add('success-anim');
                btnEl.innerHTML = 'Resuelto';
                showToast('Problema de habitacion resuelto.');

                if (alertId) {
                    removeAlert(alertId);
                }

                setTimeout(() => {
                    if (alertItem) {
                        alertItem.style.transition = 'opacity 0.4s, transform 0.4s';
                        alertItem.style.opacity = '0';
                        alertItem.style.transform = 'scale(0.95)';

                        setTimeout(() => {
                            alertItem.remove();
                        }, 400);
                    }
                }, 1000);
            }, 600);
        }
    });
});
